-- Remove djoere@scailup.io Account Migration
-- Completely removes all data for djoere@scailup.io from Supabase
-- DIRECT LOVABLE COMPATIBILITY - SQL only

-- First, find the user ID for djoere@scailup.io
DO $$
DECLARE
    user_id_to_delete UUID;
    client_id_to_delete UUID;
BEGIN
    -- Get the user ID for djoere@scailup.io
    SELECT id INTO user_id_to_delete 
    FROM auth.users 
    WHERE email = 'djoere@scailup.io';
    
    -- Get the client ID for djoere@scailup.io
    SELECT id INTO client_id_to_delete 
    FROM public.clients 
    WHERE email = 'djoere@scailup.io';
    
    -- Log what we found
    RAISE NOTICE 'Found user_id: %, client_id: %', user_id_to_delete, client_id_to_delete;
    
    -- Only proceed if we found the user
    IF user_id_to_delete IS NOT NULL THEN
        
        -- Remove campaign-related data
        DELETE FROM public.email_events 
        WHERE campaign_lead_id IN (
            SELECT cl.id FROM public.campaign_leads cl
            JOIN public.campaigns c ON cl.campaign_id = c.id
            WHERE c.user_id = user_id_to_delete
        );
        
        DELETE FROM public.campaign_leads 
        WHERE campaign_id IN (
            SELECT id FROM public.campaigns WHERE user_id = user_id_to_delete
        );
        
        DELETE FROM public.email_templates 
        WHERE sequence_id IN (
            SELECT cs.id FROM public.campaign_sequences cs
            JOIN public.campaigns c ON cs.campaign_id = c.id
            WHERE c.user_id = user_id_to_delete
        );
        
        DELETE FROM public.campaign_sequences 
        WHERE campaign_id IN (
            SELECT id FROM public.campaigns WHERE user_id = user_id_to_delete
        );
        
        DELETE FROM public.campaign_personas 
        WHERE campaign_id IN (
            SELECT id FROM public.campaigns WHERE user_id = user_id_to_delete
        );
        
        DELETE FROM public.campaign_analytics 
        WHERE campaign_id IN (
            SELECT id FROM public.campaigns WHERE user_id = user_id_to_delete
        );
        
        DELETE FROM public.campaigns 
        WHERE user_id = user_id_to_delete;
        
        -- Remove leads data
        DELETE FROM public.leads 
        WHERE user_id = user_id_to_delete;
        
        -- Remove credit balance
        IF client_id_to_delete IS NOT NULL THEN
            DELETE FROM public.credit_balances 
            WHERE client_id = client_id_to_delete;
        END IF;
        
        -- Remove user record
        DELETE FROM public.users 
        WHERE id = user_id_to_delete;
        
        -- Remove client record
        IF client_id_to_delete IS NOT NULL THEN
            DELETE FROM public.clients 
            WHERE id = client_id_to_delete;
        END IF;
        
        -- Remove pending registrations
        DELETE FROM public.pending_registrations 
        WHERE email = 'djoere@scailup.io';
        
        -- Finally, remove the auth user
        DELETE FROM auth.users 
        WHERE id = user_id_to_delete;
        
        RAISE NOTICE 'Successfully removed all data for djoere@scailup.io';
        
    ELSE
        RAISE NOTICE 'No user found with email djoere@scailup.io';
    END IF;
    
END $$;

-- Verify removal
SELECT 
    'auth.users' as table_name,
    COUNT(*) as remaining_records
FROM auth.users 
WHERE email = 'djoere@scailup.io'

UNION ALL

SELECT 
    'public.clients' as table_name,
    COUNT(*) as remaining_records
FROM public.clients 
WHERE email = 'djoere@scailup.io'

UNION ALL

SELECT 
    'public.users' as table_name,
    COUNT(*) as remaining_records
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE au.email = 'djoere@scailup.io'

UNION ALL

SELECT 
    'public.campaigns' as table_name,
    COUNT(*) as remaining_records
FROM public.campaigns c
JOIN auth.users au ON c.user_id = au.id
WHERE au.email = 'djoere@scailup.io'

UNION ALL

SELECT 
    'public.leads' as table_name,
    COUNT(*) as remaining_records
FROM public.leads l
JOIN auth.users au ON l.user_id = au.id
WHERE au.email = 'djoere@scailup.io'; 