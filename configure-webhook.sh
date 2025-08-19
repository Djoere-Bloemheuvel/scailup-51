#!/bin/bash

# Script to configure webhook environment variables for the contact-conversion-webhook Edge Function

echo "🔧 Configuring webhook environment variables..."

# Set your webhook configuration here
WEBHOOK_URL="https://djoere.app.n8n.cloud/webhook-test/000b7e1d-5e42-44df-b2ec-5d17038e6c6c"
API_KEY="sk_live_29d1f0c8a7b94efbb2ed_scailup"
WEBHOOK_ENABLED="true"

echo "Setting N8N_WEBHOOK_URL..."
supabase secrets set N8N_WEBHOOK_URL="$WEBHOOK_URL"

echo "Setting N8N_API_KEY..."
supabase secrets set N8N_API_KEY="$API_KEY"

echo "Setting WEBHOOK_ENABLED..."
supabase secrets set WEBHOOK_ENABLED="$WEBHOOK_ENABLED"

echo "✅ Webhook configuration complete!"
echo ""
echo "To verify the settings:"
echo "supabase secrets list"
echo ""
echo "To disable webhooks:"
echo "supabase secrets set WEBHOOK_ENABLED=false" 