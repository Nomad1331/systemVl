-- Create enum for supporter tiers
CREATE TYPE public.supporter_tier AS ENUM ('e_rank', 'd_rank', 'c_rank', 'b_rank', 'a_rank', 's_rank');

-- Create supporters table for Hall of Hunters
CREATE TABLE public.supporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hunter_name TEXT NOT NULL,
    tier supporter_tier NOT NULL DEFAULT 'e_rank',
    custom_title TEXT,
    custom_frame_id TEXT,
    ko_fi_username TEXT,
    discord_username TEXT,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create redemption codes table
CREATE TABLE public.redemption_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    supporter_id UUID REFERENCES public.supporters(id) ON DELETE CASCADE,
    tier supporter_tier NOT NULL,
    unlocks_badge BOOLEAN DEFAULT true,
    unlocks_frame TEXT,
    unlocks_title TEXT,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create custom frames table for supporter-exclusive frames
CREATE TABLE public.custom_frames (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    supporter_id UUID REFERENCES public.supporters(id) ON DELETE SET NULL,
    rarity TEXT DEFAULT 'legendary',
    image_url TEXT,
    is_supporter_exclusive BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_frames ENABLE ROW LEVEL SECURITY;

-- Public read access for supporters (Hall of Hunters is public)
CREATE POLICY "Supporters are publicly viewable"
ON public.supporters
FOR SELECT
USING (is_visible = true);

-- Public read access for custom frames
CREATE POLICY "Custom frames are publicly viewable"
ON public.custom_frames
FOR SELECT
USING (true);

-- Redemption codes: only allow reading active codes (for validation)
CREATE POLICY "Active codes can be validated"
ON public.redemption_codes
FOR SELECT
USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_supporters_updated_at
BEFORE UPDATE ON public.supporters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_supporters_tier ON public.supporters(tier);
CREATE INDEX idx_supporters_display_order ON public.supporters(display_order);
CREATE INDEX idx_redemption_codes_code ON public.redemption_codes(code);
CREATE INDEX idx_custom_frames_supporter ON public.custom_frames(supporter_id);