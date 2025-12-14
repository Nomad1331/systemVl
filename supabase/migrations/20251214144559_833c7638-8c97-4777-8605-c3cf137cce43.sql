-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can join public guilds" ON public.guild_members;

-- Create a new policy that allows:
-- 1. Guild masters to add themselves when creating a guild
-- 2. Users to join public guilds
-- 3. Users with pending invites to join invite-only guilds
CREATE POLICY "Users can join guilds"
ON public.guild_members
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND (
    -- User is the guild master (creator adding themselves)
    EXISTS (
      SELECT 1 FROM public.guilds
      WHERE id = guild_members.guild_id
      AND master_id = auth.uid()
    )
    -- OR guild is public (anyone can join)
    OR is_guild_public(guild_id)
    -- OR user has a pending invite
    OR EXISTS (
      SELECT 1 FROM guild_invites gi
      WHERE gi.guild_id = guild_members.guild_id
      AND gi.invitee_id = auth.uid()
      AND gi.status = 'pending'
    )
  )
);