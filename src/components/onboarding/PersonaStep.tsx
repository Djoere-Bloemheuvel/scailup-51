
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PersonaData {
  jobTitle: string;
  industry: string;
  companySize: string;
  region: string;
}

interface PersonaStepProps {
  value: PersonaData;
  onChange: (value: PersonaData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PersonaStep: React.FC<PersonaStepProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const updateField = (field: keyof PersonaData, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  const isValid = value.jobTitle && value.industry && value.companySize && value.region;

  const companySizes = [
    'Startup (1-10 medewerkers)',
    'Klein (11-50 medewerkers)',
    'Middel (51-200 medewerkers)',
    'Groot (201-1000 medewerkers)',
    'Enterprise (1000+ medewerkers)',
  ];

  const regions = [
    'Nederland',
    'België',
    'Europa',
    'Noord-Amerika',
    'Azië-Pacific',
    'Internationaal',
  ];

  const industries = [
    'Technologie',
    'Zorgverlening',
    'Financiële dienstverlening',
    'E-commerce',
    'Productie',
    'Onderwijs',
    'Vastgoed',
    'Marketing & Reclame',
    'Consultancy',
    'Detailhandel',
    'Anders',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Wie wil je bereiken?</CardTitle>
        <p className="text-muted-foreground">
          Definieer je ideale klantprofiel om de AI te helpen de juiste prospects te targeten.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Functietitel</Label>
            <Input
              id="jobTitle"
              value={value.jobTitle}
              onChange={(e) => updateField('jobTitle', e.target.value)}
              placeholder="bijv. Marketing Manager, CEO, CTO"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Sector</Label>
            <Select value={value.industry} onValueChange={(val) => updateField('industry', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer sector" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companySize">Bedrijfsgrootte</Label>
            <Select value={value.companySize} onValueChange={(val) => updateField('companySize', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer bedrijfsgrootte" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Regio</Label>
            <Select value={value.region} onValueChange={(val) => updateField('region', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer regio" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">🎯 Targeting tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Wees specifiek met functietitels (vermijd generieke termen zoals "Manager")</li>
            <li>• Kies sectoren waar je oplossing bewezen succes heeft</li>
            <li>• Overweeg bedrijfsgrootte op basis van je prijsmodel</li>
            <li>• Begin met één regio en breid later uit</li>
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
