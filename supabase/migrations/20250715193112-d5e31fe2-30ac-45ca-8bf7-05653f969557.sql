-- Fix the get_unique_tags function to work with JSONB stored as comma-separated strings
CREATE OR REPLACE FUNCTION public.get_unique_tags()
 RETURNS TABLE(tag text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT DISTINCT trim(unnest(string_to_array(tags::text, ','))) as tag
  FROM public.leads
  WHERE tags IS NOT NULL 
    AND tags::text != ''
    AND tags::text != 'null'
    AND tags::text != '""'
  ORDER BY tag;
$function$