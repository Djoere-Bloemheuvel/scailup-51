import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Edge Function URL
const EDGE_FUNCTION_URL = `https://dtpibyzmwgvoealsawlx.supabase.co/functions/v1/credits-manager`;

// Types for Edge Function requests/responses
interface EdgeCreditRequest {
  action: 'add' | 'use' | 'check' | 'get_balance' | 'set_unlimited' | 'get_transactions';
  module_id?: string;
  credit_type?: string;
  amount?: number;
  description?: string;
  related_id?: string;
  expires_at?: string;
  client_id?: string; // Only for admin operations
}

interface EdgeCreditResponse {
  success: boolean;
  data?: any;
  error?: string;
  balance?: number;
  is_unlimited?: boolean;
}

// Helper function to call Edge Function
async function callEdgeFunction(request: EdgeCreditRequest): Promise<EdgeCreditResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Edge function call failed:', error);
    throw error;
  }
}

// Hook for getting credit balance via Edge Function
export const useEdgeCreditBalance = (moduleId: string, creditType: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edge-credit-balance', user?.id, moduleId, creditType],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await callEdgeFunction({
        action: 'get_balance',
        module_id: moduleId,
        credit_type: creditType,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to get balance');
      }

      return {
        balance: response.balance || 0,
        is_unlimited: response.is_unlimited || false,
      };
    },
    enabled: !!user?.id && !!moduleId && !!creditType,
  });
};

// Hook for checking if user has enough credits
export const useEdgeCheckCredits = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      moduleId, 
      creditType, 
      amount 
    }: { 
      moduleId: string; 
      creditType: string; 
      amount: number; 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await callEdgeFunction({
        action: 'check',
        module_id: moduleId,
        credit_type: creditType,
        amount: amount,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to check credits');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate balance queries
      queryClient.invalidateQueries({ queryKey: ['edge-credit-balance'] });
    },
  });
};

// Hook for using credits via Edge Function
export const useEdgeUseCredits = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      moduleId, 
      creditType, 
      amount, 
      description,
      relatedId
    }: { 
      moduleId: string; 
      creditType: string; 
      amount: number; 
      description?: string;
      relatedId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await callEdgeFunction({
        action: 'use',
        module_id: moduleId,
        credit_type: creditType,
        amount: amount,
        description: description || 'Credits used',
        related_id: relatedId,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to use credits');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate all credit-related queries
      queryClient.invalidateQueries({ queryKey: ['edge-credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-balances'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
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

// Hook for adding credits via Edge Function
export const useEdgeAddCredits = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      moduleId, 
      creditType, 
      amount, 
      expiresAt,
      description
    }: { 
      moduleId: string; 
      creditType: string; 
      amount: number; 
      expiresAt?: string;
      description?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await callEdgeFunction({
        action: 'add',
        module_id: moduleId,
        credit_type: creditType,
        amount: amount,
        expires_at: expiresAt,
        description: description || 'Credits added',
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to add credits');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate all credit-related queries
      queryClient.invalidateQueries({ queryKey: ['edge-credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-balances'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Fout bij toevoegen van credits",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    },
  });
};

// Hook for getting transactions via Edge Function
export const useEdgeCreditTransactions = (limit: number = 50) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edge-credit-transactions', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await callEdgeFunction({
        action: 'get_transactions',
        amount: limit,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to get transactions');
      }

      return response.data.transactions || [];
    },
    enabled: !!user?.id,
  });
};

// Admin hook for setting unlimited credits
export const useEdgeSetUnlimitedCredits = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      moduleId, 
      creditType,
      clientId
    }: { 
      moduleId: string; 
      creditType: string;
      clientId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const response = await callEdgeFunction({
        action: 'set_unlimited',
        module_id: moduleId,
        credit_type: creditType,
        client_id: clientId, // Optional, for admin operations on other clients
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to set unlimited credits');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate all credit-related queries
      queryClient.invalidateQueries({ queryKey: ['edge-credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-balances'] });
    },
    onError: (error) => {
      toast({
        title: "Fout bij instellen onbeperkte credits",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    },
  });
};

// Hook for bulk credit operations (admin only)
export const useEdgeBulkCreditOperations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      operations 
    }: { 
      operations: Array<{
        action: 'add' | 'use' | 'set_unlimited';
        module_id: string;
        credit_type: string;
        amount?: number;
        description?: string;
        client_id?: string;
      }>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const results = [];
      
      for (const operation of operations) {
        try {
          const response = await callEdgeFunction(operation);
          results.push({
            operation,
            success: response.success,
            data: response.data,
            error: response.error,
          });
        } catch (error) {
          results.push({
            operation,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
    },
    onSuccess: () => {
      // Invalidate all credit-related queries
      queryClient.invalidateQueries({ queryKey: ['edge-credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-balances'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Fout bij bulk credit operaties",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    },
  });
};

// Hook for credit analytics and monitoring
export const useEdgeCreditAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['edge-credit-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get recent transactions for analytics
      const transactionsResponse = await callEdgeFunction({
        action: 'get_transactions',
        amount: 100,
      });

      if (!transactionsResponse.success) {
        throw new Error(transactionsResponse.error || 'Failed to get analytics data');
      }

      const transactions = transactionsResponse.data.transactions || [];
      
      // Calculate analytics
      const today = new Date();
      const todayString = today.toDateString();
      
      const todayUsage = transactions
        .filter((t: any) => new Date(t.created_at).toDateString() === todayString && t.transaction_type === 'subtract')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const thisWeekUsage = transactions
        .filter((t: any) => {
          const transactionDate = new Date(t.created_at);
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo && t.transaction_type === 'subtract';
        })
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const thisMonthUsage = transactions
        .filter((t: any) => {
          const transactionDate = new Date(t.created_at);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return transactionDate >= monthAgo && t.transaction_type === 'subtract';
        })
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      return {
        todayUsage,
        thisWeekUsage,
        thisMonthUsage,
        totalTransactions: transactions.length,
        recentTransactions: transactions.slice(0, 10),
      };
    },
    enabled: !!user?.id,
  });
}; 