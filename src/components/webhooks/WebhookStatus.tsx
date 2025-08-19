
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Globe, Zap } from "lucide-react";
import { useWebhooks } from "@/hooks/useWebhooks";

export function WebhookStatus() {
  const { 
    webhookConfigs, 
    webhookExecutions, 
    isLoading, 
    isLoadingExecutions,
    fetchWebhookConfigs, 
    fetchWebhookExecutions,
    testN8nWebhook,
    isN8nWebhookConfigured,
    getN8nWebhookConfig 
  } = useWebhooks();

  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    fetchWebhookConfigs();
    fetchWebhookExecutions(10);
  }, [fetchWebhookConfigs, fetchWebhookExecutions]);

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    try {
      await testN8nWebhook();
    } finally {
      setTestingWebhook(false);
    }
  };

  const n8nConfig = getN8nWebhookConfig();
  const isConfigured = isN8nWebhookConfigured();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Webhook Configuration Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <CardTitle>n8n Webhook Status</CardTitle>
            </div>
            <Badge variant={isConfigured ? "default" : "secondary"}>
              {isConfigured ? "Actief" : "Inactief"}
            </Badge>
          </div>
          <CardDescription>
            Status van de n8n webhook integratie voor lead conversie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConfigured && n8nConfig ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Webhook is geconfigureerd en actief</span>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Webhook URL:</span>
                  <a 
                    href={n8nConfig.webhook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {n8nConfig.webhook_url.length > 50 
                      ? `${n8nConfig.webhook_url.substring(0, 50)}...`
                      : n8nConfig.webhook_url
                    }
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Webhook Naam:</span>
                  <span className="text-sm">{n8nConfig.webhook_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Laatst bijgewerkt:</span>
                  <span className="text-sm">{new Date(n8nConfig.updated_at).toLocaleString('nl-NL')}</span>
                </div>
              </div>

              <Button 
                onClick={handleTestWebhook}
                disabled={testingWebhook}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {testingWebhook ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Webhook testen...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Test Webhook
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600">Geen actieve webhook gevonden</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Er is momenteel geen n8n webhook geconfigureerd. Neem contact op met support voor configuratie.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Webhook Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recente Webhook Uitvoeringen</CardTitle>
          <CardDescription>
            Overzicht van de laatste webhook uitvoeringen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingExecutions ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : webhookExecutions.length > 0 ? (
            <div className="space-y-3">
              {webhookExecutions.map((execution) => (
                <div key={execution.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {execution.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium text-sm">
                        {execution.event_type}
                      </span>
                      <Badge variant={execution.success ? "default" : "destructive"} className="text-xs">
                        {execution.success ? "Succesvol" : "Mislukt"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(execution.created_at).toLocaleString('nl-NL')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Status: {execution.response_status || 'N/A'}</span>
                    <span>Tijd: {execution.execution_time_ms}ms</span>
                  </div>
                  
                  {execution.error_message && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                      {execution.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nog geen webhook uitvoeringen gevonden
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuratie Overzicht</CardTitle>
          <CardDescription>
            Algemene webhook configuratie informatie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{webhookConfigs.length}</div>
              <div className="text-sm text-muted-foreground">Totaal Webhooks</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {webhookConfigs.filter(config => config.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">Actieve Webhooks</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Ondersteunde Webhook Types:</h4>
            <div className="flex gap-2">
              <Badge variant="outline">n8n</Badge>
              <Badge variant="outline">Zapier</Badge>
              <Badge variant="outline">Custom</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
