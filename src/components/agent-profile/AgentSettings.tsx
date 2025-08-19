
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgentSettingsData {
  agentName: string;
  agentRole: string;
  toneOfVoice: string;
  language: string;
}

interface AgentSettingsProps {
  data: AgentSettingsData;
  onChange: (field: keyof AgentSettingsData, value: string) => void;
}

const roleOptions = [
  { value: 'sdr', label: 'Sales Development Representative (SDR)' },
  { value: 'appointment-setter', label: 'Appointment Setter' },
  { value: 'outbound-marketeer', label: 'Outbound Marketeer' },
  { value: 'account-executive', label: 'Account Executive' },
  { value: 'ai-assistent', label: 'AI Assistent (Custom)' }
];

const toneOptions = [
  { value: 'strategisch-zakelijk', label: 'Strategisch Zakelijk' },
  { value: 'direct-doelgericht', label: 'Direct & Doelgericht' },
  { value: 'persoonlijk-menselijk', label: 'Persoonlijk & Menselijk' }
];

const languageOptions = [
  { value: 'nederlands', label: 'Nederlands' },
  { value: 'engels', label: 'Engels' },
  { value: 'duits', label: 'Duits' },
  { value: 'frans', label: 'Frans' }
];

export const AgentSettings = ({ data, onChange }: AgentSettingsProps) => {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">
          Agent Instellingen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="agent-name" className="text-base font-medium text-foreground">
                Naam die Sarah gebruikt voor outreach
              </Label>
              <Input
                id="agent-name"
                value={data.agentName}
                onChange={(e) => onChange('agentName', e.target.value)}
                placeholder="Julia"
                className="h-10 w-full"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Kies een menselijke, herkenbare naam voor outbound berichten
              </p>
            </div>

            {/* Agent Role */}
            <div className="space-y-2">
              <Label htmlFor="agent-role" className="text-base font-medium text-foreground">
                Rol die Sarah aanneemt
              </Label>
              <Select value={data.agentRole} onValueChange={(value) => onChange('agentRole', value)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Selecteer een rol" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-accent">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Bepaalt gedrag, tone en intentie van outreach
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tone of Voice */}
            <div className="space-y-2">
              <Label htmlFor="tone-of-voice" className="text-base font-medium text-foreground">
                Communicatiestijl
              </Label>
              <Select value={data.toneOfVoice} onValueChange={(value) => onChange('toneOfVoice', value)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Selecteer communicatiestijl" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-accent">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Kies hoe Sarah communiceert: persoonlijk, strategisch of doelgericht
              </p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-base font-medium text-foreground">
                Taal voor outreach
              </Label>
              <Select value={data.language} onValueChange={(value) => onChange('language', value)}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Selecteer taal" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-accent">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Alle gegenereerde berichten worden in deze taal geschreven
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
