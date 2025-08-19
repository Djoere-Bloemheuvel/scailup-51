
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UpdateContactStatusParams {
  contact_id: string;
  campaign_id: string;
}

export interface BatchUpdateContactStatusParams {
  updates: UpdateContactStatusParams[];
}

export const useContactStatusUpdater = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const updateContactStatusToActive = useCallback(async (params: UpdateContactStatusParams) => {
    setIsProcessing(true);
    
    try {
      console.log('Calling edge function to update contact status:', params);
      
      const { data, error } = await supabase.functions.invoke('update-contact-status', {
        body: params
      });

      if (error) {
        console.error('Error calling update-contact-status function:', error);
        toast.error('Failed to update contact status');
        return { success: false, message: error.message };
      }

      console.log('Contact status update result:', data);
      
      if (data.success && data.updated) {
        toast.success('Contact status updated to Actief');
      } else if (data.success && !data.updated) {
        toast.info('Contact was not in Gepland status');
      } else {
        toast.error('Failed to update contact status');
      }

      return data;
      
    } catch (error) {
      console.error('Unexpected error updating contact status:', error);
      toast.error('Unexpected error occurred');
      return { success: false, message: 'Unexpected error occurred' };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const batchUpdateContactStatusToActive = useCallback(async (params: BatchUpdateContactStatusParams) => {
    setIsProcessing(true);
    
    try {
      console.log('Calling edge function for batch contact status update:', params);
      
      const { data, error } = await supabase.functions.invoke('update-contact-status', {
        body: params
      });

      if (error) {
        console.error('Error calling batch update-contact-status function:', error);
        toast.error('Failed to update contact statuses');
        return { success: false, message: error.message };
      }

      console.log('Batch contact status update result:', data);
      
      if (data.success) {
        toast.success(`${data.successfulUpdates} contact(s) updated to Actief`);
      } else {
        toast.error(`Batch update failed: ${data.failedUpdates} failed`);
      }

      return data;
      
    } catch (error) {
      console.error('Unexpected error in batch contact status update:', error);
      toast.error('Unexpected error occurred');
      return { success: false, message: 'Unexpected error occurred' };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    updateContactStatusToActive,
    batchUpdateContactStatusToActive,
    isProcessing
  };
};
