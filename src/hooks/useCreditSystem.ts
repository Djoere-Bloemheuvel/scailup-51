// Re-export the new unified credit system for backward compatibility
export {
  useClientAvailableCredits as useCreditBalances,
  useCreditUsageLogs,
  useModuleTiers,
  useTierCredits,
  type ClientAvailableCredit as CreditBalance,
  type ModuleTier,
  type ModuleTierCredit
} from './useUnifiedCreditSystem';

// Keep the old exports for backward compatibility
export {
  useClientAvailableCredits as useCredits,
  useCreditUsageLogs as useCreditTransactions
} from './useUnifiedCreditSystem';

// Simplified placeholder hooks for components that might still reference them
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      // Return modules based on the new module_tiers structure
      return [
        { id: 'lead_engine', name: 'Lead Engine', description: 'Lead generation and management' },
        { id: 'marketing_engine', name: 'Marketing Engine', description: 'Marketing automation and campaigns' },
        { id: 'sales_engine', name: 'Sales Engine', description: 'Sales process and pipeline management' }
      ];
    },
  });
};

export const useClientSubscriptions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['client-subscriptions', user?.id],
    queryFn: async () => {
      // Return empty array for now - this will be implemented when subscription system is added
      return [];
    },
    enabled: !!user?.id,
  });
};

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      // Return empty array for now - this will be implemented when plan system is added
      return [];
    },
  });
};

export const useAddCredits = () => {
  // This should be handled by admin functions in the future
  // For now, return a placeholder
  return {
    mutate: () => {
      console.warn('useAddCredits is not implemented yet - contact your administrator');
    },
    isLoading: false,
    error: null
  };
};

export const useUseCredits = () => {
  // This should be handled by admin functions in the future
  // For now, return a placeholder
  return {
    mutate: () => {
      console.warn('useUseCredits is not implemented yet - contact your administrator');
    },
    isLoading: false,
    error: null
  };
};
