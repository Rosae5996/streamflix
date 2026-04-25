-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'es' CHECK (preferred_language IN ('es', 'en', 'fr', 'pt'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

-- Add new columns to content table for better classification
ALTER TABLE content ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE content ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';
ALTER TABLE content ADD COLUMN IF NOT EXISTS imdb_id TEXT UNIQUE;
ALTER TABLE content ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE content ADD COLUMN IF NOT EXISTS age_restriction INTEGER DEFAULT 0;
ALTER TABLE content ADD COLUMN IF NOT EXISTS number_of_seasons INTEGER;
ALTER TABLE content ADD COLUMN IF NOT EXISTS episode_count INTEGER;
ALTER TABLE content ADD COLUMN IF NOT EXISTS production_company TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2);
ALTER TABLE content ADD COLUMN IF NOT EXISTS revenue DECIMAL(12, 2);

-- Temporary admin credentials table
CREATE TABLE IF NOT EXISTS temp_admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  temporary_password TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Global site settings table (enhanced)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  data_type TEXT DEFAULT 'string' CHECK (data_type IN ('string', 'boolean', 'number', 'json')),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Site branding table
CREATE TABLE IF NOT EXISTS site_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT NOT NULL,
  site_description TEXT,
  site_logo_url TEXT,
  site_favicon_url TEXT,
  primary_color TEXT DEFAULT '#0066cc',
  secondary_color TEXT DEFAULT '#f0f0f0',
  font_family TEXT DEFAULT 'sans-serif',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Site translations/localization
CREATE TABLE IF NOT EXISTS site_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code TEXT NOT NULL CHECK (language_code IN ('es', 'en', 'fr', 'pt')),
  translation_key TEXT NOT NULL,
  translation_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(language_code, translation_key)
);

-- Content audit log for tracking changes
CREATE TABLE IF NOT EXISTS content_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH')),
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changes_json JSONB,
  previous_values JSONB,
  new_values JSONB,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT
);

-- User settings for preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'es',
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_temp_admin_email ON temp_admin_credentials(email);
CREATE INDEX idx_temp_admin_expires ON temp_admin_credentials(expires_at);
CREATE INDEX idx_content_audit_content_id ON content_audit_log(content_id);
CREATE INDEX idx_content_audit_created_at ON content_audit_log(created_at);
CREATE INDEX idx_site_translations_language ON site_translations(language_code);
CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token ON email_verification_tokens(token);

-- Enable RLS for new tables
ALTER TABLE temp_admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for temp_admin_credentials
CREATE POLICY "Admins can view temp admin credentials" ON temp_admin_credentials
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view public settings" ON site_settings
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Admins can view all settings" ON site_settings
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "Admins can update settings" ON site_settings
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for site_branding
CREATE POLICY "Anyone can view branding" ON site_branding
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can update branding" ON site_branding
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for translations
CREATE POLICY "Anyone can view translations" ON site_translations
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage translations" ON site_translations
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for content_audit_log
CREATE POLICY "Admins can view audit logs" ON content_audit_log
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email_verification_tokens
CREATE POLICY "Users can view own verification tokens" ON email_verification_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Insert default site branding
INSERT INTO site_branding (site_title, site_description, primary_color, secondary_color) VALUES
('StreamFlix', 'Tu plataforma de streaming premium', '#0066cc', '#f0f0f0')
ON CONFLICT DO NOTHING;

-- Insert default translations
INSERT INTO site_translations (language_code, translation_key, translation_value) VALUES
-- Spanish
('es', 'welcome_title', 'Bienvenido a StreamFlix'),
('es', 'welcome_description', 'Tu plataforma de streaming premium'),
('es', 'login', 'Iniciar Sesión'),
('es', 'register', 'Registrarse'),
('es', 'logout', 'Cerrar Sesión'),
('es', 'profile', 'Perfil'),
('es', 'settings', 'Configuración'),
('es', 'change_password', 'Cambiar Contraseña'),
('es', 'change_email', 'Cambiar Email'),
-- English
('en', 'welcome_title', 'Welcome to StreamFlix'),
('en', 'welcome_description', 'Your premium streaming platform'),
('en', 'login', 'Login'),
('en', 'register', 'Sign Up'),
('en', 'logout', 'Logout'),
('en', 'profile', 'Profile'),
('en', 'settings', 'Settings'),
('en', 'change_password', 'Change Password'),
('en', 'change_email', 'Change Email'),
-- French
('fr', 'welcome_title', 'Bienvenue sur StreamFlix'),
('fr', 'welcome_description', 'Votre plateforme de streaming premium'),
('fr', 'login', 'Connexion'),
('fr', 'register', "S'inscrire"),
('fr', 'logout', 'Déconnexion'),
('fr', 'profile', 'Profil'),
('fr', 'settings', 'Paramètres'),
('fr', 'change_password', 'Changer le mot de passe'),
('fr', 'change_email', 'Changer l''email'),
-- Portuguese
('pt', 'welcome_title', 'Bem-vindo ao StreamFlix'),
('pt', 'welcome_description', 'Sua plataforma de streaming premium'),
('pt', 'login', 'Entrar'),
('pt', 'register', 'Registrar-se'),
('pt', 'logout', 'Sair'),
('pt', 'profile', 'Perfil'),
('pt', 'settings', 'Configurações'),
('pt', 'change_password', 'Alterar Senha'),
('pt', 'change_email', 'Alterar Email')
ON CONFLICT DO NOTHING;
