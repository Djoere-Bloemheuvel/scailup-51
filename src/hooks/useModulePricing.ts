import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface ModulePricing {
  id: string;
  module_slug: string;
  module_name: string;
  monthly_price: number;
  currency: string;
  description: string;
  value_proposition: string[];
  stripe_product_id?: string;
  stripe_price_id?: string;
  requires_lead_engine: boolean;
  is_standalone: boolean;
  is_active: boolean;
}

export interface ClientModule {
  client_id: string;
  module: 'lead_engine' | 'marketing_engine' | 'sales_engine';
  tier: string;
  activated_at: string;
  updated_at: string;
  is_active?: boolean;
  module_name?: string;
  monthly_price?: number;
  description?: string;
}

// Hook to get available module pricing from database
export const useModulePricing = () => {
  return useQuery({
    queryKey: ['module-pricing'],
    queryFn: async (): Promise<ModulePricing[]> => {
      const { data, error } = await supabase
        .from('module_pricing')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (error) {
        console.error('Error fetching module pricing:', error);
        throw new Error('Failed to fetch module pricing');
      }

      return data || [];
    },
  });
};

// Hook to get client's active modules
export const useClientModules = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-modules', user?.id],
    queryFn: async (): Promise<ClientModule[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get client_id for the user
      const { data: userData, error: userError } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userData?.client_id) {
        console.error('Client not found:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('client_modules')
        .select('*')
        .eq('client_id', userData.client_id);

      if (error) {
        console.error('Error fetching client modules:', error);
        throw new Error('Failed to fetch client modules');
      }

      // Get module pricing info to enrich the data
      const { data: modulesPricing } = await supabase
        .from('module_pricing')
        .select('*')
        .eq('is_active', true);

      // Transform data to include additional properties for display and ensure all required fields
      const enrichedData: ClientModule[] = (data || []).map(module => {
        const moduleInfo = modulesPricing?.find(m => m.module_slug === module.module);
        
        return {
          client_id: module.client_id,
          module: module.module as 'lead_engine' | 'marketing_engine' | 'sales_engine',
          tier: module.tier,
          activated_at: module.activated_at || new Date().toISOString(),
          updated_at: module.updated_at || new Date().toISOString(),
          is_active: true, // All records in client_modules are active
          module_name: moduleInfo?.module_name || module.module,
          monthly_price: moduleInfo?.monthly_price || 0,
          description: moduleInfo?.description || ''
        };
      });

      return enrichedData;
    },
    enabled: !!user?.id,
  });
};

// Hook to activate a module for a client
export const useActivateModule = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      moduleId, 
      stripeSubscriptionId 
    }: { 
      moduleId: string; 
      stripeSubscriptionId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get client_id for the user
      const { data: userData, error: userError } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userData?.client_id) {
        throw new Error('Client not found');
      }

      // Find the module details from database
      const { data: moduleDetails, error: moduleError } = await supabase
        .from('module_pricing')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError || !moduleDetails) {
        throw new Error('Module not found');
      }

      const { data, error } = await supabase
        .from('client_modules')
        .insert({
          client_id: userData.client_id,
          module: moduleDetails.module_slug as 'lead_engine' | 'marketing_engine' | 'sales_engine',
          tier: 'standard', // Default tier
        })
        .select()
        .single();

      if (error) {
        console.error('Error activating module:', error);
        throw new Error(error.message || 'Failed to activate module');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-modules'] });
      toast({
        title: "Module Activated",
        description: "The module has been successfully activated for your account.",
      });
    },
    onError: (error) => {
      console.error('Error in useActivateModule:', error);
      toast({
        title: "Activation Failed",
        description: error instanceof Error ? error.message : "Failed to activate module",
        variant: "destructive",
      });
    },
  });
};

// Hook to deactivate a module for a client
export const useDeactivateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleIdentifier: string) => {
      // Since client_modules doesn't have an id field, we need to identify by client_id + module
      // For now, we'll assume moduleIdentifier is in format "client_id:module"
      const [clientId, moduleName] = moduleIdentifier.split(':');
      
      if (!clientId || !moduleName) {
        throw new Error('Invalid module identifier');
      }

      // Validate that moduleName is a valid module type
      const validModules: ('lead_engine' | 'marketing_engine' | 'sales_engine')[] = ['lead_engine', 'marketing_engine', 'sales_engine'];
      if (!validModules.includes(moduleName as any)) {
        throw new Error('Invalid module type');
      }

      const { data, error } = await supabase
        .from('client_modules')
        .delete()
        .eq('client_id', clientId)
        .eq('module', moduleName as 'lead_engine' | 'marketing_engine' | 'sales_engine')
        .select()
        .single();

      if (error) {
        console.error('Error deactivating module:', error);
        throw new Error('Failed to deactivate module');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-modules'] });
      toast({
        title: "Module Deactivated",
        description: "The module has been successfully deactivated.",
      });
    },
    onError: (error) => {
      console.error('Error in useDeactivateModule:', error);
      toast({
        title: "Deactivation Failed",
        description: error instanceof Error ? error.message : "Failed to deactivate module",
        variant: "destructive",
      });
    },
  });
};
