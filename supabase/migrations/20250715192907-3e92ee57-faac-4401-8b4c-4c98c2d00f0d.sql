-- Fix the get_unique_tags function to work with JSONB arrays (without user filtering since leads table has no user_id)
CREATE OR REPLACE FUNCTION public.get_unique_tags()
 RETURNS TABLE(tag text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT DISTINCT jsonb_array_elements_text(tags) as tag
  FROM public.leads
  WHERE tags IS NOT NULL 
    AND jsonb_array_length(tags) > 0
  ORDER BY tag;
$function$