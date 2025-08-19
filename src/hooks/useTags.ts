
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTags = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      
      // Since get_unique_tags doesn't exist, let's get tags from existing data
      // We'll extract tags from leads table if it has tag-related fields
      const { data, error } = await supabase
        .from('leads')
        .select('industry')
        .not('industry', 'is', null)
        .neq('industry', '');
      
      if (error) {
        console.error('Error fetching tags:', error);
        toast({
          title: "Fout bij ophalen tags",
          description: "Er is een probleem opgetreden bij het laden van de tags.",
          variant: "destructive",
        });
        return;
      }

      // Extract unique industries as tags
      const uniqueTags = Array.from(new Set(
        data?.map(item => item.industry).filter(Boolean) || []
      ));

      setTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Fout bij ophalen tags",
        description: "Er is een probleem opgetreden bij het laden van de tags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return { tags, isLoading, refetch: fetchTags };
};
