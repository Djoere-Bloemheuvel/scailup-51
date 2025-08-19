import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useWebhooks, WebhookConfig } from '@/hooks/useWebhooks';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TestTube, Save, ExternalLink } from 'lucide-react';

interface WebhookConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebhookConfigDialog({ isOpen, onClose }: WebhookConfigDialogProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookName, setWebhookName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [customHeaders, setCustomHeaders] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const { upsertWebhookConfig, testWebhook, getN8nWebhookConfig } = useWebhooks();
  const { toast } = useToast();

  // Load existing configuration when dialog opens
  useEffect(() => {
    if (isOpen) {
      const existingConfig = getN8nWebhookConfig();
      if (existingConfig) {
        setWebhookUrl(existingConfig.webhook_url);
        setWebhookName(existingConfig.webhook_name);
        setIsActive(existingConfig.is_active);
        setCustomHeaders(JSON.stringify(existingConfig.headers, null, 2));
      } else {
        // Set defaults for new configuration
        setWebhookUrl('');
        setWebhookName('n8n Lead Conversion Webhook');
        setIsActive(true);
        setCustomHeaders('{\n  "Content-Type": "application/json"\n}');
      }
    }
  }, [isOpen, getN8nWebhookConfig]);

  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Validatie Fout",
        description: "Webhook URL is verplicht",
        variant: "destructive",
      });
      return;
    }

    if (!webhookName.trim()) {
      toast({
        title: "Validatie Fout",
        description: "Webhook naam is verplicht",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      let headers = {};
      if (customHeaders.trim()) {
        try {
          headers = JSON.parse(customHeaders);
        } catch (error) {
          toast({
            title: "Validatie Fout",
            description: "Custom headers moeten geldig JSON zijn",
            variant: "destructive",
          });
          return;
        }
      }

      const result = await upsertWebhookConfig({
        webhook_type: 'n8n',
        webhook_url: webhookUrl.trim(),
        webhook_name: webhookName.trim(),
        headers
      });

      if (result) {
        toast({
          title: "Succes",
          description: "n8n webhook configuratie succesvol opgeslagen",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error saving webhook config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Validatie Fout",
        description: "Webhook URL is verplicht voor testen",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      let headers = {};
      if (customHeaders.trim()) {
        try {
          headers = JSON.parse(customHeaders);
        } catch (error) {
          toast({
            title: "Validatie Fout",
            description: "Custom headers moeten geldig JSON zijn",
            variant: "destructive",
          });
          return;
        }
      }

      await testWebhook(webhookUrl.trim(), headers);
    } catch (error) {
      console.error('Error testing webhook:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setWebhookUrl('');
    setWebhookName('n8n Lead Conversion Webhook');
    setIsActive(true);
    setCustomHeaders('{\n  "Content-Type": "application/json"\n}');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            n8n Webhook Configuratie
          </DialogTitle>
          <DialogDescription>
            Configureer je n8n webhook om automatisch workflows te starten wanneer leads worden geconverteerd naar contacten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Webhook Name */}
          <div className="space-y-2">
            <Label htmlFor="webhook-name">Webhook Naam</Label>
            <Input
              id="webhook-name"
              value={webhookName}
              onChange={(e) => setWebhookName(e.target.value)}
              placeholder="n8n Lead Conversion Webhook"
            />
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">n8n Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n-instance.com/webhook/lead-conversion"
              type="url"
            />
            <p className="text-sm text-muted-foreground">
              Voeg de webhook URL toe van je n8n workflow. Deze wordt aangeroepen wanneer een lead wordt geconverteerd.
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Webhook Actief</Label>
              <p className="text-sm text-muted-foreground">
                Schakel de webhook in of uit
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Custom Headers */}
          <div className="space-y-2">
            <Label htmlFor="custom-headers">Custom Headers (JSON)</Label>
            <Textarea
              id="custom-headers"
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
              placeholder='{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer your-token"\n}'
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Voeg custom headers toe die met elke webhook request worden meegestuurd (optioneel).
            </p>
          </div>

          {/* Webhook Payload Preview */}
          <div className="space-y-2">
            <Label>Webhook Payload Voorbeeld</Label>
            <div className="bg-muted p-3 rounded-md">
              <pre className="text-xs overflow-x-auto">
{`{
  "event_type": "lead_converted_to_contact",
  "timestamp": "2024-01-15T10:30:00Z",
  "contact_id": "uuid-here",
  "lead_id": "uuid-here", 
  "client_id": "uuid-here",
  "lead_data": {
    "id": "lead-uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "company_name": "Example Corp",
    "job_title": "CEO",
    "industry": "Technology"
  },
  "contact_data": {
    "id": "contact-uuid",
    "notes": "Converted from lead",
    "status": "active"
  },
  "notes": "Optional conversion notes"
}`}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || isTesting}
          >
            Reset
          </Button>
          
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isSaving || isTesting || !webhookUrl.trim()}
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testen...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Webhook
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving || isTesting || !webhookUrl.trim() || !webhookName.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 