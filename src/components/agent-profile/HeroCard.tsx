
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Settings } from 'lucide-react';

interface HeroCardProps {
  onSave: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ onSave }) => {
  return (
    <div className="text-center space-y-6 py-8">
      <h1 className="text-lg text-muted-foreground mb-8">
        👋 Jouw AI sales agent configureren
      </h1>
      
      <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-bold text-foreground">SARAH AI</h2>
              <p className="text-sm text-muted-foreground">Altijd actief • 24/7 beschikbaar</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-base text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary">S</span>ales • 
              <span className="font-semibold text-primary"> A</span>utomatisering • 
              <span className="font-semibold text-primary"> R</span>elatie-opbouw • 
              <span className="font-semibold text-primary"> A</span>fspraken • 
              <span className="font-semibold text-primary"> H</span>yperpersonalisatie
            </p>
          </div>

          <Button onClick={onSave} size="lg" className="gap-2 mt-6">
            <Settings className="h-4 w-4" />
            Configuratie Opslaan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
