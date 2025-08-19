
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Mail, Linkedin } from 'lucide-react';

interface ExampleMessages {
  email: string;
  linkedin: string;
}

interface ExampleMessagesStepProps {
  value: ExampleMessages;
  onChange: (value: ExampleMessages) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ExampleMessagesStep: React.FC<ExampleMessagesStepProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const updateField = (field: keyof ExampleMessages, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Voorbeeldberichten (Optioneel)</CardTitle>
        <p className="text-muted-foreground">
          Geef voorbeelden van je best presterende berichten om de AI je stijl te laten leren. 
          Deze stap is optioneel maar sterk aanbevolen voor betere resultaten.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <Label htmlFor="emailExample" className="text-base font-medium">
                E-mail Template Voorbeeld
              </Label>
            </div>
            <Textarea
              id="emailExample"
              value={value.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder={`Onderwerp: Korte vraag over [Bedrijf]'s voorraadbeheer

Hoi [Voornaam],

Ik zag dat [Bedrijf] snel groeit in de e-commerce ruimte. Gefeliciteerd met de recente uitbreiding!

Ik neem contact op omdat veel bedrijven van jullie grootte worstelen met voorraadprognoses bij opschaling. We hebben vergelijkbare bedrijven geholpen uitverkoop met 40% te verminderen terwijl de voorraadkosten daalden.

Zou je open staan voor een kort gesprek van 15 minuten deze week om te bespreken hoe dit van toepassing kan zijn op [Bedrijf]?

Beste groeten,
[Jouw Naam]`}
              className="min-h-[150px] resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Gebruik variabelen zoals [Voornaam], [Bedrijf], [Sector] die de AI kan personaliseren
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Linkedin className="w-5 h-5 text-blue-700" />
              <Label htmlFor="linkedinExample" className="text-base font-medium">
                LinkedIn Bericht Voorbeeld
              </Label>
            </div>
            <Textarea
              id="linkedinExample"
              value={value.linkedin}
              onChange={(e) => updateField('linkedin', e.target.value)}
              placeholder={`Hoi [Voornaam],

Ik zie dat je voorraadbeheer leidt bij [Bedrijf] - indrukwekkend groeitraject!

We hebben vergelijkbare e-commerce bedrijven geholpen uitverkoop met 40% te verminderen. Dacht dat dit relevant zou kunnen zijn gezien [Bedrijf]'s recente uitbreiding.

Waard om kort over te praten?`}
              className="min-h-[120px] resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              LinkedIn berichten moeten korter en casual zijn dan e-mails
            </p>
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-amber-600 dark:text-amber-400">💡</span>
            <h4 className="font-medium text-amber-900 dark:text-amber-100">Pro Tips:</h4>
          </div>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <li>• Gebruik haakjes [ ] voor personalisatie variabelen</li>
            <li>• Voeg je best presterende onderwerpregel toe</li>
            <li>• Focus op waardepropositie, niet functies</li>
            <li>• Houd LinkedIn berichten onder de 100 woorden</li>
          </ul>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
          
          <Button onClick={onNext}>
            Volgende stap
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
