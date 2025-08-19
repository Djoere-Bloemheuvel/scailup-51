import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// TypeScript interface for credit information
export interface LeadCreditInfo {
  client_id: string;
  credit_type: 'leads' | 'emails' | 'linkedin';
  module: 'lead_engine' | 'marketing_engine' | 'sales_engine';
  monthly_limit: number;
  remaining_credits: number;
  reset_interval: 'monthly' | 'weekly' | null;
  rollover_months: number | null;
  tier: string;
  tier_name: string;
  used_this_period: number | null;
  user_id: string;
  has_bonus?: boolean;
  bonus_amount?: number;
  bonus_expires_at?: string;
}

// Interface for credit check result
export interface CreditCheckResult {
  hasCredits: boolean;
  available: number;
  required: number;
  creditType: string;
}

// Interface for credit consumption parameters
export interface CreditConsumptionParams {
  credit_type: 'leads' | 'emails' | 'linkedin';
  amount: number;
  description: string;
  related_id?: string;
}

// Hook to handle credit consumption mutations
const useLeadCreditConsumption = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: CreditConsumptionParams) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // For now, we'll use a simplified approach since credit consumption
      // is already handled by the convert_lead_to_contact RPC function
      // This is a placeholder that can be enhanced later
      console.log('Credit consumption requested:', params);
      
      // Return success for now - actual credit consumption happens in the conversion process
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate credit-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client-available-credits'] });
      queryClient.invalidateQueries({ queryKey: ['lead-credits'] });
    },
    onError: (error: Error) => {
      console.error('Credit consumption failed:', error);
      toast({
        title: "Credit Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};

// Main hook that combines credit checking and consumption
export const useLeadCreditsSystem = () => {
  const { user } = useAuth();

  // Query to get available credits using the existing view
  const { data: credits, isLoading, error } = useQuery({
    queryKey: ['lead-credits', user?.id],
    queryFn: async (): Promise<LeadCreditInfo[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Use the existing client_available_credits view
      const { data, error } = await supabase
        .from('client_available_credits')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching credits:', error);
        throw error;
      }

      // Transform the data to match our interface
      return (data || []).map(credit => ({
        ...credit,
        has_bonus: false, // Will be calculated based on module activation
        bonus_amount: 0,
        bonus_expires_at: null
      }));
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Enhanced credit check function
  const checkCredits = (creditType: string, amount: number): CreditCheckResult => {
    const leadCredits = credits?.find(c => c.credit_type === creditType);
    
    if (!leadCredits) {
      return {
        hasCredits: false,
        available: 0,
        required: amount,
        creditType
      };
    }

    const available = leadCredits.remaining_credits + (leadCredits.bonus_amount || 0);
    const hasCredits = available >= amount;

    return {
      hasCredits,
      available,
      required: amount,
      creditType
    };
  };

  // Get lead credits specifically
  const getLeadCredits = (): LeadCreditInfo[] => {
    return credits?.filter(c => c.credit_type === 'leads') || [];
  };

  // Credit consumption mutation
  const consumeCredits = useLeadCreditConsumption();

  return {
    credits,
    isLoading,
    error,
    checkCredits,
    getLeadCredits,
    consumeCredits
  };
};

// Export the individual hooks for backward compatibility
export const useLeadCreditCheck = () => {
  const { credits, isLoading, error } = useLeadCreditsSystem();
  
  const checkCredits = (creditType: string, amount: number): CreditCheckResult => {
    const leadCredits = credits?.find(c => c.credit_type === creditType);
    
    if (!leadCredits) {
      return {
        hasCredits: false,
        available: 0,
        required: amount,
        creditType
      };
    }

    const available = leadCredits.remaining_credits + (leadCredits.bonus_amount || 0);
    const hasCredits = available >= amount;

    return {
      hasCredits,
      available,
      required: amount,
      creditType
    };
  };

  const getLeadCredits = (): LeadCreditInfo[] => {
    return credits?.filter(c => c.credit_type === 'leads') || [];
  };

  return {
    checkCredits,
    getLeadCredits,
    isLoading,
    error
  };
};

export { useLeadCreditConsumption }; 