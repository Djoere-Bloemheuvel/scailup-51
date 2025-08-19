# 🚀 Instantly.ai Integratie - Complete Implementatie

## 📋 Overzicht

Deze implementatie biedt een volledige, automatische synchronisatie tussen Scailup campagnes en Instantly.ai voor email outreach. De integratie is volledig compatibel met Lovable en bevat uitgebreide security en performance optimalizaties.

## ✨ Functies

### 🔄 Automatische Synchronisatie
- **Campaign Creation**: Nieuwe campagnes worden automatisch aangemaakt in Instantly
- **Email Sequences**: A/B testing varianten worden correct gesynchroniseerd
- **Mailbox Configuration**: Automatische configuratie van sending mailbox
- **Schedule Management**: Business hours (Ma-Vr, 09:00-17:00) in Nederlandse tijdzone

### 📧 Email Sequence Management
- **Variant A & B Support**: Volledige A/B testing ondersteuning
- **Multi-step Sequences**: Step 1 (initial) + Step 2 (follow-up) emails
- **Template Variables**: {{first_name}}, {{company_name}}, {{last_name}}, {{title}}
- **Validation**: Automatische controle op volledigheid en kwaliteit

### 🛡️ Security & Performance
- **Row Level Security**: Client-specific data isolation
- **API Key Management**: Secure environment variable storage
- **Error Handling**: Robuuste foutafhandeling met gebruiksvriendelijke feedback
- **Rate Limiting**: Respect voor Instantly API limits

## 🏗️ Architectuur

### Edge Function: `create-instantly-campaign`
```typescript
// Locatie: supabase/functions/create-instantly-campaign/index.ts
```

**Functionaliteit:**
- Triggers op nieuwe campaign inserts
- Haalt volledige campaign data op inclusief email sequences
- Bouwt Instantly API v2 compatible payload
- Synchroniseert met Instantly.ai
- Update local campaign met Instantly ID

**API Schema Compatibiliteit:**
- ✅ Complete `campaign_schedule` met Nederlandse business hours
- ✅ `sequences[]` array met email content
- ✅ `email_list[]` met configured mailbox
- ✅ `daily_limit` configuratie (30 emails/dag)
- ✅ Alle verplichte velden volgens Instantly API v2

### Frontend Hooks

#### `useCampaignUpdate`
```typescript
// Locatie: src/hooks/useCampaignUpdate.ts
```
- Campaign updates met validation
- Automatische Instantly synchronisatie
- Real-time feedback naar gebruiker

#### `useCampaigns` (Enhanced)
```typescript
// Locatie: src/hooks/useCampaigns.ts
```
- Verbeterde error handling
- Instantly status monitoring
- User-friendly notifications

### Validation Utilities
```typescript
// Locatie: src/utils/campaignValidation.ts
```
- `validateCampaignForInstantly()`: Controleert email sequence volledigheid
- `getEmailSequencePreview()`: Preview van sequences
- `generateDefaultEmailTemplate()`: Template generator

## 🔧 Configuratie

### Environment Variables
```bash
INSTANTLY_API_KEY="ZTYyOWJkMTQtNDVlMi00YjI3LWE3OWQtNjIyNjc3ZWM3OTJlOkVKSkRneWNBT0ZjUg=="
INSTANTLY_MAILBOX_EMAIL="degroot@inboxnl.com"
INSTANTLY_DAILY_LIMIT="30"
```

### Setup Script
```bash
# Automatische configuratie
chmod +x configure-instantly.sh
./configure-instantly.sh
```

**Het script configureert:**
- ✅ Supabase Edge Function secrets
- ✅ API key authenticatie
- ✅ Mailbox email configuratie
- ✅ Daily send limits
- ✅ Timezone settings

## 📊 Database Schema

### Campaigns Table (Enhanced)
```sql
-- Email sequence columns
email_step_1_subject_a TEXT
email_step_1_body_a TEXT
email_step_2_delay_a INTEGER DEFAULT 2
email_step_2_time_a TIME DEFAULT '09:00'
email_step_2_subject_a TEXT
email_step_2_body_a TEXT

-- A/B testing variants
email_step_1_subject_b TEXT
email_step_1_body_b TEXT
email_step_2_delay_b INTEGER DEFAULT 2
email_step_2_time_b TIME DEFAULT '09:00'
email_step_2_subject_b TEXT
email_step_2_body_b TEXT

-- Instantly integration
instantly_campaign_id TEXT
instantly_mailbox_id TEXT
ab_test_enabled BOOLEAN DEFAULT false
```

## 🎯 Instantly API Payload

### Complete Schema
```json
{
  "name": "Campaign Name",
  "campaign_schedule": {
    "schedules": [{
      "name": "Business Hours NL",
      "timing": { "from": "09:00", "to": "17:00" },
      "days": {
        "0": false, "1": true, "2": true, 
        "3": true, "4": true, "5": true, "6": false
      },
      "timezone": "Europe/Amsterdam"
    }],
    "start_date": "2025-01-28T10:00:00.000Z",
    "end_date": null
  },
  "sequences": [{
    "steps": [{
      "step_number": 1,
      "subject": "Email subject",
      "body": "Email body with {{variables}}",
      "delay": 0,
      "variant": "A"
    }]
  }],
  "email_list": ["degroot@inboxnl.com"],
  "daily_limit": 30,
  "stop_on_reply": true,
  "stop_on_auto_reply": true,
  "link_tracking": true,
  "open_tracking": true,
  "text_only": false,
  "is_evergreen": true,
  "email_gap": 10,
  "random_wait_max": 30,
  "prioritize_new_leads": true,
  "stop_for_company": false,
  "insert_unsubscribe_header": true,
  "allow_risky_contacts": false,
  "disable_bounce_protect": false
}
```

## 🚦 Workflow

### 1. Campaign Creation
```
User creates campaign → 
Edge Function triggers → 
Validates email sequences → 
Creates Instantly campaign → 
Updates local record
```

### 2. Email Sequence Update
```
User edits sequences → 
useCampaignUpdate hook → 
Validates content → 
Saves to database → 
Triggers Instantly sync
```

### 3. Status Monitoring
```
Real-time feedback → 
Toast notifications → 
Instantly ID tracking → 
Sync status updates
```

## ⚡ Performance Optimisaties

### 1. **Batch Processing**
- Email sequences verwerkt in batches
- Async validation en sync
- Non-blocking UI updates

### 2. **Smart Caching**
- Campaign data caching
- Validation result memoization
- Reduced API calls

### 3. **Error Recovery**
- Retry logic voor API calls
- Graceful degradation
- User-friendly error messages

## 🔒 Security Features

### 1. **Authentication**
- JWT-based user authentication
- Client-specific data isolation
- Row Level Security policies

### 2. **API Security**
- Secure API key storage
- Environment variable protection
- Request validation

### 3. **Data Validation**
- Input sanitization
- Email content validation
- Campaign completeness checks

## 🧪 Testing & Validatie

### Validation Checks
- ✅ Email subjects en bodies verplicht
- ✅ A/B variant completeness
- ✅ Personalization variables
- ✅ Email length recommendations
- ✅ Send limit validation

### Error Scenarios
- ✅ 401 Unauthorized - API key issues
- ✅ 429 Rate Limited - API limits
- ✅ 400 Bad Request - Invalid data
- ✅ 422 Validation Failed - Missing fields

## 📈 Monitoring & Logging

### Edge Function Logs
```
=== INSTANTLY CAMPAIGN CREATION v2.0 ===
🔧 Configuration: { mailbox, dailyLimit, campaignId }
📊 Campaign data: { sequences, variants }
🚀 Sending to Instantly API v2
📡 Response: { status, campaignId }
✅ SUCCESS! Campaign created and linked
```

### Frontend Logs
```
🔍 Checking Instantly integration status
✅ Instantly integration successful!
🔄 Updating campaign: { id }
🚀 Triggering Instantly synchronization
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "No email sequences found"
**Oorzaak:** Campaign heeft geen email content
**Oplossing:** Voeg email sequences toe via Campaign Editor

#### 2. "API authentication failed"
**Oorzaak:** Onjuiste API key configuratie
**Oplossing:** Run `./configure-instantly.sh` opnieuw

#### 3. "Campaign already has Instantly ID"
**Oorzaak:** Campaign al gesynchroniseerd
**Oplossing:** Normaal gedrag, geen actie vereist

### Debug Commands
```bash
# Check environment config
supabase secrets list

# Check Edge Function logs
supabase functions logs create-instantly-campaign

# Test Edge Function
supabase functions serve create-instantly-campaign
```

## 🔄 Deployment Checklist

### Pre-deployment
- [ ] Environment variables geconfigureerd
- [ ] Database migraties uitgevoerd
- [ ] Edge Function gedeployed
- [ ] API key gevalideerd

### Post-deployment Testing
- [ ] Create test campaign
- [ ] Verify Instantly creation
- [ ] Test email sequence sync
- [ ] Check error handling

## 📞 Support & Documentatie

### API Documentatie
- **Instantly API v2**: https://developer.instantly.ai/api/v2/campaign/createcampaign
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

### Contact
- **Issues**: GitHub Issues
- **Questions**: Technical team
- **API Support**: Instantly.ai support

---

## 🎉 Conclusie

Deze implementatie biedt een **production-ready**, **secure**, en **performance-optimized** integratie tussen Scailup en Instantly.ai. De volledige automatisering en uitgebreide error handling zorgen voor een naadloze gebruikerservaring terwijl alle security en compatibility requirements worden nageleefd.

**Key Benefits:**
- ✅ **100% Automatic** - Geen handmatige stappen
- ✅ **Lovable Compatible** - Volledig compatible met Lovable platform
- ✅ **Security First** - Uitgebreide security measures
- ✅ **Performance Optimized** - Fast en efficient
- ✅ **User Friendly** - Duidelijke feedback en error handling 