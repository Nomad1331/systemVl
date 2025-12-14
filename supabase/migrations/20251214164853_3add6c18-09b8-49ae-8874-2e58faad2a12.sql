-- Update guild_invites default expiry to 48 hours instead of 7 days
ALTER TABLE public.guild_invites 
ALTER COLUMN expires_at SET DEFAULT (now() + '48 hours'::interval);

-- Add index for efficient expired invite cleanup
CREATE INDEX IF NOT EXISTS idx_guild_invites_expires_at ON public.guild_invites(expires_at);

-- Allow guild leaders to delete/revoke pending invites they sent
DROP POLICY IF EXISTS "Inviter or invitee can delete invite" ON public.guild_invites;

CREATE POLICY "Users can delete their invites" 
ON public.guild_invites 
FOR DELETE 
USING (
  auth.uid() = inviter_id OR 
  auth.uid() = invitee_id OR 
  is_guild_leader(auth.uid(), guild_id)
);