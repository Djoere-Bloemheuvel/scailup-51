
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ProductServiceStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ProductServiceStep: React.FC<ProductServiceStepProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const isValid = value.trim().length > 20;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Wat verkoop je?</CardTitle>
        <p className="text-muted-foreground">
          Beschrijf je product of dienst alsof je het aan een potentiële klant uitlegt. 
          Wees specifiek over de waarde die je biedt.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Voorbeeld: Wij bieden cloud-gebaseerde voorraadbeheersoftware die e-commerce bedrijven helpt uitverkoop met 40% te verminderen en hun supply chain kosten te optimaliseren. Ons platform integreert met grote marktplaatsen en biedt real-time analytics..."
            className="min-h-[150px] resize-none"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {value.length}/500 karakters • Minimaal 20 karakters vereist
          </p>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">💡 Tips voor een goede beschrijving:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Focus op voordelen, niet alleen functies</li>
            <li>• Noem specifieke resultaten of uitkomsten</li>
            <li>• Vermeld je doelmarkt indien relevant</li>
            <li>• Houd het conversationeel en duidelijk</li>
          </ul>
        </div>
        
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
