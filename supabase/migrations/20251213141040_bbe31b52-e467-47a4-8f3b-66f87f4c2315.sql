-- Add weekly_xp column to player_stats table
ALTER TABLE public.player_stats 
ADD COLUMN IF NOT EXISTS weekly_xp integer NOT NULL DEFAULT 0;

-- Add week_start_date to track when the current week started
ALTER TABLE public.player_stats 
ADD COLUMN IF NOT EXISTS week_start_date date DEFAULT CURRENT_DATE;

-- Create function to reset weekly XP every Monday at midnight UTC
CREATE OR REPLACE FUNCTION public.reset_weekly_xp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.player_stats
  SET weekly_xp = 0,
      week_start_date = CURRENT_DATE
  WHERE week_start_date < date_trunc('week', CURRENT_DATE);
END;
$$;

-- Create function to add XP that also updates weekly_xp
CREATE OR REPLACE FUNCTION public.add_player_xp(
  _user_id uuid,
  _xp_amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First check if we need to reset weekly XP (new week started)
  UPDATE public.player_stats
  SET weekly_xp = 0,
      week_start_date = CURRENT_DATE
  WHERE user_id = _user_id
    AND week_start_date < date_trunc('week', CURRENT_DATE);
    
  -- Then add the XP to both total and weekly
  UPDATE public.player_stats
  SET total_xp = total_xp + _xp_amount,
      weekly_xp = weekly_xp + _xp_amount
  WHERE user_id = _user_id;
END;
$$;