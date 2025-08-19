-- Update Auth Settings Migration
-- Sets correct redirect URLs for Lovable preview
-- DIRECT LOVABLE COMPATIBILITY - SQL only

-- Update auth.config settings
UPDATE auth.config 
SET 
  site_url = 'https://preview--scailup.lovable.app',
  additional_redirect_urls = ARRAY[
    'https://preview--scailup.lovable.app/wachtwoord-nieuw',
    'https://preview--scailup.lovable.app/sales-agent/onboarding',
    'https://preview--scailup.lovable.app/login',
    'https://preview--scailup.lovable.app/registreer'
  ],
  jwt_expiry = 3600,
  refresh_token_rotation_enabled = true,
  security_update_password_require_reauthentication = true
WHERE id = 1;

-- If no config exists, create it
INSERT INTO auth.config (
  id,
  site_url,
  additional_redirect_urls,
  jwt_expiry,
  refresh_token_rotation_enabled,
  security_update_password_require_reauthentication
) VALUES (
  1,
  'https://preview--scailup.lovable.app',
  ARRAY[
    'https://preview--scailup.lovable.app/wachtwoord-nieuw',
    'https://preview--scailup.lovable.app/sales-agent/onboarding',
    'https://preview--scailup.lovable.app/login',
    'https://preview--scailup.lovable.app/registreer'
  ],
  3600,
  true,
  true
) ON CONFLICT (id) DO NOTHING; 