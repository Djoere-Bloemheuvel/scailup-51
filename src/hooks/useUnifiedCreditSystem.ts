
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface ModuleTier {
  id: string;
  module: string;
  tier: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleTierCredit {
  id: string;
  module_tier_id: string;
  credit_type: 'leads' | 'emails' | 'linkedin';
  amount: number;
  reset_interval: 'monthly' | 'weekly';
  rollover_months: number;
  created_at: string;
}

export interface ClientAvailableCredit {
  client_id: string;
  user_id: string;
  module: string;
  tier: string;
  tier_name: string;
  credit_type: string;
  monthly_limit: number;
  reset_interval: string;
  rollover_months: number;
  used_this_period: number;
  remaining_credits: number;
}

// Define the valid module types
type ValidModuleType = 'lead_engine' | 'marketing_engine' | 'sales_engine';

// Helper function to validate module type
const isValidModuleType = (module: string): module is ValidModuleType => {
  return ['lead_engine', 'marketing_engine', 'sales_engine'].includes(module);
};

// Hook to get available credits for current user/client using the new view
export const useClientAvailableCredits = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-available-credits', user?.id],
    queryFn: async (): Promise<ClientAvailableCredit[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Use the fallback method to get credits directly
      return await getFallbackCredits(user.id);
    },
    enabled: !!user?.id,
  });
};

// Function to get credits directly from tables
const getFallbackCredits = async (userId: string): Promise<ClientAvailableCredit[]> => {
  try {
    // Get client_id first
    const { data: clientUser, error: clientError } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', userId)
      .single();

    if (clientError || !clientUser) {
      console.error('Error getting client for user:', clientError);
      return [];
    }

    // Get client modules with their tier information
    const { data: clientModules, error: modulesError } = await supabase
      .from('client_modules')
      .select(`
        client_id,
        module,
        tier
      `)
      .eq('client_id', clientUser.client_id)
      .not('activated_at', 'is', null);

    if (modulesError) {
      console.error('Error fetching client modules:', modulesError);
      return [];
    }

    if (!clientModules || clientModules.length === 0) {
      return [];
    }

    // Get module tiers and their credits
    const { data: moduleTiers, error: tiersError } = await supabase
      .from('module_tiers')
      .select(`
        id,
        module,
        tier,
        name,
        module_tier_credits (
          credit_type,
          amount,
          reset_interval,
          rollover_months
        )
      `)
      .eq('is_active', true);

    if (tiersError) {
      console.error('Error fetching module tiers:', tiersError);
      return [];
    }

    // Get current usage
    const { data: currentUsage, error: usageError } = await supabase
      .from('client_credits')
      .select('*')
      .eq('client_id', clientUser.client_id)
      .gte('period_start', new Date().toISOString().split('T')[0].slice(0, 7) + '-01');

    if (usageError) {
      console.error('Error fetching current usage:', usageError);
    }

    // Transform to ClientAvailableCredit format
    const credits: ClientAvailableCredit[] = [];
    
    clientModules.forEach(clientModule => {
      const tier = moduleTiers?.find(t => 
        t.module === clientModule.module && t.tier === clientModule.tier
      );
      
      if (tier && tier.module_tier_credits) {
        tier.module_tier_credits.forEach(credit => {
          const usage = currentUsage?.find(u => 
            u.module === clientModule.module && u.credit_type === credit.credit_type
          );
          
          credits.push({
            client_id: clientModule.client_id,
            user_id: userId,
            module: clientModule.module,
            tier: clientModule.tier,
            tier_name: tier.name,
            credit_type: credit.credit_type,
            monthly_limit: credit.amount,
            reset_interval: credit.reset_interval,
            rollover_months: credit.rollover_months,
            used_this_period: usage?.used_this_period || 0,
            remaining_credits: Math.max(0, credit.amount - (usage?.used_this_period || 0))
          });
        });
      }
    });

    return credits;
  } catch (error) {
    console.error('Error in getFallbackCredits:', error);
    return [];
  }
};

// Hook to get module tiers
export const useModuleTiers = (moduleFilter?: string) => {
  return useQuery({
    queryKey: ['module-tiers', moduleFilter],
    queryFn: async (): Promise<ModuleTier[]> => {
      let query = supabase
        .from('module_tiers')
        .select('*')
        .eq('is_active', true)
        .order('tier');

      if (moduleFilter && isValidModuleType(moduleFilter)) {
        query = query.eq('module', moduleFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching module tiers:', error);
        throw new Error('Failed to fetch module tiers');
      }

      // Transform the data to match the expected interface
      return (data || []).map(tier => ({
        ...tier,
        updated_at: tier.created_at // Use created_at as fallback for updated_at
      }));
    },
  });
};

// Hook to get tier credits for a specific tier
export const useTierCredits = (moduleTierId?: string) => {
  return useQuery({
    queryKey: ['tier-credits', moduleTierId],
    queryFn: async (): Promise<ModuleTierCredit[]> => {
      if (!moduleTierId) return [];

      const { data, error } = await supabase
        .from('module_tier_credits')
        .select('*')
        .eq('module_tier_id', moduleTierId)
        .order('credit_type');

      if (error) {
        console.error('Error fetching tier credits:', error);
        throw new Error('Failed to fetch tier credits');
      }

      return data || [];
    },
    enabled: !!moduleTierId,
  });
};

// Hook to use credits
export const useUseCredits = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      creditType, 
      amount, 
      description,
      module = 'lead_engine' // Default module
    }: { 
      creditType: string; 
      amount: number; 
      description: string;
      module?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Validate module type and ensure it's typed correctly
      const validModule: ValidModuleType = isValidModuleType(module) ? module : 'lead_engine';

      try {
        // Get client_id for the user first
        const { data: userData, error: userError } = await supabase
          .from('client_users')
          .select('client_id')
          .eq('user_id', user.id)
          .single();

        if (userError || !userData?.client_id) {
          throw new Error('Client not found');
        }

        // Get available credits using the fallback method
        const availableCredits = await getFallbackCredits(user.id);
        
        const totalAvailable = availableCredits
          .filter(credit => credit.credit_type === creditType)
          .reduce((sum, credit) => sum + credit.remaining_credits, 0);

        if (totalAvailable < amount) {
          throw new Error(`Insufficient credits. Available: ${totalAvailable}, Required: ${amount}`);
        }

        // Update client_credits table to track usage with proper module type
        const { error: updateError } = await supabase
          .from('client_credits')
          .upsert({
            client_id: userData.client_id,
            module: validModule as any, // Cast to any to handle the enum type
            credit_type: creditType,
            used_this_period: amount,
            period_start: new Date().toISOString().split('T')[0]
          }, {
            onConflict: 'client_id,module,credit_type',
            ignoreDuplicates: false
          });

        if (updateError) {
          console.error('Error updating credit usage:', updateError);
          throw new Error('Failed to update credit usage');
        }

        // Log the credit usage
        const { error: logError } = await supabase
          .from('credit_logs')
          .insert({
            client_id: userData.client_id,
            module: validModule as any, // Cast to any to handle the enum type
            credit_type: creditType,
            change: -amount,
            reason: description
          });

        if (logError) {
          console.warn('Failed to log credit usage:', logError);
          // Don't fail the request if logging fails
        }

        return { success: true, used: amount };
      } catch (error) {
        console.error('Error in useUseCredits:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch credit-related queries
      queryClient.invalidateQueries({ queryKey: ['client-available-credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-balances'] });
      queryClient.invalidateQueries({ queryKey: ['credit-usage-logs'] });
    },
    onError: (error) => {
      toast({
        title: "Fout bij gebruik van credits",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    },
  });
};

// Hook to get credit usage logs
export const useCreditUsageLogs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['credit-usage-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        // Get client_id for the user first
        const { data: userData, error: userError } = await supabase
          .from('client_users')
          .select('client_id')
          .eq('user_id', user.id)
          .single();

        if (userError || !userData?.client_id) {
          console.warn('Client not found for user:', user.id, userError);
          return [];
        }

        // Get credit usage logs
        const { data, error } = await supabase
          .from('credit_logs')
          .select('*')
          .eq('client_id', userData.client_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching credit usage logs:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in useCreditUsageLogs:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
};

// Backward compatibility exports
export const useCredits = useClientAvailableCredits;
export const useCreditTransactions = useCreditUsageLogs;
