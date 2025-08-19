
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot, Sparkles } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto mb-6 relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative">
            <Bot className="w-12 h-12 text-primary" />
            <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Welkom bij AI Sales Agent</h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Laten we jouw AI-verkoop assistent instellen in slechts een paar minuten. 
          We helpen je alles te configureren om automatisch gekwalificeerde leads te genereren.
        </p>
      </CardHeader>
      
      <CardContent className="text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Doelgroep Bepalen</h3>
            <p className="text-sm text-muted-foreground">Definieer je ideale klantprofiel</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold mb-2">AI-Powered Outreach</h3>
            <p className="text-sm text-muted-foreground">Geautomatiseerde, gepersonaliseerde berichten</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="font-semibold mb-2">Resultaten Volgen</h3>
            <p className="text-sm text-muted-foreground">Monitor prestaties en optimaliseer</p>
          </div>
        </div>
        
        <Button onClick={onNext} size="lg" className="px-8">
          Laten we beginnen
        </Button>
        
        <p className="text-sm text-muted-foreground mt-4">
          Duurt ongeveer 5 minuten • Voortgang wordt automatisch opgeslagen
        </p>
      </CardContent>
    </Card>
  );
};
