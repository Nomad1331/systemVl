-- Create user_quests table for cloud sync of daily quests
CREATE TABLE public.user_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quests JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_habits table for cloud sync of habits
CREATE TABLE public.user_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habits JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_gates table for cloud sync of gates
CREATE TABLE public.user_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gates JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_streaks table for cloud sync of streak data
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completion_date DATE,
  total_rewards INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_challenges table for cloud sync of challenges and necromancer data
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
  necro_challenge JSONB,
  claimed_challenges JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  active_boost JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_quests
CREATE POLICY "Users can view their own quests"
ON public.user_quests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quests"
ON public.user_quests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests"
ON public.user_quests FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_habits
CREATE POLICY "Users can view their own habits"
ON public.user_habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
ON public.user_habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON public.user_habits FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_gates
CREATE POLICY "Users can view their own gates"
ON public.user_gates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gates"
ON public.user_gates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gates"
ON public.user_gates FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_streaks
CREATE POLICY "Users can view their own streaks"
ON public.user_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
ON public.user_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.user_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenges"
ON public.user_challenges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges"
ON public.user_challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
ON public.user_challenges FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_user_quests_updated_at
BEFORE UPDATE ON public.user_quests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_habits_updated_at
BEFORE UPDATE ON public.user_habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_gates_updated_at
BEFORE UPDATE ON public.user_gates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at
BEFORE UPDATE ON public.user_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();