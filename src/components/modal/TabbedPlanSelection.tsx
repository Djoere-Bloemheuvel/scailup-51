
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Target, TrendingUp, BarChart3, Crown, Shield, User, Mail, Users } from "lucide-react";

interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  benefits: string[];
  credits: {
    leads: string;
    emails: string;
    linkedin: string;
  };
  isOneTime?: boolean;
  hasGuarantee?: boolean;
  ctaText: string;
  badge?: string;
  color: string;
}

interface TabbedPlanSelectionProps {
  onPlanSelect: (planId: string) => void;
}

export const TabbedPlanSelection: React.FC<TabbedPlanSelectionProps> = ({
  onPlanSelect
}) => {
  const [activeTab, setActiveTab] = useState<string>('start-lead-engine');
  const plans: PlanOption[] = [{
    id: "start-lead-engine",
    name: "Start Your Lead Engine",
    price: "€49",
    period: "eenmalig",
    description: "Inclusief resultaatgarantie",
    icon: Target,
    isOneTime: true,
    hasGuarantee: true,
    badge: "Resultaatgarantie",
    ctaText: "Kies Start Your Lead Engine – €49 eenmalig",
    color: "from-blue-500 to-blue-600",
    credits: {
      leads: "1.000 Lead credits eenmalig",
      emails: "2.000 E-mail credits eenmalig",
      linkedin: "200 LinkedIn credits eenmalig"
    },
    benefits: ["Bewijs dat outbound werkt voor jouw bedrijf", "AI-gepersonaliseerde berichten op schaal", "Slimme LinkedIn-connecties met warming-up", "Leadverrijking en targeting volledig inbegrepen", "Resultaatgarantie: geen leads, geld terug", "SARAH AI als jouw persoonlijke sales assistent"]
  }, {
    id: "grow-lead-engine",
    name: "Grow Your Lead Engine",
    price: "€199",
    period: "per maand",
    description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
    icon: TrendingUp,
    ctaText: "Kies Grow Your Lead Engine – €199/maand",
    color: "from-green-500 to-green-600",
    credits: {
      leads: "1.000 Lead credits per maand",
      emails: "4.000 E-mail credits per maand",
      linkedin: "50 LinkedIn credits per week"
    },
    benefits: ["Consistente leadstroom voor groeiende bedrijven", "Maandelijkse quotum voor continue prospectie", "Wekelijkse LinkedIn-connecties voor netwerking", "Geavanceerde AI-campagnes met A/B-testing", "Volledige analytics en performance tracking", "SARAH AI optimaliseert campagnes automatisch"]
  }, {
    id: "scale-lead-engine",
    name: "Scale Your Lead Engine",
    price: "€499",
    period: "per maand",
    description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
    icon: BarChart3,
    ctaText: "Kies Scale Your Lead Engine – €499/maand",
    color: "from-purple-500 to-purple-600",
    credits: {
      leads: "2.500 Lead credits per maand",
      emails: "10.000 E-mail credits per maand",
      linkedin: "100 LinkedIn credits per week"
    },
    benefits: ["Schaal je outbound naar het volgende niveau", "Hoog volume prospectie met kwaliteitsbehoud", "Intensieve LinkedIn-strategie voor autoriteit", "Multi-channel campagnes met sequencing", "Realtime insights en conversion tracking", "SARAH AI beheert complexe sales funnels"]
  }, {
    id: "dominate-lead-engine",
    name: "Dominate Your Lead Engine",
    price: "€999",
    period: "per maand",
    description: "Start met 2× zoveel leads – exclusief voor nieuwe klanten",
    icon: Crown,
    ctaText: "Kies Dominate Your Lead Engine – €999/maand",
    color: "from-pink-500 to-pink-600",
    credits: {
      leads: "5.000 Lead credits per maand",
      emails: "20.000 E-mail credits per maand",
      linkedin: "100 LinkedIn credits per week"
    },
    benefits: ["Domineer je markt met enterprise-niveau outbound", "Maximale prospectie-capaciteit en reach", "Premium LinkedIn-strategie voor thought leadership", "Geavanceerde AI-orchestratie van alle kanalen", "Dedicated success manager en prioriteit support", "SARAH AI als volledige sales automation suite"]
  }];

  const handlePlanSelect = (planId: string) => {
    onPlanSelect(planId);
  };

  const getTabColorClasses = (planId: string, isActive: boolean) => {
    const colorMap = {
      'start-lead-engine': {
        active: 'bg-blue-500/10 border-blue-500/20',
        hover: 'hover:bg-blue-500/5 hover:scale-105',
        glow: 'shadow-blue-500/25 shadow-lg',
        text: 'text-blue-600',
        focusVisible: 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      },
      'grow-lead-engine': {
        active: 'bg-green-500/10 border-green-500/20',
        hover: 'hover:bg-green-500/5 hover:scale-105',
        glow: 'shadow-green-500/25 shadow-lg',
        text: 'text-green-600',
        focusVisible: 'focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2'
      },
      'scale-lead-engine': {
        active: 'bg-purple-500/10 border-purple-500/20',
        hover: 'hover:bg-purple-500/5 hover:scale-105',
        glow: 'shadow-purple-500/25 shadow-lg',
        text: 'text-purple-600',
        focusVisible: 'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2'
      },
      'dominate-lead-engine': {
        active: 'bg-pink-500/10 border-pink-500/20',
        hover: 'hover:bg-pink-500/5 hover:scale-105',
        glow: 'shadow-pink-500/25 shadow-lg',
        text: 'text-pink-600',
        focusVisible: 'focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2'
      }
    };
    return colorMap[planId as keyof typeof colorMap] || colorMap['start-lead-engine'];
  };

  const getCreditSubtext = (creditType: string, planId: string) => {
    const baseTexts = {
      leads: "Geverifieerde, verrijkte leads uit onze database",
      emails: "AI-gepersonaliseerde cold e-mails, automatisch verstuurd",
      linkedin: "Connectieverzoeken + AI-opvolging via je eigen account"
    };
    return baseTexts[creditType as keyof typeof baseTexts] || "";
  };

  const getCreditIconColor = (planId: string) => {
    const colorMap = {
      'start-lead-engine': 'text-blue-500',
      'grow-lead-engine': 'text-green-500',
      'scale-lead-engine': 'text-purple-500',
      'dominate-lead-engine': 'text-pink-500'
    };
    return colorMap[planId as keyof typeof colorMap] || 'text-blue-500';
  };

  const renderPlanDescription = (description: string, planId: string) => {
    if (planId !== 'start-lead-engine' && description.includes('Start met 2× zoveel leads')) {
      const parts = description.split(' – ');
      return <>
          {parts[0]} – <span className="text-muted-foreground">{parts[1]}</span>
        </>;
    }
    return description;
  };

  const getLeadBonusSubheader = (planId: string) => {
    const bonusMap = {
      'grow-lead-engine': 'Maand 1: 2.000 credits (i.p.v. 1.000)',
      'scale-lead-engine': 'Maand 1: 5.000 credits (i.p.v. 2.500)', 
      'dominate-lead-engine': 'Maand 1: 10.000 credits (i.p.v. 5.000)'
    };
    return bonusMap[planId as keyof typeof bonusMap] || null;
  };

  const renderLaunchBonusSubheader = (planId: string) => {
    // Only show launch bonus for growth plans (not the start plan)
    if (planId === 'start-lead-engine') {
      return null;
    }
    return;
  };

  return <div className="h-full flex flex-col max-h-[90vh] overflow-hidden">
      {/* Enhanced Tab Navigation */}
      <div className="mt-6 mb-6 flex justify-center">
        <div className="w-[92%] mx-auto">
          <div className="flex justify-between items-center gap-3">
            {plans.map(plan => {
            const isActive = activeTab === plan.id;
            const colorClasses = getTabColorClasses(plan.id, isActive);
            return <button key={plan.id} onClick={() => setActiveTab(plan.id)} className={`group relative flex flex-col items-center gap-2 p-3 flex-1 rounded-xl border-2 focus:outline-none ${colorClasses.focusVisible} ${isActive ? `${colorClasses.active} ${colorClasses.text}` : `text-muted-foreground hover:text-foreground border-transparent ${colorClasses.hover}`}`} style={{
              transition: 'all 0.2s ease-out'
            }}>
                  {/* Enhanced icon with glow effect */}
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${plan.color} p-2.5 text-white shadow-lg ${isActive ? `${colorClasses.glow} scale-110` : 'shadow-sm'}`} style={{
                transition: 'all 0.2s ease-out'
              }}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                  
                  {/* Enhanced typography */}
                  <div className="text-center">
                    <span className={`text-xs font-bold block leading-tight ${isActive ? colorClasses.text : 'text-foreground'}`}>
                      {plan.name.split(' ')[0]}
                    </span>
                    <span className={`text-xs font-medium block leading-tight ${isActive ? `${colorClasses.text}/80` : 'text-muted-foreground'}`}>
                      {plan.name.split(' ').slice(1).join(' ')}
                    </span>
                  </div>
                </button>;
          })}
          </div>
        </div>
      </div>

      {/* Compact Plan Details Section */}
      <div className="flex-1 overflow-y-auto px-6">
        {plans.map(plan => {
        const isActive = activeTab === plan.id;
        const colorClasses = getTabColorClasses(plan.id, isActive);
        const iconColor = getCreditIconColor(plan.id);
        return <div key={plan.id} className={`${isActive ? 'block' : 'hidden'} animate-fade-in`}>
              <div className={`rounded-xl border-2 shadow-lg ${isActive ? `${colorClasses.active}` : 'bg-background border-border'}`}>
                <div className="p-6">
                  {/* Header with Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${plan.color} text-white shadow-lg`}>
                        <plan.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground leading-tight">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {renderPlanDescription(plan.description, plan.id)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-3xl font-bold text-foreground">
                        {plan.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.period}
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Layout */}
                  <div className="flex gap-8 mb-6">
                    {/* Left Column: Benefits */}
                    <div className="flex-1">
                      {/* Guarantee Badge for Start Plan */}
                      {plan.hasGuarantee && <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg mb-4">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Resultaatgarantie
                          </span>
                        </div>}

                      <h4 className="text-lg font-semibold text-foreground mb-4">
                        Voordelen
                      </h4>
                      <div className="space-y-3">
                        {plan.benefits.map((benefit, index) => <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <Check className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-sm text-foreground font-medium leading-relaxed">
                              {benefit}
                            </span>
                          </div>)}
                      </div>
                    </div>

                    {/* Right Column: Credits with Theme-Matched Icons */}
                    <div className="w-72 flex-shrink-0">
                      <div className="bg-muted/30 rounded-lg p-5 border border-muted/50">
                        <h4 className="text-lg font-semibold text-foreground mb-4">
                          Inclusief credits
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <User className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5 opacity-70`} />
                            <div className="flex-1">
                              <div className="text-sm text-foreground font-medium">
                                {plan.credits.leads}
                              </div>
                              {getLeadBonusSubheader(plan.id) && (
                                <div className="text-xs text-muted-foreground/70 font-normal mt-0.5">
                                  {getLeadBonusSubheader(plan.id)}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {getCreditSubtext('leads', plan.id)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5 opacity-70`} />
                            <div className="flex-1">
                              <div className="text-sm text-foreground font-medium">
                                {plan.credits.emails}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {getCreditSubtext('emails', plan.id)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Users className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5 opacity-70`} />
                            <div className="flex-1">
                              <div className="text-sm text-foreground font-medium">
                                {plan.credits.linkedin}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {getCreditSubtext('linkedin', plan.id)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex justify-center">
                    <Button onClick={() => handlePlanSelect(plan.id)} className={`px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r ${plan.color} text-white hover:scale-105`}>
                      {plan.ctaText}
                    </Button>
                  </div>
                </div>
              </div>
            </div>;
      })}
      </div>
    </div>;
};
