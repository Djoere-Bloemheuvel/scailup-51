
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { runContactAssignmentBackgroundTask } from '@/services/contactCampaignAssignment';

export const useContacts = () => {
  const queryClient = useQueryClient();

  const { data: contacts, isLoading, error, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      console.log('Fetching contacts with lead data...');
      
      const { data, error } = await supabase
        .from('contacts_with_lead_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      console.log('Contacts fetched successfully:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const invalidateContacts = () => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  };

  const processContactsForAssignment = async (contactIds?: string[]) => {
    console.log('Processing contacts for campaign assignment');
    
    try {
      // Run background assignment task
      await runContactAssignmentBackgroundTask(contactIds);
      
      // Invalidate contacts to refresh the data
      invalidateContacts();
      
    } catch (error) {
      console.error('Error processing contacts for assignment:', error);
    }
  };

  return {
    contacts,
    isLoading,
    error,
    refetch,
    invalidateContacts,
    processContactsForAssignment
  };
};
