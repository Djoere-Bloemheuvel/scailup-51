
import { useCallback, useState } from 'react';
import { 
  runContactAssignmentBackgroundTask,
  processReadyContactsForAssignment,
  BatchAssignmentSummary
} from '@/services/contactCampaignAssignment';

export const useContactAssignment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const runBackgroundAssignment = useCallback(async (contactIds?: string[]) => {
    setIsProcessing(true);
    try {
      await runContactAssignmentBackgroundTask(contactIds);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processReadyContacts = useCallback(async (): Promise<BatchAssignmentSummary> => {
    setIsProcessing(true);
    try {
      return await processReadyContactsForAssignment();
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    runBackgroundAssignment,
    processReadyContacts,
    isProcessing
  };
};
