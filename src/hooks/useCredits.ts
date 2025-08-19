
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClientAvailableCredits } from "./useUnifiedCreditSystem";

export interface CreditInfo {
  module: 'lead_engine' | 'marketing_engine' | 'sales_engine';
  credit_type: string;
  used_this_period: number;
  monthly_limit: number;
  period_start: string;
  reset_interval: 'monthly' | 'weekly';
}

// Updated hook to use the new unified credit system
export const useCredits = () => {
  const { data: availableCredits, isLoading, error } = useClientAvailableCredits();

  // Transform the new data structure to match the old interface for backward compatibility
  const transformedData = availableCredits?.map(credit => ({
    module: credit.module as 'lead_engine' | 'marketing_engine' | 'sales_engine',
    credit_type: credit.credit_type,
    used_this_period: credit.used_this_period,
    monthly_limit: credit.monthly_limit,
    period_start: new Date().toISOString().split('T')[0], // Current period start
    reset_interval: credit.reset_interval as 'monthly' | 'weekly'
  })) || [];

  return {
    data: transformedData,
    isLoading,
    error
  };
};
