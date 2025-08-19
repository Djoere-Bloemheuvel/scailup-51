#!/bin/bash

echo "🚀 Configuring Instantly Integration Environment Variables..."
echo ""

# Configuration values
INSTANTLY_API_KEY="ZTYyOWJkMTQtNDVlMi00YjI3LWE3OWQtNjIyNjc3ZWM3OTJlOkVKSkRneWNBT0ZjUg=="
INSTANTLY_MAILBOX_EMAIL="degroot@inboxnl.com"
INSTANTLY_DAILY_LIMIT="30"

echo "📧 Mailbox Email: $INSTANTLY_MAILBOX_EMAIL"
echo "📊 Daily Limit: $INSTANTLY_DAILY_LIMIT emails per mailbox"
echo "🌍 Timezone: Europe/Amsterdam"
echo ""

# Set Supabase Edge Function secrets
echo "🔐 Setting Supabase Edge Function secrets..."

supabase secrets set INSTANTLY_API_KEY="$INSTANTLY_API_KEY"
if [ $? -eq 0 ]; then
    echo "✅ INSTANTLY_API_KEY configured"
else
    echo "❌ Failed to set INSTANTLY_API_KEY"
    exit 1
fi

supabase secrets set INSTANTLY_MAILBOX_EMAIL="$INSTANTLY_MAILBOX_EMAIL"
if [ $? -eq 0 ]; then
    echo "✅ INSTANTLY_MAILBOX_EMAIL configured"
else
    echo "❌ Failed to set INSTANTLY_MAILBOX_EMAIL"
    exit 1
fi

supabase secrets set INSTANTLY_DAILY_LIMIT="$INSTANTLY_DAILY_LIMIT"
if [ $? -eq 0 ]; then
    echo "✅ INSTANTLY_DAILY_LIMIT configured"
else
    echo "❌ Failed to set INSTANTLY_DAILY_LIMIT"
    exit 1
fi

echo ""
echo "🎉 Instantly integration successfully configured!"
echo ""
echo "Configuration Summary:"
echo "- API Key: ****** (configured)"
echo "- Mailbox: $INSTANTLY_MAILBOX_EMAIL"
echo "- Daily Limit: $INSTANTLY_DAILY_LIMIT emails per mailbox"
echo "- Timezone: Europe/Amsterdam"
echo "- Business Hours: Monday-Friday, 09:00-17:00"
echo ""
echo "The Edge Function will now:"
echo "1. ✅ Automatically create Instantly campaigns when new campaigns are created"
echo "2. ✅ Sync email sequences from the EmailSequenceEditor"
echo "3. ✅ Support A/B testing variants"
echo "4. ✅ Configure proper sending schedules and limits"
echo ""
echo "Next steps:"
echo "1. Test the integration by creating a new campaign"
echo "2. Check the campaign has email sequences configured"
echo "3. Verify the campaign appears in your Instantly dashboard"
echo "" 