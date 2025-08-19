# Webhook Configuration Guide

## Overview
The `contact-conversion-webhook` Edge Function sends notifications when a lead is converted to a contact. This webhook is fully configurable and can be enabled/disabled as needed.

## Configuration Options

### 1. Environment Variables

The webhook uses the following environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `N8N_WEBHOOK_URL` | The URL where webhook notifications are sent | Hardcoded fallback | Yes |
| `N8N_API_KEY` | API key for authenticating with the webhook endpoint | Hardcoded fallback | Yes |
| `WEBHOOK_ENABLED` | Enable/disable webhook sending (`true`/`false`) | `true` | No |

### 2. Setting Up Environment Variables

#### Option A: Supabase Dashboard (Production)
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Functions**
3. Add the environment variables:
   ```
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/contact-conversion
   N8N_API_KEY=your_api_key_here
   WEBHOOK_ENABLED=true
   ```

#### Option B: Supabase CLI (Command Line)
```bash
# Run the configuration script
./configure-webhook.sh

# Or set manually:
supabase secrets set N8N_WEBHOOK_URL="https://your-webhook-url.com"
supabase secrets set N8N_API_KEY="your_api_key"
supabase secrets set WEBHOOK_ENABLED="true"
```

#### Option C: Local Development
1. Copy `supabase/webhook.env.example` to `supabase/.env`
2. Update the values in `.env` file
3. The local Supabase instance will use these values

### 3. Webhook Payload

The webhook sends the following JSON payload:

```json
{
  "event_type": "contact_created",
  "timestamp": "2024-01-28T10:30:00Z",
  "client_id": "uuid-of-client",
  "user_id": "uuid-of-user",
  "lead_id": "uuid-of-original-lead",
  "contact_id": "uuid-of-new-contact",
  "contact_data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@company.com",
    "company_name": "Company Inc",
    "title": "CEO",
    "industry": "Technology",
    "country": "Netherlands",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "company_website": "https://company.com"
  }
}
```

### 4. Error Handling

- **Webhook failures do NOT block lead conversion**
- The system retries failed webhooks 3 times with exponential backoff
- If all retries fail, the conversion still succeeds but webhook failure is logged
- Users see appropriate success/warning messages based on webhook status

### 5. Disabling Webhooks

To disable webhook notifications:

```bash
supabase secrets set WEBHOOK_ENABLED=false
```

Or in your environment variables, set `WEBHOOK_ENABLED=false`.

### 6. Testing

To test webhook configuration:
1. Convert a lead to contact in the application
2. Check the Edge Function logs in Supabase dashboard
3. Verify webhook delivery at your endpoint

### 7. Current Configuration

The current hardcoded fallbacks are:
- **URL**: `https://djoere.app.n8n.cloud/webhook-test/000b7e1d-5e42-44df-b2ec-5d17038e6c6c`
- **API Key**: `sk_live_29d1f0c8a7b94efbb2ed_scailup`

**⚠️ Update these with your own values for production use!** 