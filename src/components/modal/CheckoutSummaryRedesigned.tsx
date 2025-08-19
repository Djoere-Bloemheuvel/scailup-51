
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User, Mail, Users, ShoppingCart, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreditInfo {
  amount: number;
  period: string;
  description: string;
  bonusAmount?: number;
}

interface PlanData {
  id: string;
  name: string;
  price: string;
  period: string;
  credits: {
    leads: CreditInfo;
    emails: CreditInfo;
    linkedin: CreditInfo;
  };
  color: string;
}

interface CheckoutSummaryRedesignedProps {
  selectedPlan: string;
  onChangePlan?: () => void;
}

export const CheckoutSummaryRedesigned: React.FC<CheckoutSummaryRedesignedProps> = ({
  selectedPlan,
  onChangePlan
}) => {
  // Plan data based on Supabase structure
  const planData: Record<string, PlanData> = {
    'start-lead-engine': {
      id: 'start-lead-engine',
      name: 'Start Your Lead Engine',
      price: '€99',
      period: 'per maand',
      color: 'from-blue-500 to-blue-600',
      credits: {
        leads: {
          amount: 500,
          period: 'per maand',
          description: 'Geverifieerde, verrijkte leads uit onze database',
          bonusAmount: 1000
        },
        emails: {
          amount: 2000,
          period: 'per maand',
          description: 'AI-gepersonaliseerde cold emails, automatisch verzonden'
        },
        linkedin: {
          amount: 25,
          period: 'per week',
          description: 'Connectieverzoeken + AI follow-ups via je eigen account'
        }
      }
    },
    'grow-lead-engine': {
      id: 'grow-lead-engine',
      name: 'Grow Your Lead Engine',
      price: '€199',
      period: 'per maand',
      color: 'from-green-500 to-green-600',
      credits: {
        leads: {
          amount: 1000,
          period: 'per maand',
          description: 'Geverifieerde, verrijkte leads uit onze database',
          bonusAmount: 2000
        },
        emails: {
          amount: 4000,
          period: 'per maand',
          description: 'AI-gepersonaliseerde cold emails, automatisch verzonden'
        },
        linkedin: {
          amount: 50,
          period: 'per week',
          description: 'Connectieverzoeken + AI follow-ups via je eigen account'
        }
      }
    },
    'scale-lead-engine': {
      id: 'scale-lead-engine',
      name: 'Scale Your Lead Engine',
      price: '€499',
      period: 'per maand',
      color: 'from-purple-500 to-purple-600',
      credits: {
        leads: {
          amount: 2500,
          period: 'per maand',
          description: 'Geverifieerde, verrijkte leads uit onze database',
          bonusAmount: 5000
        },
        emails: {
          amount: 10000,
          period: 'per maand',
          description: 'AI-gepersonaliseerde cold emails, automatisch verzonden'
        },
        linkedin: {
          amount: 100,
          period: 'per week',
          description: 'Connectieverzoeken + AI follow-ups via je eigen account'
        }
      }
    },
    'dominate-lead-engine': {
      id: 'dominate-lead-engine',
      name: 'Dominate Your Lead Engine',
      price: '€999',
      period: 'per maand',
      color: 'from-pink-500 to-pink-600',
      credits: {
        leads: {
          amount: 5000,
          period: 'per maand',
          description: 'Geverifieerde, verrijkte leads uit onze database',
          bonusAmount: 10000
        },
        emails: {
          amount: 20000,
          period: 'per maand',
          description: 'AI-gepersonaliseerde cold emails, automatisch verzonden'
        },
        linkedin: {
          amount: 100,
          period: 'per week',
          description: 'Connectieverzoeken + AI follow-ups via je eigen account'
        }
      }
    }
  };

  const plan = planData[selectedPlan];

  if (!plan) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <p className="text-muted-foreground text-center text-sm">Plan niet gevonden</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('nl-NL');
  };

  // Get plan theme colors and styling
  const getPlanTheme = () => {
    if (selectedPlan.includes('start')) {
      return {
        gradient: 'from-blue-500 to-blue-600',
        border: 'border-blue-500/20',
        bg: 'bg-blue-500/5',
        text: 'text-blue-600',
        icon: 'text-blue-500',
        accent: 'bg-blue-500'
      };
    }
    if (selectedPlan.includes('grow')) {
      return {
        gradient: 'from-green-500 to-green-600',
        border: 'border-green-500/20',
        bg: 'bg-green-500/5',
        text: 'text-green-600',
        icon: 'text-green-500',
        accent: 'bg-green-500'
      };
    }
    if (selectedPlan.includes('scale')) {
      return {
        gradient: 'from-purple-500 to-purple-600',
        border: 'border-purple-500/20',
        bg: 'bg-purple-500/5',
        text: 'text-purple-600',
        icon: 'text-purple-500',
        accent: 'bg-purple-500'
      };
    }
    if (selectedPlan.includes('dominate')) {
      return {
        gradient: 'from-pink-500 to-pink-600',
        border: 'border-pink-500/20',
        bg: 'bg-pink-500/5',
        text: 'text-pink-600',
        icon: 'text-pink-500',
        accent: 'bg-pink-500'
      };
    }
    return {
      gradient: 'from-primary to-primary/80',
      border: 'border-primary/20',
      bg: 'bg-primary/5',
      text: 'text-primary',
      icon: 'text-primary',
      accent: 'bg-primary'
    };
  };

  const theme = getPlanTheme();

  return (
    <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden scroll-smooth">
      <Card className="border-border/50 bg-card/90 backdrop-blur-sm shadow-xl">
        {/* Product tile header */}
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className={`h-4 w-4 ${theme.icon}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                🧾 Gekozen pakket
              </span>
            </div>
            {onChangePlan && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onChangePlan}
                className={`h-7 px-2 text-xs ${theme.text} hover:${theme.bg} transition-colors`}
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Wijzig
              </Button>
            )}
          </div>

          {/* Plan tile with gradient background */}
          <div className={`rounded-xl p-4 bg-gradient-to-br ${theme.gradient} text-white relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold leading-tight mb-1">
                    {plan.name}
                  </h2>
                  <div className="text-white/80 text-xs">
                    Jouw gekozen leadgeneratie pakket
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold">
                    {plan.price}
                  </div>
                  <div className="text-white/90 text-xs font-medium">
                    {plan.period}
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative background pattern */}
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10"></div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/5"></div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          {/* Credits section */}
          <div className={`rounded-lg p-4 border ${theme.border} ${theme.bg}`}>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${theme.accent}`}></div>
              Inclusief credits
            </h3>
            
            <div className="space-y-3">
              {/* Lead Credits */}
              <div className="flex items-start gap-3">
                <User className={`h-4 w-4 ${theme.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">
                    {formatNumber(plan.credits.leads.amount)} Lead credits {plan.credits.leads.period}
                  </div>
                  {plan.credits.leads.bonusAmount && (
                    <div className={`text-xs font-medium ${theme.text} bg-white/60 px-2 py-1 rounded-md inline-block`}>
                      🎉 Maand 1: {formatNumber(plan.credits.leads.bonusAmount)} credits (i.p.v. {formatNumber(plan.credits.leads.amount)})
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {plan.credits.leads.description}
                  </div>
                </div>
              </div>

              {/* Email Credits */}
              <div className="flex items-start gap-3">
                <Mail className={`h-4 w-4 ${theme.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">
                    {formatNumber(plan.credits.emails.amount)} E-mail credits {plan.credits.emails.period}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {plan.credits.emails.description}
                  </div>
                </div>
              </div>

              {/* LinkedIn Credits */}
              <div className="flex items-start gap-3">
                <Users className={`h-4 w-4 ${theme.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">
                    {formatNumber(plan.credits.linkedin.amount)} LinkedIn credits {plan.credits.linkedin.period}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {plan.credits.linkedin.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className={`p-3 rounded-lg border ${theme.border} ${theme.bg}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${theme.accent}`}></div>
              <span className="text-xs font-medium text-foreground">
                Alle prijzen zijn exclusief BTW
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
