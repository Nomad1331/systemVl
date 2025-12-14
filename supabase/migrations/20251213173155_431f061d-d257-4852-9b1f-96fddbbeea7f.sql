-- Fix infinite recursion by creating security definer functions

-- Function to check if user is a guild member
CREATE OR REPLACE FUNCTION public.is_guild_member(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE user_id = _user_id AND guild_id = _guild_id
  )
$$;

-- Function to check if user has guild leadership role
CREATE OR REPLACE FUNCTION public.is_guild_leader(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE user_id = _user_id 
      AND guild_id = _guild_id 
      AND role IN ('guild_master', 'vice_master')
  )
$$;

-- Function to check if user has any leadership role in a guild
CREATE OR REPLACE FUNCTION public.is_guild_elite_or_higher(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE user_id = _user_id 
      AND guild_id = _guild_id 
      AND role IN ('guild_master', 'vice_master', 'elite')
  )
$$;

-- Function to check if guild is public
CREATE OR REPLACE FUNCTION public.is_guild_public(_guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guilds
    WHERE id = _guild_id AND access_type = 'public'
  )
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Guild members viewable by guild members" ON public.guild_members;
DROP POLICY IF EXISTS "Leaders can update member roles" ON public.guild_members;
DROP POLICY IF EXISTS "Users can join public guilds" ON public.guild_members;
DROP POLICY IF EXISTS "Users can leave guild" ON public.guild_members;

-- Recreate policies using security definer functions
CREATE POLICY "Guild members viewable by guild members" 
ON public.guild_members FOR SELECT
USING (
  public.is_guild_member(auth.uid(), guild_id) 
  OR public.is_guild_public(guild_id)
);

CREATE POLICY "Leaders can update member roles" 
ON public.guild_members FOR UPDATE
USING (public.is_guild_leader(auth.uid(), guild_id));

CREATE POLICY "Users can join public guilds" 
ON public.guild_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND (
    public.is_guild_public(guild_id)
    OR EXISTS (
      SELECT 1 FROM public.guild_invites gi
      WHERE gi.guild_id = guild_members.guild_id 
        AND gi.invitee_id = auth.uid() 
        AND gi.status = 'pending'
    )
  )
);

CREATE POLICY "Users can leave guild" 
ON public.guild_members FOR DELETE
USING (
  auth.uid() = user_id 
  OR public.is_guild_leader(auth.uid(), guild_id)
);

-- Fix guild_messages policies
DROP POLICY IF EXISTS "Guild members can send messages" ON public.guild_messages;
DROP POLICY IF EXISTS "Guild members can view messages" ON public.guild_messages;

CREATE POLICY "Guild members can send messages" 
ON public.guild_messages FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_guild_member(auth.uid(), guild_id));

CREATE POLICY "Guild members can view messages" 
ON public.guild_messages FOR SELECT
USING (public.is_guild_member(auth.uid(), guild_id));

-- Fix guilds SELECT policy
DROP POLICY IF EXISTS "Public guilds are viewable by everyone" ON public.guilds;

CREATE POLICY "Public guilds are viewable by everyone" 
ON public.guilds FOR SELECT
USING (
  access_type = 'public' 
  OR public.is_guild_member(auth.uid(), id)
);

-- Fix guild_invites INSERT policy
DROP POLICY IF EXISTS "Guild leaders can create invites" ON public.guild_invites;

CREATE POLICY "Guild leaders can create invites" 
ON public.guild_invites FOR INSERT
WITH CHECK (
  auth.uid() = inviter_id 
  AND public.is_guild_elite_or_higher(auth.uid(), guild_id)
);

-- ============================================
-- GUILD WEEKLY CHALLENGES
-- ============================================

CREATE TABLE public.guild_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL DEFAULT 100,
  current_value INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 500,
  reward_gold INTEGER NOT NULL DEFAULT 100,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.guild_challenge_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.guild_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  contribution INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.guild_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_challenge_contributions ENABLE ROW LEVEL SECURITY;

-- Guild challenges policies
CREATE POLICY "Guild members can view challenges"
ON public.guild_challenges FOR SELECT
USING (public.is_guild_member(auth.uid(), guild_id));

CREATE POLICY "Guild leaders can create challenges"
ON public.guild_challenges FOR INSERT
WITH CHECK (public.is_guild_leader(auth.uid(), guild_id));

CREATE POLICY "Guild leaders can update challenges"
ON public.guild_challenges FOR UPDATE
USING (public.is_guild_leader(auth.uid(), guild_id));

CREATE POLICY "Guild leaders can delete challenges"
ON public.guild_challenges FOR DELETE
USING (public.is_guild_leader(auth.uid(), guild_id));

-- Challenge contributions policies
CREATE POLICY "Members can view contributions"
ON public.guild_challenge_contributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guild_challenges gc
    WHERE gc.id = challenge_id AND public.is_guild_member(auth.uid(), gc.guild_id)
  )
);

CREATE POLICY "Members can contribute"
ON public.guild_challenge_contributions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.guild_challenges gc
    WHERE gc.id = challenge_id AND public.is_guild_member(auth.uid(), gc.guild_id)
  )
);

CREATE POLICY "Members can update own contributions"
ON public.guild_challenge_contributions FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- FRIEND SYSTEM
-- ============================================

CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');

CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE TABLE public.streak_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL,
  challenged_id UUID NOT NULL,
  challenger_streak INTEGER NOT NULL DEFAULT 0,
  challenged_streak INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (challenger_id != challenged_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_duels ENABLE ROW LEVEL SECURITY;

-- Friendship policies
CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their friendships"
ON public.friendships FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their friendships"
ON public.friendships FOR DELETE
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Streak duel policies
CREATE POLICY "Users can view their duels"
ON public.streak_duels FOR SELECT
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can create duels"
ON public.streak_duels FOR INSERT
WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Participants can update duels"
ON public.streak_duels FOR UPDATE
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

-- Create indexes for performance
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_streak_duels_challenger ON public.streak_duels(challenger_id);
CREATE INDEX idx_streak_duels_challenged ON public.streak_duels(challenged_id);
CREATE INDEX idx_guild_challenges_guild ON public.guild_challenges(guild_id);
CREATE INDEX idx_guild_challenge_contributions_challenge ON public.guild_challenge_contributions(challenge_id);