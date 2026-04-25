-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'premium_annual')),
  subscription_expires_at TIMESTAMP,
  subscription_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create content table (movies and series)
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
  genre TEXT[], -- Array of genres
  rating DECIMAL(2,1), -- 0-10 rating
  duration_minutes INTEGER, -- For movies
  release_year INTEGER,
  director TEXT,
  cast TEXT[], -- Array of actors
  thumbnail_url TEXT, -- Cloudflare R2 URL
  video_url TEXT, -- Cloudflare R2 URL
  trailer_url TEXT, -- Cloudflare R2 URL
  section_category TEXT, -- 'trending', 'new', 'recommended', etc.
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sections table for custom categories
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create section_content junction table (many-to-many)
CREATE TABLE IF NOT EXISTS section_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(section_id, content_id)
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create paypal_subscriptions table
CREATE TABLE IF NOT EXISTS paypal_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  paypal_subscription_id TEXT UNIQUE,
  paypal_order_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
  status TEXT DEFAULT 'ACTIVE',
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create viewing_history table
CREATE TABLE IF NOT EXISTS viewing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  watched_at TIMESTAMP DEFAULT NOW(),
  last_position_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_section ON content(section_category);
CREATE INDEX idx_content_is_published ON content(is_published);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_viewing_history_user ON viewing_history(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_paypal_user ON paypal_subscriptions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- RLS Policies for content table (public read for published)
CREATE POLICY "Anyone can view published content" ON content
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can view all content" ON content
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can insert content" ON content
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update content" ON content
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can delete content" ON content
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- RLS Policies for sections table (public read)
CREATE POLICY "Anyone can view active sections" ON sections
  FOR SELECT USING (is_active = TRUE);

-- RLS Policies for admin_settings (admins only)
CREATE POLICY "Admins can view settings" ON admin_settings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings" ON admin_settings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- RLS Policies for viewing_history (users own data)
CREATE POLICY "Users can view own history" ON viewing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON viewing_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for favorites (users own data)
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for paypal_subscriptions (users and admins)
CREATE POLICY "Users can view own subscriptions" ON paypal_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON paypal_subscriptions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('site_title', 'StreamFlix', 'Main site title'),
('site_description', 'Your Premium Streaming Platform', 'Site description for SEO')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default sections
INSERT INTO sections (name, slug, description, display_order, is_active) VALUES
('Trending Now', 'trending', 'Most watched content right now', 1, TRUE),
('New Releases', 'new-releases', 'Recently added content', 2, TRUE),
('Recommended For You', 'recommended', 'Personalized recommendations', 3, TRUE),
('Top Movies', 'top-movies', 'Best rated movies', 4, TRUE),
('Top Series', 'top-series', 'Best rated series', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;
