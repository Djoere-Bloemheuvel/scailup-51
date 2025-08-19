
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ModuleConfirmationSummary } from './ModuleConfirmationSummary';
import { ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";

interface SelectedModule {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  credits: {
    leads: { amount: number; period: string; description: string; bonusAmount?: number };
    emails: { amount: number; period: string; description: string };
    linkedin: { amount: number; period: string; description: string };
  };
  stripeProductId?: string;
}

interface CheckoutConfirmationStepCartProps {
  selectedPlan: string;
  onBack: () => void;
  onConfirm: () => void;
}

export const CheckoutConfirmationStepCart: React.FC<CheckoutConfirmationStepCartProps> = ({
  selectedPlan,
  onBack,
  onConfirm
}) => {
  const getPlanData = (planId: string) => {
    const plans = [
      {
        id: "start-lead-engine",
        name: "Start Your Lead Engine",
        price: "€49",
        numericPrice: 49,
        period: "eenmalig",
        description: "Inclusief resultaatgarantie",
        credits: {
          leads: "1.000 Lead credits eenmalig",
          emails: "2.000 E-mail credits eenmalig",
          linkedin: "200 LinkedIn credits eenmalig"
        },
        benefits: ["Bewijs dat outbound werkt voor jouw bedrijf", "AI-gepersonaliseerde berichten op schaal", "Slimme LinkedIn-connecties met warming-up", "Leadverrijking en targeting volledig inbegrepen", "Resultaatgarantie: geen leads, geld terug", "SARAH AI als jouw persoonlijke sales assistent"]
      },
      {
        id: "grow-lead-engine",
        name: "Grow Your Lead Engine",
        price: "€199",
        numericPrice: 199,
        period: "per maand",
        description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
        credits: {
          leads: "1.000 Lead credits per maand",
          emails: "4.000 E-mail credits per maand",
          linkedin: "50 LinkedIn credits per week"
        },
        benefits: ["Consistente leadstroom voor groeiende bedrijven", "Maandelijkse quotum voor continue prospectie", "Wekelijkse LinkedIn-connecties voor netwerking", "Geavanceerde AI-campagnes met A/B-testing", "Volledige analytics en performance tracking", "SARAH AI optimaliseert campagnes automatisch"]
      },
      {
        id: "scale-lead-engine",
        name: "Scale Your Lead Engine",
        price: "€499",
        numericPrice: 499,
        period: "per maand",
        description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
        credits: {
          leads: "2.500 Lead credits per maand",
          emails: "10.000 E-mail credits per maand",
          linkedin: "100 LinkedIn credits per week"
        },
        benefits: ["Schaal je outbound naar het volgende niveau", "Hoog volume prospectie met kwaliteitsbehoud", "Intensieve LinkedIn-strategie voor autoriteit", "Multi-channel campagnes met sequencing", "Realtime insights en conversion tracking", "SARAH AI beheert complexe sales funnels"]
      },
      {
        id: "dominate-lead-engine",
        name: "Dominate Your Lead Engine",
        price: "€999",
        numericPrice: 999,
        period: "per maand",
        description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
        credits: {
          leads: "5.000 Lead credits per maand",
          emails: "20.000 E-mail credits per maand",
          linkedin: "100 LinkedIn credits per week"
        },
        benefits: ["Domineer je markt met enterprise-niveau outbound", "Maximale prospectie-capaciteit en reach", "Premium LinkedIn-strategie voor thought leadership", "Geavanceerde AI-orchestratie van alle kanalen", "Dedicated success manager en prioriteit support", "SARAH AI als volledige sales automation suite"]
      }
    ];

    return plans.find(p => p.id === planId);
  };

  const planData = getPlanData(selectedPlan);
  
  const getSelectedModules = (): SelectedModule[] => {
    if (!planData) return [];

    // Use the numeric price from the plan data instead of parsing
    const numericPrice = planData.numericPrice * 100; // Convert to cents for consistency

    const getCreditsForPlan = (planId: string) => {
      if (planId.includes('start')) {
        return {
          leads: { amount: 1000, period: 'eenmalig', description: 'Geverifieerde, verrijkte leads uit onze database' },
          emails: { amount: 2000, period: 'eenmalig', description: 'AI-gepersonaliseerde cold emails, automatisch verzonden' },
          linkedin: { amount: 200, period: 'eenmalig', description: 'Connectieverzoeken + AI follow-ups via je eigen account' }
        };
      }
      if (planId.includes('grow')) {
        return {
          leads: { amount: 1000, period: 'per maand', description: 'Geverifieerde, verrijkte leads uit onze database', bonusAmount: 2000 },
          emails: { amount: 4000, period: 'per maand', description: 'AI-gepersonaliseerde cold emails, automatisch verzonden' },
          linkedin: { amount: 50, period: 'per week', description: 'Connectieverzoeken + AI follow-ups via je eigen account' }
        };
      }
      if (planId.includes('scale')) {
        return {
          leads: { amount: 2500, period: 'per maand', description: 'Geverifieerde, verrijkte leads uit onze database', bonusAmount: 5000 },
          emails: { amount: 10000, period: 'per maand', description: 'AI-gepersonaliseerde cold emails, automatisch verzonden' },
          linkedin: { amount: 100, period: 'per week', description: 'Connectieverzoeken + AI follow-ups via je eigen account' }
        };
      }
      if (planId.includes('dominate')) {
        return {
          leads: { amount: 5000, period: 'per maand', description: 'Geverifieerde, verrijkte leads uit onze database', bonusAmount: 10000 },
          emails: { amount: 20000, period: 'per maand', description: 'AI-gepersonaliseerde cold emails, automatisch verzonden' },
          linkedin: { amount: 100, period: 'per week', description: 'Connectieverzoeken + AI follow-ups via je eigen account' }
        };
      }
      return {
        leads: { amount: 1000, period: 'eenmalig', description: 'Geverifieerde, verrijkte leads uit onze database' },
        emails: { amount: 2000, period: 'eenmalig', description: 'AI-gepersonaliseerde cold emails, automatisch verzonden' },
        linkedin: { amount: 200, period: 'eenmalig', description: 'Connectieverzoeken + AI follow-ups via je eigen account' }
      };
    };

    return [{
      id: selectedPlan,
      slug: selectedPlan,
      name: planData.name,
      price: numericPrice, // Now using the correct price in cents
      currency: 'EUR',
      credits: getCreditsForPlan(selectedPlan),
      stripeProductId: 'temp-product-id'
    }];
  };

  const [selectedModules, setSelectedModules] = useState<SelectedModule[]>(getSelectedModules());

  const handleRemoveModule = (moduleId: string) => {
    setSelectedModules(prev => prev.filter(m => m.id !== moduleId));
  };

  const handleAddModule = (moduleId: string) => {
    // For now, we don't allow adding additional modules in the summary step
    // This maintains the current behavior while ensuring the selected plan is displayed
  };

  // Calculate totals for VAT summary
  const calculateTotals = () => {
    const totalExclVAT = selectedModules.reduce((sum, module) => sum + (module.price / 100), 0);
    const vatAmount = totalExclVAT * 0.21;
    const totalInclVAT = totalExclVAT + vatAmount;
    
    return {
      exclVAT: totalExclVAT,
      vatAmount,
      inclVAT: totalInclVAT
    };
  };

  const totals = calculateTotals();

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="text-center mb-6 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2.5 rounded-full bg-primary/10 border border-primary/20">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Bevestig je bestelling
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Controleer je gekozen pakket voordat je verdergaat naar de betaling
        </p>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <ModuleConfirmationSummary
            selectedModules={selectedModules}
            onRemoveModule={handleRemoveModule}
            onAddModule={handleAddModule}
            onChangePlan={onBack}
          />
        </div>
      </div>

      {/* Summary Section - Above CTA */}
      <div className="flex-shrink-0 border-t border-border/20 bg-[#12101A] mt-4">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 font-medium">Totaal (excl. BTW):</span>
            <span className="text-white font-semibold">€{totals.exclVAT.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 font-medium">Totaal (incl. 21% BTW):</span>
            <span className="text-white font-bold text-base">€{totals.inclVAT.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
      
      {/* Sticky Action Buttons */}
      <div className="flex-shrink-0 sticky bottom-0 border-t border-border/20 bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="default"
            className="flex items-center gap-2 flex-1 h-11 border-border/40 hover:border-border hover:bg-accent/40 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar pakketten
          </Button>
          
          <Button
            onClick={onConfirm}
            size="default"
            className="flex items-center gap-2 flex-1 bg-primary hover:bg-primary/90 h-11 shadow-lg hover:shadow-xl transition-all font-medium"
            disabled={selectedModules.length === 0}
          >
            <CreditCard className="h-4 w-4" />
            Ga verder naar betaling
          </Button>
        </div>
      </div>
    </div>
  );
};
