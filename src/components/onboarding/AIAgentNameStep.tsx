
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Bot } from 'lucide-react';

interface AIAgentNameStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AIAgentNameStep: React.FC<AIAgentNameStepProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const isValid = value.trim().length >= 2;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <CardTitle className="text-2xl">Hoe moet je AI Sales Agent zich voorstellen?</CardTitle>
        <p className="text-muted-foreground">
          Vul hier de naam in die zichtbaar is voor jouw leads. Dit kan je eigen naam zijn, 
          die van een collega, of een fictieve naam.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="agentName" className="text-base font-medium">
            Naam van je AI Sales Agent
          </Label>
          <Input
            id="agentName"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Bijv. Jasper van Automatrz"
            className="text-lg"
          />
          <p className="text-sm text-muted-foreground">
            Deze naam wordt gebruikt in alle berichten naar prospects
          </p>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">💡 Tips voor een goede naam:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Gebruik een naam die professioneel overkomt</li>
            <li>• Voeg eventueel je bedrijfsnaam toe (bijv. "Jan van TechCorp")</li>
            <li>• Houd het simpel en herkenbaar</li>
            <li>• Je kunt dit later altijd aanpassen</li>
          </ul>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
          
          <Button onClick={onNext} disabled={!isValid}>
            Doorgaan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
