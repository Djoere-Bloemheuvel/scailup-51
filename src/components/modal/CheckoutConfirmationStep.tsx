
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckoutSummaryRedesigned } from './CheckoutSummaryRedesigned';
import { ArrowLeft, CreditCard } from "lucide-react";

interface CheckoutConfirmationStepProps {
  selectedPlan: string;
  onBack: () => void;
  onConfirm: () => void;
}

export const CheckoutConfirmationStep: React.FC<CheckoutConfirmationStepProps> = ({
  selectedPlan,
  onBack,
  onConfirm
}) => {
  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Bevestig je bestelling
        </h2>
        <p className="text-base text-muted-foreground">
          Controleer je gekozen pakket voordat je verder gaat
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 mb-4">
          <CheckoutSummaryRedesigned 
            selectedPlan={selectedPlan} 
            onChangePlan={onBack}
          />
        </div>
        
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-t border-border/50 -mx-6 px-6 py-4 mt-auto">
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-1 h-9"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar pakketten
            </Button>
            
            <Button
              onClick={onConfirm}
              size="sm"
              className="flex items-center gap-2 flex-1 bg-primary hover:bg-primary/90 h-9"
            >
              <CreditCard className="h-4 w-4" />
              Ga verder naar betaling
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
