
-- Create the client_available_credits view that combines data from multiple tables
CREATE OR REPLACE VIEW client_available_credits AS
SELECT 
    cu.client_id,
    cu.user_id,
    mt.module,
    mt.tier,
    mt.name as tier_name,
    mtc.credit_type,
    mtc.amount as monthly_limit,
    mtc.reset_interval,
    mtc.rollover_months,
    COALESCE(cc.used_this_period, 0) as used_this_period,
    GREATEST(0, mtc.amount - COALESCE(cc.used_this_period, 0)) as remaining_credits
FROM client_users cu
JOIN client_modules cm ON cu.client_id = cm.client_id
JOIN module_tiers mt ON cm.module = mt.module AND cm.tier = mt.tier
JOIN module_tier_credits mtc ON mt.id = mtc.module_tier_id
LEFT JOIN client_credits cc ON cu.client_id = cc.client_id 
    AND mt.module = cc.module 
    AND mtc.credit_type = cc.credit_type
WHERE mt.is_active = true;

-- Add RLS policy for the view
ALTER TABLE client_available_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own available credits" 
ON client_available_credits 
FOR SELECT 
USING (auth.uid() = user_id);
