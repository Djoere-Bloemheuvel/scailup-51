
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  title: string;
  description: string | null;
  target_roles: any;
  target_companies: string | null;
  problem_solved: string | null;
  unique_value: string | null;
  use_cases: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  client_id: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get client ID first
  useEffect(() => {
    const getClientId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user found');
          setError('No authenticated user');
          setLoading(false);
          return;
        }

        const { data: client, error: clientError } = await supabase
          .from('client_users')
          .select('client_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (clientError) {
          console.error('Error fetching client:', clientError);
          setError('Error fetching client data');
          setLoading(false);
          return;
        }

        if (client) {
          setClientId(client.client_id);
        } else {
          console.log('No client record found for user');
          setError('No client record found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getClientId:', error);
        setError('Authentication error');
        setLoading(false);
      }
    };

    getClientId();
  }, []);

  // Load services when client ID is available - using propositions table
  useEffect(() => {
    if (clientId) {
      loadServices();
    }
  }, [clientId]);

  const loadServices = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      // Using propositions table since that's what actually exists
      const { data, error } = await supabase
        .from('propositions')
        .select('*')
        .eq('client_id', clientId)
        .order('inserted_at', { ascending: false });

      if (error) throw error;
      
      // Transform propositions to services format
      const transformedServices: Service[] = (data || []).map(proposition => ({
        id: proposition.id,
        title: proposition.name,
        description: proposition.description,
        target_roles: null,
        target_companies: null,
        problem_solved: null,
        unique_value: proposition.description, // Use description as unique value
        use_cases: null,
        status: proposition.active ? 'active' : 'inactive',
        created_at: proposition.inserted_at,
        updated_at: proposition.updated_at,
        client_id: proposition.client_id,
      }));
      
      setServices(transformedServices);
      setError(null);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Could not load services');
      toast({
        title: 'Fout bij laden',
        description: 'Kon diensten niet laden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'client_id'>) => {
    if (!clientId) return null;

    try {
      // Create as proposition since that's the actual table
      const { data, error } = await supabase
        .from('propositions')
        .insert([{
          name: serviceData.title,
          description: serviceData.description,
          active: serviceData.status === 'active',
          client_id: clientId,
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Transform back to service format
      const transformedService: Service = {
        id: data.id,
        title: data.name,
        description: data.description,
        target_roles: null,
        target_companies: null,
        problem_solved: null,
        unique_value: data.description,
        use_cases: null,
        status: data.active ? 'active' : 'inactive',
        created_at: data.inserted_at,
        updated_at: data.updated_at,
        client_id: data.client_id,
      };
      
      setServices(prev => [transformedService, ...prev]);
      toast({
        title: 'Dienst toegevoegd',
        description: 'Je nieuwe dienst is succesvol toegevoegd',
      });
      
      return transformedService;
    } catch (error: any) {
      console.error('Error creating service:', error);
      const message = error.message?.includes('Maximum of 5 services') 
        ? 'Je kunt maximaal 5 diensten toevoegen'
        : 'Kon dienst niet toevoegen';
      
      toast({
        title: 'Fout bij toevoegen',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateService = async (id: string, updates: Partial<Omit<Service, 'id' | 'created_at' | 'client_id'>>) => {
    try {
      // Update proposition since that's the actual table
      const { data, error } = await supabase
        .from('propositions')
        .update({
          name: updates.title,
          description: updates.description,
          active: updates.status === 'active',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform back to service format
      const transformedService: Service = {
        id: data.id,
        title: data.name,
        description: data.description,
        target_roles: null,
        target_companies: null,
        problem_solved: null,
        unique_value: data.description,
        use_cases: null,
        status: data.active ? 'active' : 'inactive',
        created_at: data.inserted_at,
        updated_at: data.updated_at,
        client_id: data.client_id,
      };
      
      setServices(prev => 
        prev.map(service => service.id === id ? transformedService : service)
      );
      
      return transformedService;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Fout bij bijwerken',
        description: 'Kon dienst niet bijwerken',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('propositions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setServices(prev => prev.filter(service => service.id !== id));
      toast({
        title: 'Dienst verwijderd',
        description: 'De dienst is succesvol verwijderd',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Fout bij verwijderen',
        description: 'Kon dienst niet verwijderen',
        variant: 'destructive',
      });
    }
  };

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    canAddMore: services.length < 5,
  };
};
