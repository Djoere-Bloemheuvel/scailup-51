
-- Create the client_available_credits view
CREATE OR REPLACE VIEW client_available_credits AS
SELECT 
    cm.client_id,
    cu.user_id,
    cm.module::text as module,
    cm.tier,
    mt.name as tier_name,
    mtc.credit_type::text as credit_type,
    mtc.amount as monthly_limit,
    mtc.reset_interval::text as reset_interval,
    mtc.rollover_months,
    COALESCE(cc.used_this_period, 0) as used_this_period,
    GREATEST(0, mtc.amount - COALESCE(cc.used_this_period, 0)) as remaining_credits
FROM client_modules cm
JOIN module_tiers mt ON mt.module = cm.module AND mt.tier = cm.tier AND mt.is_active = true
JOIN module_tier_credits mtc ON mtc.module_tier_id = mt.id
JOIN client_users cu ON cu.client_id = cm.client_id
LEFT JOIN client_credits cc ON cc.client_id = cm.client_id 
    AND cc.module = cm.module 
    AND cc.credit_type = mtc.credit_type::text
    AND cc.period_start = date_trunc('month', CURRENT_DATE)::date
WHERE cm.activated_at IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON client_available_credits TO authenticated;
