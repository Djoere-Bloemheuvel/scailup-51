
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Users, 
  Check, 
  ArrowRight, 
  Sparkles,
  Crown,
  Zap,
  Target
} from "lucide-react";

interface PlanSelectionStepProps {
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
  onNext: () => void;
}

const plans = [
  {
    id: "start-lead-engine",
    name: "Start Your Lead Engine",
    price: "€49",
    period: "eenmalig",
    description: "Inclusief resultaatgarantie",
    icon: Zap,
    gradient: "from-blue-600 via-blue-700 to-blue-800",
    credits: {
      leads: "1.000 Lead credits eenmalig",
      emails: "2.000 E-mail credits eenmalig",
      linkedin: "200 LinkedIn credits eenmalig"
    },
    benefits: [
      "Bewijs dat outbound werkt voor jouw bedrijf",
      "AI-gepersonaliseerde berichten op schaal", 
      "Slimme LinkedIn-connecties met warming-up",
      "Leadverrijking en targeting volledig inbegrepen",
      "Resultaatgarantie: geen leads, geld terug",
      "SARAH AI als jouw persoonlijke sales assistent"
    ]
  },
  {
    id: "grow-lead-engine", 
    name: "Grow Your Lead Engine",
    price: "€199",
    period: "per maand",
    description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
    icon: Target,
    gradient: "from-emerald-600 via-emerald-700 to-emerald-800",
    credits: {
      leads: "1.000 Lead credits per maand",
      leadsBonusFirst: "2.000 Lead credits maand 1",
      emails: "4.000 E-mail credits per maand", 
      linkedin: "50 LinkedIn credits per week"
    },
    benefits: [
      "Consistente leadstroom voor groeiende bedrijven",
      "Maandelijkse quotum voor continue prospectie",
      "Wekelijkse LinkedIn-connecties voor netwerking", 
      "Geavanceerde AI-campagnes met A/B-testing",
      "Volledige analytics en performance tracking",
      "SARAH AI optimaliseert campagnes automatisch"
    ]
  },
  {
    id: "scale-lead-engine",
    name: "Scale Your Lead Engine", 
    price: "€499",
    period: "per maand",
    description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
    icon: Sparkles,
    gradient: "from-purple-600 via-purple-700 to-purple-800",
    credits: {
      leads: "2.500 Lead credits per maand",
      leadsBonusFirst: "5.000 Lead credits maand 1",
      emails: "10.000 E-mail credits per maand",
      linkedin: "100 LinkedIn credits per week"
    },
    benefits: [
      "Schaal je outbound naar het volgende niveau",
      "Hoog volume prospectie met kwaliteitsbehoud", 
      "Intensieve LinkedIn-strategie voor autoriteit",
      "Multi-channel campagnes met sequencing",
      "Realtime insights en conversion tracking",
      "SARAH AI beheert complexe sales funnels"
    ]
  },
  {
    id: "dominate-lead-engine",
    name: "Dominate Your Lead Engine",
    price: "€999", 
    period: "per maand",
    description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
    icon: Crown,
    gradient: "from-[#51102E] via-[#761E41] to-[#A92759]",
    credits: {
      leads: "5.000 Lead credits per maand",
      leadsBonusFirst: "10.000 Lead credits maand 1", 
      emails: "20.000 E-mail credits per maand",
      linkedin: "100 LinkedIn credits per week"
    },
    benefits: [
      "Domineer je markt met enterprise-niveau outbound",
      "Maximale prospectie-capaciteit en reach",
      "Premium LinkedIn-strategie voor thought leadership",
      "Geavanceerde AI-orchestratie van alle kanalen", 
      "Dedicated success manager en prioriteit support",
      "SARAH AI als volledige sales automation suite"
    ]
  }
];

export const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  selectedPlan,
  onPlanSelect,
  onNext
}) => {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    return num.toLocaleString('nl-NL');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="text-center mb-8 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Kies jouw Lead Engine pakket
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Start vandaag nog met het genereren van leads. Alle pakketten bevatten dezelfde functies, 
          alleen het aantal credits verschilt.
        </p>
      </div>

      {/* Plans Grid - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isHovered = hoveredPlan === plan.id;
            const IconComponent = plan.icon;
            
            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-primary shadow-lg scale-[1.02]'
                    : isHovered
                    ? 'border-primary/50 shadow-md scale-[1.01]'
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => onPlanSelect(plan.id)}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Premium Header with Gradient */}
                <div className={`px-6 py-4 bg-gradient-to-r ${plan.gradient} text-white relative overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
                  </div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>
                        <p className="text-white/90 text-xs font-medium">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tracking-tight">{plan.price}</div>
                      <div className="text-white/90 text-xs font-medium">{plan.period}</div>
                    </div>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="secondary" className="bg-white text-primary font-medium shadow-lg">
                        <Check className="h-3 w-3 mr-1" />
                        Geselecteerd
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-0">
                  <div className="grid grid-cols-2">
                    {/* Left Column: Benefits */}
                    <div className="p-5 border-r border-border/20">
                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <h4 className="text-sm font-semibold text-foreground">Voordelen</h4>
                        </div>
                      </div>
                      
                      <div className="space-y-2.5">
                        {plan.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground leading-relaxed">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Credits - Reduced Height by ~10% */}
                    <div className="p-4 bg-accent/20"> {/* Reduced from p-5 to p-4 */}
                      <div className="space-y-1 mb-3.5"> {/* Reduced from mb-4 to mb-3.5 */}
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <h4 className="text-sm font-semibold text-foreground">Inclusief credits</h4>
                        </div>
                      </div>
                      
                      {/* Credits List - Tighter Spacing */}
                      <div className="space-y-2.5"> {/* Reduced from space-y-3 to space-y-2.5 */}
                        {/* Lead Credits */}
                        <div className="flex items-start gap-2.5"> {/* Reduced from gap-3 to gap-2.5 */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-blue-100/80 flex items-center justify-center"> {/* Reduced from w-6 h-6 to w-5 h-5 */}
                              <User className="h-3 w-3 text-blue-600" /> {/* Reduced from h-3.5 w-3.5 to h-3 w-3 */}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1.5"> {/* Reduced from space-y-2 to space-y-1.5 */}
                            <div className="text-xs font-semibold text-foreground leading-tight"> {/* Reduced from text-sm to text-xs */}
                              {plan.credits.leads}
                            </div>
                            {plan.credits.leadsBonusFirst && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200/50"> {/* Reduced padding */}
                                <span className="text-xs font-medium text-emerald-700"> {/* Reduced from text-xs to text-xs */}
                                  🎉 Maand 1: {plan.credits.leadsBonusFirst.replace('credits', 'credits')}
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground leading-snug"> {/* Reduced from leading-relaxed to leading-snug */}
                              Geverifieerde, verrijkte leads uit onze database
                            </p>
                          </div>
                        </div>

                        {/* Email Credits */}
                        <div className="flex items-start gap-2.5"> {/* Reduced from gap-3 to gap-2.5 */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-green-100/80 flex items-center justify-center"> {/* Reduced from w-6 h-6 to w-5 h-5 */}
                              <Mail className="h-3 w-3 text-green-600" /> {/* Reduced from h-3.5 w-3.5 to h-3 w-3 */}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1.5"> {/* Reduced from space-y-2 to space-y-1.5 */}
                            <div className="text-xs font-semibold text-foreground leading-tight"> {/* Reduced from text-sm to text-xs */}
                              {plan.credits.emails}
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug"> {/* Reduced from leading-relaxed to leading-snug */}
                              AI-gepersonaliseerde cold emails, automatisch verzonden
                            </p>
                          </div>
                        </div>

                        {/* LinkedIn Credits */}
                        <div className="flex items-start gap-2.5"> {/* Reduced from gap-3 to gap-2.5 */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-purple-100/80 flex items-center justify-center"> {/* Reduced from w-6 h-6 to w-5 h-5 */}
                              <Users className="h-3 w-3 text-purple-600" /> {/* Reduced from h-3.5 w-3.5 to h-3 w-3 */}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1.5"> {/* Reduced from space-y-2 to space-y-1.5 */}
                            <div className="text-xs font-semibold text-foreground leading-tight"> {/* Reduced from text-sm to text-xs */}
                              {plan.credits.linkedin}
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug"> {/* Reduced from leading-relaxed to leading-snug */}
                              Connectieverzoeken + AI follow-ups via je eigen account
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced BTW Notice */}
                  <div className="px-6 py-3 bg-muted/30 border-t border-border/20"> {/* Reduced from py-4 to py-3 */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-xs font-medium text-muted-foreground"> {/* Reduced from text-sm to text-xs */}
                        Alle prijzen zijn exclusief BTW
                      </span>
                    </div>
                  </div>
                </CardContent>

                {/* CTA Button */}
                <div className="p-4"> {/* Reduced from p-6 to p-4 */}
                  <Button
                    className={`w-full h-11 font-medium text-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'
                        : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanSelect(plan.id);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Geselecteerd
                      </>
                    ) : (
                      <>
                        Kies {plan.name.replace('Your Lead Engine', '')} – {plan.price}/{plan.period === 'eenmalig' ? 'eenmalig' : 'maand'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sticky Continue Button */}
      <div className="flex-shrink-0 sticky bottom-0 border-t border-border/20 bg-background/95 backdrop-blur-sm">
        <div className="p-4">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 h-12 shadow-lg hover:shadow-xl transition-all font-medium"
            disabled={!selectedPlan}
          >
            Ga verder naar bestelling
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
