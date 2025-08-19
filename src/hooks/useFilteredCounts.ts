

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeadFilters } from '@/types/leads';

export interface FilteredCounts {
  new: number;
  contacts: number;
  isLoading: boolean;
}

export const useFilteredCounts = () => {
  const [counts, setCounts] = useState<FilteredCounts>({
    new: 0,
    contacts: 0,
    isLoading: false
  });
  const { toast } = useToast();

  // Helper function to escape special characters in query strings
  const escapeQueryString = (str: string) => {
    return str.replace(/[&()]/g, '\\$&');
  };

  // Get current client ID using the existing database function
  const getCurrentClientId = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('get_current_user_client_id');
      if (error) {
        console.error('Error getting current client ID:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error getting current client ID:', error);
      return null;
    }
  };

  const fetchFilteredCounts = useCallback(async (filters: Omit<LeadFilters, 'leadStatus' | 'page' | 'limit'>) => {
    setCounts(prev => ({ ...prev, isLoading: true }));

    
    try {
      console.log('Fetching filtered counts with filters:', filters);

      const clientId = await getCurrentClientId();
      if (!clientId) {
        console.error('No client ID found');
        return;
      }

      // Get contact status information first - using actual contacts table without lead_id
      let contactEmails: string[] = [];
      try {
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('email')
          .eq('client_id', clientId)
          .not('email', 'is', null);

        if (!contactsError && contactsData) {
          contactEmails = contactsData.map(item => item.email).filter(Boolean) as string[];
        }
      } catch (error) {
        console.warn('Could not fetch contacts, continuing without filtering:', error);
      }

      // Build base query for counting
      const buildFilterQuery = (excludeContacts: boolean = false) => {
        let query = supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .not('email', 'is', null)
          .neq('email', '');

        // Apply lead status filtering based on email
        if (excludeContacts && contactEmails.length > 0) {
          // For new leads, exclude ones that are contacts
          contactEmails.forEach(email => {
            query = query.neq('email', email);
          });
        } else if (!excludeContacts && contactEmails.length > 0) {
          // For contacts, only include converted leads
          query = query.in('email', contactEmails);
        } else if (!excludeContacts) {
          // No contacts exist, return empty result
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }

        // Apply filters with proper handling for basic filters
        if (filters.search && filters.search.trim()) {
          const escapedSearchTerm = escapeQueryString(filters.search.trim());
          const searchConditions = [
            `first_name.ilike.%${escapedSearchTerm}%`,
            `last_name.ilike.%${escapedSearchTerm}%`,
            `company_name.ilike.%${escapedSearchTerm}%`,
            `title.ilike.%${escapedSearchTerm}%`,
            `email.ilike.%${escapedSearchTerm}%`
          ].join(',');
          query = query.or(searchConditions);
        }

        // Handle country array filter
        if (filters.country && filters.country.length > 0) {
          query = query.in('country', filters.country);
        }

        if (filters.industry && filters.industry.length > 0) {
          query = query.in('industry', filters.industry);
        }

        if (filters.jobTitle && filters.jobTitle.length > 0) {
          const jobTitleConditions = filters.jobTitle.map(title => {
            const escapedTitle = escapeQueryString(title);
            return `title.ilike.%${escapedTitle}%`;
          }).join(',');
          query = query.or(jobTitleConditions);
        }

        // Apply function group filter
        if (filters.functionGroups && filters.functionGroups.length > 0) {
          query = query.in('function_group', filters.functionGroups);
        }

        return query;
      };

      // Get count for new leads
      const newQuery = buildFilterQuery(true);
      const { count: newCount, error: newError } = await newQuery;

      if (newError) {
        console.error('Error fetching new leads count:', newError);
        throw newError;
      }

      // Get count for contacts
      const contactsQuery = buildFilterQuery(false);
      const { count: contactsCount, error: contactsError } = await contactsQuery;

      if (contactsError) {
        console.error('Error fetching contacts count:', contactsError);
        throw contactsError;
      }

      const finalCounts = {
        new: newCount || 0,
        contacts: contactsCount || 0,
        isLoading: false
      };

      console.log('Filtered counts results:', finalCounts);
      setCounts(finalCounts);

    } catch (error) {
      console.error('Error fetching filtered counts:', error);
      toast({
        title: "Fout bij ophalen gefilterde aantallen",
        description: "Er is een probleem opgetreden bij het laden van de gefilterde aantallen.",
        variant: "destructive",
      });
      setCounts(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  return {
    counts,
    fetchFilteredCounts
  };
};

