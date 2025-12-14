-- Phase 1: Authentication System + Cloud Player Profiles

-- 1. Create user roles enum and table (for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  hunter_name TEXT NOT NULL DEFAULT 'Hunter',
  avatar TEXT DEFAULT 'default',
  title TEXT DEFAULT 'Awakened Hunter',
  discord_id TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Create player_stats table (cloud version of localStorage stats)
CREATE TABLE public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  rank TEXT NOT NULL DEFAULT 'E-Rank',
  strength INTEGER NOT NULL DEFAULT 10,
  agility INTEGER NOT NULL DEFAULT 10,
  intelligence INTEGER NOT NULL DEFAULT 10,
  vitality INTEGER NOT NULL DEFAULT 10,
  sense INTEGER NOT NULL DEFAULT 10,
  available_points INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 0,
  gems INTEGER NOT NULL DEFAULT 0,
  credits INTEGER NOT NULL DEFAULT 0,
  selected_card_frame TEXT DEFAULT 'default',
  unlocked_card_frames TEXT[] DEFAULT ARRAY['default'],
  unlocked_classes TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- RLS for player_stats
CREATE POLICY "Users can view public player stats"
ON public.player_stats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = player_stats.user_id 
    AND profiles.is_public = true
  )
);

CREATE POLICY "Users can view their own stats"
ON public.player_stats FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.player_stats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.player_stats FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Create trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at
BEFORE UPDATE ON public.player_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, hunter_name, avatar, title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'hunter_name', 'Hunter'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar', 'default'),
    'Awakened Hunter'
  );
  
  -- Create player stats
  INSERT INTO public.player_stats (user_id)
  VALUES (NEW.id);
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();