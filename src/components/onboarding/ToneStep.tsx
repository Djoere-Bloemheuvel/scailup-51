
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ToneStepProps {
  tone: string;
  customTone: string;
  onChange: (tone: string, customTone: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ToneStep: React.FC<ToneStepProps> = ({
  tone,
  customTone,
  onChange,
  onNext,
  onBack,
}) => {
  const [localCustomTone, setLocalCustomTone] = useState(customTone);

  const handleToneChange = (newTone: string) => {
    onChange(newTone, newTone === 'custom' ? localCustomTone : '');
  };

  const handleCustomToneChange = (value: string) => {
    setLocalCustomTone(value);
    if (tone === 'custom') {
      onChange('custom', value);
    }
  };

  const isValid = tone && (tone !== 'custom' || localCustomTone.trim().length > 0);

  const toneOptions = [
    {
      value: 'friendly',
      label: 'Friendly',
      description: 'Warm, approachable, and conversational',
      example: '"Hi [Name]! I came across your profile and thought you might be interested in..."',
    },
    {
      value: 'professional',
      label: 'Professional',
      description: 'Formal, respectful, and business-focused',
      example: '"Dear [Name], I hope this message finds you well. I wanted to reach out regarding..."',
    },
    {
      value: 'bold',
      label: 'Bold',
      description: 'Direct, confident, and attention-grabbing',
      example: '"[Name], I can help you increase your revenue by 25% in 90 days. Here\'s how..."',
    },
    {
      value: 'custom',
      label: 'Custom',
      description: 'Define your own unique tone and style',
      example: 'Describe your preferred communication style...',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Tone of Voice</CardTitle>
        <p className="text-muted-foreground">
          Choose the communication style that best represents your brand and resonates with your audience.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <RadioGroup value={tone} onValueChange={handleToneChange}>
          <div className="grid gap-4">
            {toneOptions.map((option) => (
              <div key={option.value} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </Label>
                </div>
                
                {option.value !== 'custom' && (
                  <div className="ml-7 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm italic">{option.example}</p>
                  </div>
                )}
                
                {option.value === 'custom' && tone === 'custom' && (
                  <div className="ml-7 space-y-2">
                    <Label htmlFor="customTone">Describe your preferred tone</Label>
                    <Input
                      id="customTone"
                      value={localCustomTone}
                      onChange={(e) => handleCustomToneChange(e.target.value)}
                      placeholder="e.g., Casual but knowledgeable, with a touch of humor and industry-specific jargon"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </RadioGroup>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">💡 Tone Tips:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Match your audience's communication style</li>
            <li>• Consider your industry norms (B2B vs B2C)</li>
            <li>• Stay authentic to your brand voice</li>
            <li>• Test different tones and measure responses</li>
          </ul>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button onClick={onNext} disabled={!isValid}>
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
