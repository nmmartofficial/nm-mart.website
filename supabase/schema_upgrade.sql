-- Create admin_config table
CREATE TABLE IF NOT EXISTS public.admin_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create website_banners table
CREATE TABLE IF NOT EXISTS public.website_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    link TEXT,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT,
    bg_color TEXT DEFAULT '#FFFFFF',
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for admin_config (Allow public select for login check)
CREATE POLICY "Allow Public Read admin_config" ON public.admin_config
    FOR SELECT USING (true);

-- Policies for website_banners (Public read, Admin all)
CREATE POLICY "Allow Public Read banners" ON public.website_banners
    FOR SELECT USING (true);
CREATE POLICY "Allow Admin All banners" ON public.website_banners
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for categories (Public read, Admin all)
CREATE POLICY "Allow Public Read categories" ON public.categories
    FOR SELECT USING (true);
CREATE POLICY "Allow Admin All categories" ON public.categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add sample admin (password: nm-mart-admin-2024)
-- Note: In a real app, use a proper hash. For this project, we'll use simple check or Supabase Auth.
-- But user requested admin_config table password check.
INSERT INTO public.admin_config (username, password_hash)
VALUES ('admin', 'nm-mart-admin-2024')
ON CONFLICT (username) DO NOTHING;
