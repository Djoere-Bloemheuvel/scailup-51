
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useJobTitles = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['job-titles', searchTerm],
    queryFn: async () => {
      console.log('🔍 Fetching job titles with search term:', searchTerm);

      let query = supabase
        .from('leads')
        .select('title')
        .not('title', 'is', null)
        .neq('title', '');

      if (searchTerm && searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query
        .order('title')
        .limit(100);

      if (error) {
        console.error('❌ Error fetching job titles:', error);
        return [];
      }

      // Extract unique job titles
      const uniqueTitles = Array.from(new Set(
        data?.map(item => item.title).filter(Boolean) || []
      ));

      console.log('✅ Job titles fetched:', uniqueTitles.length);
      return uniqueTitles;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
