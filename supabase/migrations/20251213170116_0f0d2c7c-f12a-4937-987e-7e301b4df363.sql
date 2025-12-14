-- Create guild_role enum
CREATE TYPE public.guild_role AS ENUM ('guild_master', 'vice_master', 'elite', 'member');

-- Create guild_access_type enum
CREATE TYPE public.guild_access_type AS ENUM ('public', 'private', 'invite_only');

-- Create guilds table
CREATE TABLE public.guilds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emblem TEXT DEFAULT 'default',
  access_type guild_access_type NOT NULL DEFAULT 'public',
  max_members INTEGER NOT NULL DEFAULT 50,
  master_id UUID NOT NULL,
  total_power INTEGER NOT NULL DEFAULT 0,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guild_members table
CREATE TABLE public.guild_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role guild_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contribution_xp INTEGER NOT NULL DEFAULT 0,
  UNIQUE(guild_id, user_id),
  UNIQUE(user_id) -- User can only be in one guild
);

-- Create guild_messages table for chat
CREATE TABLE public.guild_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guild_invites table
CREATE TABLE public.guild_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL,
  invitee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(guild_id, invitee_id)
);

-- Enable RLS on all guild tables
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_invites ENABLE ROW LEVEL SECURITY;

-- Guilds RLS Policies
CREATE POLICY "Public guilds are viewable by everyone"
ON public.guilds FOR SELECT
USING (access_type = 'public' OR EXISTS (
  SELECT 1 FROM guild_members WHERE guild_members.guild_id = guilds.id AND guild_members.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can create guilds"
ON public.guilds FOR INSERT
WITH CHECK (auth.uid() = master_id);

CREATE POLICY "Guild master can update guild"
ON public.guilds FOR UPDATE
USING (auth.uid() = master_id);

CREATE POLICY "Guild master can delete guild"
ON public.guilds FOR DELETE
USING (auth.uid() = master_id);

-- Guild Members RLS Policies
CREATE POLICY "Guild members viewable by guild members"
ON public.guild_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM guild_members gm WHERE gm.guild_id = guild_members.guild_id AND gm.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM guilds g WHERE g.id = guild_members.guild_id AND g.access_type = 'public'
));

CREATE POLICY "Users can join public guilds"
ON public.guild_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (SELECT 1 FROM guilds g WHERE g.id = guild_id AND g.access_type = 'public')
    OR EXISTS (SELECT 1 FROM guild_invites gi WHERE gi.guild_id = guild_id AND gi.invitee_id = auth.uid() AND gi.status = 'pending')
  )
);

CREATE POLICY "Users can leave guild"
ON public.guild_members FOR DELETE
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM guild_members gm WHERE gm.guild_id = guild_members.guild_id 
  AND gm.user_id = auth.uid() AND gm.role IN ('guild_master', 'vice_master')
));

CREATE POLICY "Leaders can update member roles"
ON public.guild_members FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM guild_members gm WHERE gm.guild_id = guild_members.guild_id 
  AND gm.user_id = auth.uid() AND gm.role IN ('guild_master', 'vice_master')
));

-- Guild Messages RLS Policies
CREATE POLICY "Guild members can view messages"
ON public.guild_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_messages.guild_id AND guild_members.user_id = auth.uid()
));

CREATE POLICY "Guild members can send messages"
ON public.guild_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_messages.guild_id AND guild_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own messages"
ON public.guild_messages FOR DELETE
USING (auth.uid() = user_id);

-- Guild Invites RLS Policies
CREATE POLICY "Users can view their invites"
ON public.guild_invites FOR SELECT
USING (auth.uid() = invitee_id OR auth.uid() = inviter_id);

CREATE POLICY "Guild leaders can create invites"
ON public.guild_invites FOR INSERT
WITH CHECK (
  auth.uid() = inviter_id AND EXISTS (
    SELECT 1 FROM guild_members gm WHERE gm.guild_id = guild_id 
    AND gm.user_id = auth.uid() AND gm.role IN ('guild_master', 'vice_master', 'elite')
  )
);

CREATE POLICY "Invitee can update invite status"
ON public.guild_invites FOR UPDATE
USING (auth.uid() = invitee_id);

CREATE POLICY "Inviter or invitee can delete invite"
ON public.guild_invites FOR DELETE
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Enable realtime for guild messages
ALTER PUBLICATION supabase_realtime ADD TABLE guild_messages;
ALTER TABLE public.guild_messages REPLICA IDENTITY FULL;

-- Create trigger for updated_at on guilds
CREATE TRIGGER update_guilds_updated_at
BEFORE UPDATE ON public.guilds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update guild total power
CREATE OR REPLACE FUNCTION public.update_guild_power()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _guild_id UUID;
  _total_power INTEGER;
BEGIN
  -- Get the guild_id from either the new or old record
  _guild_id := COALESCE(NEW.guild_id, OLD.guild_id);
  
  -- Calculate total power from all members' stats
  SELECT COALESCE(SUM(ps.strength + ps.agility + ps.intelligence + ps.vitality + ps.sense), 0)
  INTO _total_power
  FROM guild_members gm
  JOIN player_stats ps ON ps.user_id = gm.user_id
  WHERE gm.guild_id = _guild_id;
  
  -- Update the guild's total power
  UPDATE guilds SET total_power = _total_power WHERE id = _guild_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update guild power when members change
CREATE TRIGGER update_guild_power_on_member_change
AFTER INSERT OR DELETE ON public.guild_members
FOR EACH ROW
EXECUTE FUNCTION public.update_guild_power();