-- Drop the problematic RLS policy for guilds
DROP POLICY IF EXISTS "Public guilds are viewable by everyone" ON public.guilds;

-- Create new policy that allows:
-- 1. Public guilds visible to everyone
-- 2. Invite-only guilds visible to everyone (but can't join without invite)
-- 3. Guild creators can always see their guild
CREATE POLICY "Guilds are viewable based on access type"
ON public.guilds
FOR SELECT
USING (
  access_type IN ('public', 'invite_only') 
  OR auth.uid() = master_id 
  OR is_guild_member(auth.uid(), id)
);

-- Also update the INSERT policy to allow creating any access type
DROP POLICY IF EXISTS "Authenticated users can create guilds" ON public.guilds;

CREATE POLICY "Authenticated users can create guilds"
ON public.guilds
FOR INSERT
WITH CHECK (auth.uid() = master_id);