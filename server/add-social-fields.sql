-- Agregar campos para modelo gratis con social media
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS subscription_mode VARCHAR(50) DEFAULT 'paypal' COMMENT 'paypal o free_social';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS require_follow_to_watch BOOLEAN DEFAULT FALSE;

-- Insertar valores por defecto si no existen
INSERT INTO site_settings (key, value) 
SELECT 'subscription_mode', 'paypal' 
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'subscription_mode');

INSERT INTO site_settings (key, value) 
SELECT 'instagram_url', '' 
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'instagram_url');

INSERT INTO site_settings (key, value) 
SELECT 'tiktok_url', '' 
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'tiktok_url');

INSERT INTO site_settings (key, value) 
SELECT 'require_follow_to_watch', 'false' 
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'require_follow_to_watch');
