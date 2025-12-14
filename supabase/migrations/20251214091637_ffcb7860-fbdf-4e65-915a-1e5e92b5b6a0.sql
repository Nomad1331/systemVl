-- Add reward_pool column to streak_duels
ALTER TABLE public.streak_duels 
ADD COLUMN IF NOT EXISTS reward_pool INTEGER NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS last_pool_update DATE DEFAULT CURRENT_DATE;

-- Add comment explaining the mechanic
COMMENT ON COLUMN public.streak_duels.reward_pool IS 'XP reward pool that grows by 3 XP each day the duel is active. Winner takes all when opponent breaks streak.';
COMMENT ON COLUMN public.streak_duels.last_pool_update IS 'Last date the reward pool was updated for daily XP increment.';