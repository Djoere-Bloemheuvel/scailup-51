
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCountries = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('leads')
          .select('country')
          .not('country', 'is', null)
          .neq('country', '');

        if (error) {
          console.error('Error fetching countries:', error);
          toast({
            title: "Fout bij ophalen landen",
            description: "Er is een probleem opgetreden bij het laden van de landen.",
            variant: "destructive",
          });
          return;
        }

        // Extract unique countries and sort them
        const uniqueCountries = Array.from(
          new Set(data.map(lead => lead.country).filter(Boolean))
        ).sort();

        setCountries(uniqueCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast({
          title: "Fout bij ophalen landen",
          description: "Er is een probleem opgetreden bij het laden van de landen.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [toast]);

  return {
    countries,
    isLoading
  };
};
