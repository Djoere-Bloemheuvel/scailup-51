
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ArrowRight, HelpCircle, TrendingUp } from 'lucide-react';

interface ImpactConversionData {
  customerValue: string;
  conversionRate: string;
}

interface ImpactConversionStepProps {
  value: ImpactConversionData;
  onChange: (value: ImpactConversionData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ImpactConversionStep: React.FC<ImpactConversionStepProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const updateField = (field: keyof ImpactConversionData, newValue: string) => {
    onChange({ ...value, [field]: newValue });
  };

  const isValidCustomerValue = value.customerValue && parseFloat(value.customerValue.replace(/[^0-9.]/g, '')) > 0;
  const isValidConversionRate = value.conversionRate && parseFloat(value.conversionRate) > 0 && parseFloat(value.conversionRate) <= 100;
  const isValid = isValidCustomerValue && isValidConversionRate;

  const formatCurrency = (input: string) => {
    const numericValue = input.replace(/[^0-9]/g, '');
    if (numericValue) {
      return `€${parseInt(numericValue).toLocaleString('nl-NL')}`;
    }
    return '';
  };

  const handleCustomerValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    updateField('customerValue', formatted);
  };

  const handleConversionRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (parseFloat(value) <= 100) {
      updateField('conversionRate', value);
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Impact & Conversie</CardTitle>
          <p className="text-muted-foreground">
            Help ons de waarde van je AI Sales Agent te berekenen door wat basisgegevens 
            over je business te delen.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-6">
            {/* Customer Value */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="customerValue" className="text-base font-medium">
                  Wat is de gemiddelde waarde van één nieuwe klant voor jou?
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Tel hier alle inkomsten op van een gemiddelde klant over 12 maanden. 
                      Bijvoorbeeld: €500/maand × 12 maanden = €6.000
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="customerValue"
                value={value.customerValue}
                onChange={handleCustomerValueChange}
                placeholder="€2.500"
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground">
                Voorbeelden: €1.500 voor SaaS, €5.000 voor consultancy, €25.000 voor enterprise software
              </p>
            </div>
            
            {/* Conversion Rate */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="conversionRate" className="text-base font-medium">
                  Welk percentage van je sales calls resulteert gemiddeld in een klant?
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Bijvoorbeeld: van de 10 calls sluiten er 2 af → dat is 20%. 
                      Denk aan je gemiddelde over de laatste 6 maanden.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="conversionRate"
                  value={value.conversionRate}
                  onChange={handleConversionRateChange}
                  placeholder="20"
                  className="text-lg pr-8"
                  type="number"
                  min="0"
                  max="100"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Typische percentages: 10-15% voor cold outreach, 20-30% voor warme leads, 40%+ voor referrals
              </p>
            </div>
          </div>
          
          {/* Impact Preview */}
          {isValidCustomerValue && isValidConversionRate && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Geschatte impact per 100 nieuwe leads
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    ~{Math.round(parseFloat(value.conversionRate) || 0)} nieuwe klanten
                  </div>
                  <div className="text-green-700 dark:text-green-300">
                    Bij {value.conversionRate}% conversie
                  </div>
                </div>
                <div>
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    {formatCurrency(
                      String(
                        Math.round(
                          (parseFloat(value.customerValue.replace(/[^0-9]/g, '')) || 0) * 
                          (parseFloat(value.conversionRate) || 0) / 100
                        )
                      )
                    )} omzet
                  </div>
                  <div className="text-green-700 dark:text-green-300">
                    Potentiële pipeline waarde
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 Tips voor nauwkeurige cijfers:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Gebruik gemiddelden over de laatste 6-12 maanden</li>
              <li>• Tel alle recurring revenue mee (abonnementen, onderhoud, etc.)</li>
              <li>• Wees realistisch - betere data = betere voorspellingen</li>
              <li>• Je kunt deze cijfers later altijd aanpassen</li>
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
    </TooltipProvider>
  );
};
