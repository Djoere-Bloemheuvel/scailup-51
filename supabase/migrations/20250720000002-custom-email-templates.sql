-- Custom Email Templates Migration
-- Updates Supabase auth email templates with ScailUp branding
-- DIRECT LOVABLE COMPATIBILITY - SQL only

-- Update password reset email template with ScailUp branding
UPDATE auth.config 
SET 
  mailer_autoconfirm = false,
  mailer_secure_email_change_enabled = true,
  smtp_admin_email = 'noreply@scailup.io',
  smtp_host = 'smtp.resend.com',
  smtp_port = 587,
  smtp_user = 'noreply@scailup.io',
  smtp_pass = 're_1234567890abcdef', -- Replace with actual Resend API key
  smtp_sender_name = 'ScailUp',
  smtp_max_frequency = 60,
  mailer_urlpatterns_invite = 'https://preview--scailup.lovable.app/auth/confirm',
  mailer_urlpatterns_confirmation = 'https://preview--scailup.lovable.app/auth/confirm',
  mailer_urlpatterns_recovery = 'https://preview--scailup.lovable.app/wachtwoord-nieuw',
  mailer_urlpatterns_email_change = 'https://preview--scailup.lovable.app/auth/confirm',
  mailer_urlpatterns_magic_link = 'https://preview--scailup.lovable.app/sales-agent/onboarding',
  mailer_subject_invite = 'Uitnodiging voor ScailUp - AI Sales Agent Platform',
  mailer_subject_confirmation = 'Bevestig je ScailUp account',
  mailer_subject_recovery = 'Wachtwoord reset voor je ScailUp account',
  mailer_subject_email_change = 'E-mailadres wijziging bevestiging',
  mailer_subject_magic_link = 'Login link voor ScailUp',
  mailer_template_invite = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Uitnodiging ScailUp</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 ScailUp</div>
            <h1>Welkom bij ScailUp!</h1>
            <p>Je bent uitgenodigd om je AI Sales Agent te activeren</p>
        </div>
        <div class="content">
            <h2>Hallo!</h2>
            <p>Je bent uitgenodigd om deel te nemen aan ScailUp - het platform dat je sales proces automatiseert met AI.</p>
            <p>Klik op de onderstaande knop om je account te activeren en te beginnen met het automatiseren van je sales outreach:</p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Account Activeren</a>
            </div>
            <p><strong>Wat kun je verwachten?</strong></p>
            <ul>
                <li>🤖 AI-gegenereerde outreach berichten</li>
                <li>📊 Geautomatiseerde lead scoring</li>
                <li>📈 Verhoogde conversie rates</li>
                <li>⏰ Tijdbesparende automatisering</li>
            </ul>
            <p>Deze link is 24 uur geldig. Als je problemen ondervindt, neem dan contact op met ons support team.</p>
        </div>
        <div class="footer">
            <p>© 2024 ScailUp. Alle rechten voorbehouden.</p>
            <p>Deze e-mail is verzonden naar {{ .Email }}</p>
        </div>
    </div>
</body>
</html>',
  mailer_template_confirmation = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bevestig je ScailUp account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 ScailUp</div>
            <h1>Bevestig je account</h1>
            <p>Klaar om je sales te automatiseren?</p>
        </div>
        <div class="content">
            <h2>Welkom bij ScailUp!</h2>
            <p>Bedankt voor je registratie! Om je account te activeren en te beginnen met het automatiseren van je sales proces, klik op de onderstaande knop:</p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Account Bevestigen</a>
            </div>
            <p><strong>Na bevestiging kun je:</strong></p>
            <ul>
                <li>🎯 Je AI Sales Agent configureren</li>
                <li>📧 Automatische outreach campagnes opzetten</li>
                <li>📊 Je resultaten monitoren</li>
                <li>🚀 Je sales performance verbeteren</li>
            </ul>
            <p>Deze link is 24 uur geldig. Als je problemen ondervindt, neem dan contact op met ons support team.</p>
        </div>
        <div class="footer">
            <p>© 2024 ScailUp. Alle rechten voorbehouden.</p>
            <p>Deze e-mail is verzonden naar {{ .Email }}</p>
        </div>
    </div>
</body>
</html>',
  mailer_template_recovery = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wachtwoord reset - ScailUp</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .security-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 ScailUp</div>
            <h1>Wachtwoord Reset</h1>
            <p>Veilig en snel je wachtwoord wijzigen</p>
        </div>
        <div class="content">
            <h2>Hallo!</h2>
            <p>We hebben een verzoek ontvangen om je wachtwoord te resetten voor je ScailUp account.</p>
            <p>Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Wachtwoord Resetten</a>
            </div>
            <div class="security-note">
                <strong>🔒 Veiligheidsinformatie:</strong>
                <ul style="margin: 10px 0 0 20px;">
                    <li>Deze link is 1 uur geldig</li>
                    <li>Als je deze e-mail niet hebt aangevraagd, kun je deze negeren</li>
                    <li>Je wachtwoord wordt alleen gewijzigd als je op de link klikt</li>
                </ul>
            </div>
            <p><strong>Problemen?</strong> Als de knop niet werkt, kopieer dan deze link naar je browser:</p>
            <p style="word-break: break-all; color: #3B82F6; font-size: 14px;">{{ .ConfirmationURL }}</p>
        </div>
        <div class="footer">
            <p>© 2024 ScailUp. Alle rechten voorbehouden.</p>
            <p>Deze e-mail is verzonden naar {{ .Email }}</p>
        </div>
    </div>
</body>
</html>',
  mailer_template_email_change = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-mail wijziging - ScailUp</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 ScailUp</div>
            <h1>E-mailadres Wijziging</h1>
            <p>Bevestig je nieuwe e-mailadres</p>
        </div>
        <div class="content">
            <h2>E-mailadres wijziging</h2>
            <p>Je hebt een wijziging van je e-mailadres aangevraagd voor je ScailUp account.</p>
            <p>Klik op de onderstaande knop om de wijziging te bevestigen:</p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">E-mailadres Bevestigen</a>
            </div>
            <p>Deze link is 24 uur geldig. Als je deze wijziging niet hebt aangevraagd, kun je deze e-mail negeren.</p>
        </div>
        <div class="footer">
            <p>© 2024 ScailUp. Alle rechten voorbehouden.</p>
            <p>Deze e-mail is verzonden naar {{ .Email }}</p>
        </div>
    </div>
</body>
</html>',
  mailer_template_magic_link = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login link - ScailUp</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 ScailUp</div>
            <h1>Login Link</h1>
            <p>Veilig inloggen zonder wachtwoord</p>
        </div>
        <div class="content">
            <h2>Hallo!</h2>
            <p>Je hebt een login link aangevraagd voor je ScailUp account. Klik op de onderstaande knop om direct in te loggen:</p>
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Inloggen</a>
            </div>
            <p><strong>Voordelen van magic link login:</strong></p>
            <ul>
                <li>🔐 Geen wachtwoord nodig</li>
                <li>⚡ Supersnel inloggen</li>
                <li>🛡️ Extra veilig</li>
                <li>📱 Werkt op alle apparaten</li>
            </ul>
            <p>Deze link is 1 uur geldig en kan maar één keer gebruikt worden.</p>
        </div>
        <div class="footer">
            <p>© 2024 ScailUp. Alle rechten voorbehouden.</p>
            <p>Deze e-mail is verzonden naar {{ .Email }}</p>
        </div>
    </div>
</body>
</html>'
WHERE id = 1;

-- If no config exists, create it
INSERT INTO auth.config (
  id,
  mailer_autoconfirm,
  mailer_secure_email_change_enabled,
  smtp_admin_email,
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_pass,
  smtp_sender_name,
  smtp_max_frequency,
  mailer_urlpatterns_invite,
  mailer_urlpatterns_confirmation,
  mailer_urlpatterns_recovery,
  mailer_urlpatterns_email_change,
  mailer_urlpatterns_magic_link,
  mailer_subject_invite,
  mailer_subject_confirmation,
  mailer_subject_recovery,
  mailer_subject_email_change,
  mailer_subject_magic_link,
  mailer_template_invite,
  mailer_template_confirmation,
  mailer_template_recovery,
  mailer_template_email_change,
  mailer_template_magic_link
) VALUES (
  1,
  false,
  true,
  'noreply@scailup.io',
  'smtp.resend.com',
  587,
  'noreply@scailup.io',
  're_1234567890abcdef', -- Replace with actual Resend API key
  'ScailUp',
  60,
  'https://preview--scailup.lovable.app/auth/confirm',
  'https://preview--scailup.lovable.app/auth/confirm',
  'https://preview--scailup.lovable.app/wachtwoord-nieuw',
  'https://preview--scailup.lovable.app/auth/confirm',
  'https://preview--scailup.lovable.app/sales-agent/onboarding',
  'Uitnodiging voor ScailUp - AI Sales Agent Platform',
  'Bevestig je ScailUp account',
  'Wachtwoord reset voor je ScailUp account',
  'E-mailadres wijziging bevestiging',
  'Login link voor ScailUp',
  '<!-- Invite template HTML here -->',
  '<!-- Confirmation template HTML here -->',
  '<!-- Recovery template HTML here -->',
  '<!-- Email change template HTML here -->',
  '<!-- Magic link template HTML here -->'
) ON CONFLICT (id) DO NOTHING; 