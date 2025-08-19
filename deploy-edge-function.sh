#!/bin/bash

# Deploy Edge Function for Robust Credit Management
echo "🚀 Deploying Edge Function for Robust Credit Management..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first."
    echo "   Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run 'supabase login' first."
    exit 1
fi

# Deploy the Edge Function
echo "📦 Deploying credits-manager Edge Function..."
supabase functions deploy credits-manager

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "🎉 Robust Credit Management System Ready!"
    echo ""
    echo "📊 Features Deployed:"
    echo "   ✅ Rate Limiting (100 requests/minute)"
    echo "   ✅ Super Admin Detection (djoere@scailup.io)"
    echo "   ✅ Transaction Logging"
    echo "   ✅ Error Handling & Validation"
    echo "   ✅ CORS Support"
    echo "   ✅ Authentication & Authorization"
    echo "   ✅ Unlimited Credits Support"
    echo "   ✅ Bulk Operations"
    echo "   ✅ Analytics & Monitoring"
    echo ""
    echo "🔗 Edge Function URL:"
    echo "   https://dtpibyzmwgvoealsawlx.supabase.co/functions/v1/credits-manager"
    echo ""
    echo "📝 Available Actions:"
    echo "   - add: Add credits to a client"
    echo "   - use: Use credits from a client"
    echo "   - check: Check if client has enough credits"
    echo "   - get_balance: Get current credit balance"
    echo "   - set_unlimited: Set unlimited credits (admin only)"
    echo "   - get_transactions: Get transaction history"
    echo ""
    echo "🛡️ Security Features:"
    echo "   - Row Level Security (RLS)"
    echo "   - Rate limiting per user"
    echo "   - Admin privilege checks"
    echo "   - Input validation"
    echo "   - Error logging"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Test the Edge Function with the new UI component"
    echo "   2. Monitor logs for any issues"
    echo "   3. Update existing code to use Edge Functions"
    echo "   4. Enjoy robust credit management!"
    echo ""
else
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi 