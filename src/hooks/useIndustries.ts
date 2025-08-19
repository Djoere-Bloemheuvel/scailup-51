
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useIndustries = () => {
  const [industries, setIndustries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('leads')
          .select('industry')
          .not('industry', 'is', null)
          .neq('industry', '');

        if (error) {
          console.error('Error fetching industries:', error);
          toast({
            title: "Fout bij ophalen industrieën",
            description: "Er is een probleem opgetreden bij het laden van de industrieën.",
            variant: "destructive",
          });
          return;
        }

        // Extract unique industries and sort them
        const uniqueIndustries = Array.from(
          new Set(data.map(lead => lead.industry).filter(Boolean))
        ).sort();

        setIndustries(uniqueIndustries);
      } catch (error) {
        console.error('Error fetching industries:', error);
        toast({
          title: "Fout bij ophalen industrieën",
          description: "Er is een probleem opgetreden bij het laden van de industrieën.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndustries();
  }, [toast]);

  return {
    industries,
    isLoading
  };
};
