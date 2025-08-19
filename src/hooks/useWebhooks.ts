
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WebhookConfig {
  id: string;
  client_id: string;
  webhook_type: 'n8n' | 'zapier' | 'custom';
  webhook_url: string;
  webhook_name: string;
  is_active: boolean;
  headers: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface WebhookExecution {
  id: string;
  event_type: string;
  event_data: any;
  webhook_url: string;
  response_status?: number;
  execution_time_ms: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface CreateWebhookConfig {
  webhook_type: 'n8n' | 'zapier' | 'custom';
  webhook_url: string;
  webhook_name: string;
  headers?: Record<string, string>;
}

export const useWebhooks = () => {
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([]);
  const [webhookExecutions, setWebhookExecutions] = useState<WebhookExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExecutions, setIsLoadingExecutions] = useState(false);
  const { toast } = useToast();

  // Get current client ID
  const getCurrentClientId = async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: clientData } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user.id)
        .single();

      return clientData?.client_id || null;
    } catch (error) {
      console.error('Error getting client ID:', error);
      return null;
    }
  };

  // Fetch webhook configurations (placeholder - no webhook_configs table exists)
  const fetchWebhookConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      // Since webhook_configs table doesn't exist, return empty array for now
      setWebhookConfigs([]);
    } catch (error) {
      console.error('Error fetching webhook configs:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het ophalen van webhook configuraties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create or update webhook configuration (placeholder)
  const upsertWebhookConfig = useCallback(async (config: CreateWebhookConfig): Promise<string | null> => {
    try {
      const clientId = await getCurrentClientId();
      if (!clientId) {
        toast({
          title: "Fout",
          description: "Client ID niet gevonden",
          variant: "destructive",
        });
        return null;
      }

      // Since webhook_configs table doesn't exist, just show success message
      toast({
        title: "Succes",
        description: "Webhook configuratie succesvol opgeslagen (simulatie)",
      });

      // Create a mock webhook config for the UI
      const mockConfig: WebhookConfig = {
        id: `mock-${Date.now()}`,
        client_id: clientId,
        webhook_type: config.webhook_type,
        webhook_url: config.webhook_url,
        webhook_name: config.webhook_name,
        is_active: true,
        headers: config.headers || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setWebhookConfigs(prev => [mockConfig, ...prev.filter(c => c.webhook_type !== config.webhook_type)]);

      return mockConfig.id;
    } catch (error) {
      console.error('Error upserting webhook config:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van de webhook configuratie",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Fetch webhook executions (placeholder)
  const fetchWebhookExecutions = useCallback(async (limit: number = 50, offset: number = 0) => {
    try {
      setIsLoadingExecutions(true);
      // Since webhook_executions table doesn't exist, return empty array
      setWebhookExecutions([]);
    } catch (error) {
      console.error('Error fetching webhook executions:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het ophalen van webhook uitvoeringen",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExecutions(false);
    }
  }, [toast]);

  // Test webhook configuration
  const testWebhook = useCallback(async (webhookUrl: string, headers: Record<string, string> = {}) => {
    try {
      const testPayload = {
        event_type: 'test_webhook',
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook from Scailup',
        test_data: {
          lead_id: 'test-lead-id',
          contact_id: 'test-contact-id',
          client_id: 'test-client-id'
        }
      };

      console.log('🧪 Testing webhook:', webhookUrl);
      console.log('📤 Payload:', testPayload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(testPayload)
      });

      const responseText = await response.text();
      console.log('📡 Response:', response.status, responseText);

      if (response.ok) {
        toast({
          title: "Webhook Test Succesvol",
          description: "De webhook is succesvol getest en werkt correct",
        });
        return true;
      } else {
        toast({
          title: "Webhook Test Mislukt",
          description: `HTTP ${response.status}: ${response.statusText}`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Webhook Test Mislukt",
        description: "Er is een fout opgetreden bij het testen van de webhook",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Get n8n webhook configuration
  const getN8nWebhookConfig = useCallback(() => {
    return webhookConfigs.find(config => config.webhook_type === 'n8n');
  }, [webhookConfigs]);

  // Check if n8n webhook is configured
  const isN8nWebhookConfigured = useCallback(() => {
    const n8nConfig = getN8nWebhookConfig();
    return n8nConfig && n8nConfig.is_active;
  }, [getN8nWebhookConfig]);

  // Test the current n8n webhook
  const testN8nWebhook = useCallback(async () => {
    const n8nConfig = getN8nWebhookConfig();
    if (!n8nConfig) {
      toast({
        title: "Geen n8n Webhook",
        description: "Er is geen n8n webhook geconfigureerd",
        variant: "destructive",
      });
      return false;
    }

    return await testWebhook(n8nConfig.webhook_url, n8nConfig.headers);
  }, [getN8nWebhookConfig, testWebhook, toast]);

  // Initialize data
  useEffect(() => {
    fetchWebhookConfigs();
  }, [fetchWebhookConfigs]);

  return {
    // State
    webhookConfigs,
    webhookExecutions,
    isLoading,
    isLoadingExecutions,
    
    // Actions
    fetchWebhookConfigs,
    upsertWebhookConfig,
    fetchWebhookExecutions,
    testWebhook,
    testN8nWebhook,
    
    // Utilities
    getN8nWebhookConfig,
    isN8nWebhookConfigured,
  };
};
