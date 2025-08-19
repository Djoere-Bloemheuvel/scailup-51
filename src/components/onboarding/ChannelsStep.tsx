
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Mail, Linkedin } from 'lucide-react';

interface ChannelsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ChannelsStep: React.FC<ChannelsStepProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const toggleChannel = (channel: string) => {
    if (value.includes(channel)) {
      onChange(value.filter(c => c !== channel));
    } else {
      onChange([...value, channel]);
    }
  };

  const isValid = value.length > 0;

  const channels = [
    {
      id: 'email',
      name: 'E-mail',
      icon: Mail,
      description: 'Directe e-mail outreach met gepersonaliseerde berichten',
      pros: ['Hogere open rates', 'Professionele communicatie', 'Eenvoudig te volgen'],
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      description: 'Social selling via LinkedIn connectieverzoeken en berichten',
      pros: ['Visuele profielcontext', 'Professioneel netwerk', 'Hogere respons rates'],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Voorkeurskanalen</CardTitle>
        <p className="text-muted-foreground">
          Selecteer welke kanalen je wilt gebruiken voor outreach. Je kunt later altijd meer toevoegen.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isSelected = value.includes(channel.id);
            
            return (
              <div key={channel.id} className="relative">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleChannel(channel.id)}
                >
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleChannel(channel.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold">{channel.name}</h3>
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{channel.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {channel.pros.map((pro, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          >
                            {pro}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {value.includes('email') && value.includes('linkedin') && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-600 dark:text-blue-400">✨</span>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Multi-kanaal strategie</h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Goede keuze! Het gebruik van beide kanalen kan je respons rates tot 30% verhogen 
              vergeleken met single-kanaal outreach.
            </p>
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
          
          <Button onClick={onNext} disabled={!isValid}>
            Volgende stap
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
