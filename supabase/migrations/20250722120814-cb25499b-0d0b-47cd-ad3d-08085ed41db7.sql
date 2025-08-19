
-- Gedetailleerde controle van de leads tabel structuur
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'leads'
ORDER BY ordinal_position;

-- Controleer specifiek op de kolommen die je noemt
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'province') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as province_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'organization_technologies') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as organization_technologies_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'state') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as state_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'organization_name') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as organization_name_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'organization_size') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as organization_size_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'organization_industry') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as organization_industry_status;

-- Controleer ook op andere mogelijk ontbrekende kolommen
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'website') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as website_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'company_description') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as company_description_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'annual_revenue') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as annual_revenue_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'funding_status') 
        THEN 'GEVONDEN' 
        ELSE 'ONTBREEKT' 
    END as funding_status_status;

-- Tel het totaal aantal kolommen in de leads tabel
SELECT COUNT(*) as total_columns_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'leads';
