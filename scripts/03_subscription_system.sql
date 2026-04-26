-- Subscription System Tables and Policies
-- This migration adds pricing plans, subscriptions, content access rules, and quality options

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'free', 'basic', 'premium', 'pro'
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_annual DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  max_concurrent_streams INTEGER DEFAULT 1,
  max_quality TEXT DEFAULT '480p' CHECK (max_quality IN ('480p', '720p', '1080p', '4k')),
  max_downloads_per_day INTEGER DEFAULT 0, -- 0 = unlimited
  features JSONB DEFAULT '{}', -- Additional features as JSON
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create content_categories table
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create video_quality_options table
CREATE TABLE IF NOT EXISTS video_quality_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quality_level TEXT NOT NULL UNIQUE, -- '480p', '720p', '1080p', '4k'
  display_name TEXT NOT NULL,
  min_bandwidth_mbps DECIMAL(5, 2), -- Minimum bandwidth needed
  resolution TEXT, -- e.g., '854x480'
  bitrate_kbps INTEGER,
  file_format TEXT DEFAULT 'h264', -- h264, h265, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create content_access_rules table (subscription requirements)
CREATE TABLE IF NOT EXISTS content_access_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  required_plan_id UUID REFERENCES pricing_plans(id) ON DELETE CASCADE,
  is_trial_allowed BOOLEAN DEFAULT TRUE, -- Allow free trial users to watch
  is_free BOOLEAN DEFAULT FALSE, -- Free to all users
  min_age_restriction INTEGER DEFAULT 0,
  geo_restrictions TEXT[], -- Array of blocked countries (ISO codes)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, required_plan_id)
);

-- Modify content table to add category reference
ALTER TABLE content ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL;
ALTER TABLE content ADD COLUMN IF NOT EXISTS primary_quality TEXT DEFAULT '1080p' CHECK (primary_quality IN ('480p', '720p', '1080p', '4k'));
ALTER TABLE content ADD COLUMN IF NOT EXISTS is_free_to_watch BOOLEAN DEFAULT FALSE;

-- Create user_subscriptions table (replaces paypal_subscriptions for more general use)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'paused')),
  payment_method TEXT DEFAULT 'paypal' CHECK (payment_method IN ('paypal', 'stripe', 'credit_card', 'google_pay')),
  payment_id TEXT, -- PayPal subscription ID or Stripe subscription ID
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  renewal_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  cancel_reason TEXT,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription_history table for tracking changes
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'upgraded', 'downgraded', 'renewed', 'canceled')),
  old_plan_id UUID REFERENCES pricing_plans(id) ON DELETE SET NULL,
  new_plan_id UUID REFERENCES pricing_plans(id) ON DELETE SET NULL,
  action_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who made the change
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create watch_limits table (track concurrent streaming)
CREATE TABLE IF NOT EXISTS watch_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES pricing_plans(id),
  max_concurrent_streams INTEGER,
  current_streams INTEGER DEFAULT 0,
  last_checked TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_impersonation_sessions table
CREATE TABLE IF NOT EXISTS admin_impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  impersonated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  ended_at TIMESTAMP,
  reason TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create pricing_history table (track price changes)
CREATE TABLE IF NOT EXISTS pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES pricing_plans(id) ON DELETE CASCADE,
  old_price_monthly DECIMAL(10, 2),
  new_price_monthly DECIMAL(10, 2),
  old_price_annual DECIMAL(10, 2),
  new_price_annual DECIMAL(10, 2),
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_reason TEXT,
  effective_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires ON user_subscriptions(expires_at);
CREATE INDEX idx_content_access_content_id ON content_access_rules(content_id);
CREATE INDEX idx_content_access_plan_id ON content_access_rules(required_plan_id);
CREATE INDEX idx_content_category_id ON content(category_id);
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_pricing_history_plan_id ON pricing_history(plan_id);
CREATE INDEX idx_admin_impersonation_admin_id ON admin_impersonation_sessions(admin_id);
CREATE INDEX idx_admin_impersonation_user_id ON admin_impersonation_sessions(impersonated_user_id);

-- Enable RLS on new tables
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_quality_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_plans (public read)
CREATE POLICY "Anyone can view active pricing plans" ON pricing_plans
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can view all pricing plans" ON pricing_plans
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Admins can insert pricing plans" ON pricing_plans
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Admins can update pricing plans" ON pricing_plans
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for content_categories
CREATE POLICY "Anyone can view active categories" ON content_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can view all categories" ON content_categories
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Admins can manage categories" ON content_categories
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for video_quality_options
CREATE POLICY "Anyone can view active quality options" ON video_quality_options
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage quality options" ON video_quality_options
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for content_access_rules
CREATE POLICY "Users can view access rules for published content" ON content_access_rules
  FOR SELECT USING (
    content_id IN (SELECT id FROM content WHERE is_published = TRUE)
  );

CREATE POLICY "Admins can manage all access rules" ON content_access_rules
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for user_subscriptions (users can see their own)
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON user_subscriptions
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Admins can manage subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for subscription_history
CREATE POLICY "Users can view their subscription history" ON subscription_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscription history" ON subscription_history
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for watch_limits
CREATE POLICY "Users can view their watch limits" ON watch_limits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view watch limits" ON watch_limits
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for admin_impersonation_sessions
CREATE POLICY "Admins can view impersonation sessions" ON admin_impersonation_sessions
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Admins can create impersonation sessions" ON admin_impersonation_sessions
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for pricing_history
CREATE POLICY "Admins can view pricing history" ON pricing_history
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Insert default pricing plans
INSERT INTO pricing_plans (name, description, price_monthly, price_annual, max_concurrent_streams, max_quality, features, display_order)
VALUES
  (
    'free',
    'Free plan with limited access',
    0.00,
    0.00,
    1,
    '480p',
    '{"ads": true, "limited_catalog": true, "standard_def": true}',
    1
  ),
  (
    'basic',
    'Basic monthly subscription',
    9.99,
    NULL,
    1,
    '720p',
    '{"ads": false, "full_catalog": true, "hd": true, "mobile": true}',
    2
  ),
  (
    'premium',
    'Premium monthly subscription',
    14.99,
    NULL,
    2,
    '1080p',
    '{"ads": false, "full_catalog": true, "hd": true, "full_hd": true, "mobile": true, "downloads": true}',
    3
  ),
  (
    'pro',
    'Professional annual subscription',
    NULL,
    149.99,
    4,
    '4k',
    '{"ads": false, "full_catalog": true, "4k": true, "dolby_atmos": true, "mobile": true, "downloads": true, "family": true}',
    4
  )
ON CONFLICT DO NOTHING;

-- Insert video quality options
INSERT INTO video_quality_options (quality_level, display_name, min_bandwidth_mbps, resolution, bitrate_kbps)
VALUES
  ('480p', 'SD (480p)', 1.5, '854x480', 500),
  ('720p', 'HD (720p)', 3.0, '1280x720', 2500),
  ('1080p', 'Full HD (1080p)', 5.0, '1920x1080', 5000),
  ('4k', '4K Ultra HD (4K)', 15.0, '3840x2160', 15000)
ON CONFLICT DO NOTHING;

-- Create function to check if user has access to content
CREATE OR REPLACE FUNCTION user_has_content_access(p_user_id UUID, p_content_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
  v_user_role TEXT;
  v_subscription_status TEXT;
  v_required_plan UUID;
BEGIN
  -- Check if user is admin (always has access)
  SELECT role INTO v_user_role FROM users WHERE id = p_user_id;
  IF v_user_role = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Check if content is free
  IF EXISTS (
    SELECT 1 FROM content_access_rules 
    WHERE content_id = p_content_id AND is_free = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if content requires a subscription
  SELECT required_plan_id INTO v_required_plan
  FROM content_access_rules
  WHERE content_id = p_content_id
  LIMIT 1;

  -- If no access rule found, assume it's free
  IF v_required_plan IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if user has active subscription for required plan
  SELECT status INTO v_subscription_status
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND plan_id = v_required_plan
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  RETURN v_subscription_status IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_active_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name TEXT,
  status TEXT,
  expires_at TIMESTAMP,
  max_quality TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    pp.name,
    us.status,
    us.expires_at,
    pp.max_quality
  FROM user_subscriptions us
  JOIN pricing_plans pp ON us.plan_id = pp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > NOW())
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
