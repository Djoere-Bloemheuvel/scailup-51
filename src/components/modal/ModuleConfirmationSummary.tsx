import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  User, 
  Mail, 
  Users, 
  Settings, 
  Edit3, 
  ChevronDown, 
  ChevronRight, 
  Plus,
  X,
  AlertCircle,
  Check,
  ShoppingBag
} from "lucide-react";
import { useModulePricing } from "@/hooks/useModulePricing";

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

interface ModuleConfirmationSummaryProps {
  selectedModules: SelectedModule[];
  onRemoveModule: (moduleId: string) => void;
  onAddModule: (moduleId: string) => void;
  onChangePlan?: () => void;
}

export const ModuleConfirmationSummary: React.FC<ModuleConfirmationSummaryProps> = ({
  selectedModules,
  onRemoveModule,
  onAddModule,
  onChangePlan
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const { data: availableModules } = useModulePricing();

  const toggleExpanded = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('nl-NL');
  };

  const formatPrice = (priceInCents: number, currency: string) => {
    const price = priceInCents / 100;
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${price.toFixed(0)}`;
  };

  const getModuleTheme = (slug: string) => {
    if (slug.includes('start')) {
      return {
        gradient: 'from-blue-600 via-blue-700 to-blue-800',
        border: 'border-blue-200/30',
        bg: 'bg-blue-50/50',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        accent: 'bg-blue-100/80',
        glow: 'shadow-blue-500/20',
        // Enhanced properties for Step 2 interior styling
        interiorBg: 'bg-[#12101A]',
        interiorBorder: 'border-blue-400/20',
        bulletBg: 'bg-blue-400/15',
        bulletIcon: 'text-blue-400',
        badgeBg: 'bg-blue-400/10 border-blue-400/25',
        badgeText: 'text-blue-300',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        noticeBar: 'bg-blue-400/8 border-blue-400/15'
      };
    }
    if (slug.includes('grow')) {
      return {
        gradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
        border: 'border-emerald-200/30',
        bg: 'bg-emerald-50/50',
        text: 'text-emerald-700',
        icon: 'text-emerald-600',
        accent: 'bg-emerald-100/80',
        glow: 'shadow-emerald-500/20',
        // Enhanced properties for Step 2 interior styling
        interiorBg: 'bg-[#12101A]',
        interiorBorder: 'border-emerald-400/20',
        bulletBg: 'bg-emerald-400/15',
        bulletIcon: 'text-emerald-400',
        badgeBg: 'bg-emerald-400/10 border-emerald-400/25',
        badgeText: 'text-emerald-300',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        noticeBar: 'bg-emerald-400/8 border-emerald-400/15'
      };
    }
    if (slug.includes('scale')) {
      return {
        gradient: 'from-purple-600 via-purple-700 to-purple-800',
        border: 'border-purple-200/30',
        bg: 'bg-purple-50/50',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        accent: 'bg-purple-100/80',
        glow: 'shadow-purple-500/20',
        // Enhanced properties for Step 2 interior styling
        interiorBg: 'bg-[#12101A]',
        interiorBorder: 'border-purple-400/20',
        bulletBg: 'bg-purple-400/15',
        bulletIcon: 'text-purple-400',
        badgeBg: 'bg-purple-400/10 border-purple-400/25',
        badgeText: 'text-purple-300',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        noticeBar: 'bg-purple-400/8 border-purple-400/15'
      };
    }
    if (slug.includes('dominate')) {
      return {
        gradient: 'from-[#51102E] via-[#761E41] to-[#A92759]',
        border: 'border-[#A92759]',
        bg: 'bg-rose-50/50',
        text: 'text-[#F88FC4]',
        icon: 'text-[#E973A7]',
        accent: 'bg-rose-100/80',
        glow: 'shadow-[#A92759]/20',
        // Enhanced properties for Step 2 interior styling
        interiorBg: 'bg-[#12101A]',
        interiorBorder: 'border-[#A92759]/20',
        bulletBg: 'bg-[#F88FC4]/15',
        bulletIcon: 'text-[#F88FC4]',
        badgeBg: 'bg-[#F88FC4]/10 border-[#F88FC4]/25',
        badgeText: 'text-[#F88FC4]',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        noticeBar: 'bg-[#F88FC4]/8 border-[#F88FC4]/15'
      };
    }
    if (slug.includes('marketing')) {
      return {
        gradient: 'from-orange-600 via-orange-700 to-orange-800',
        border: 'border-orange-200/30',
        bg: 'bg-orange-50/50',
        text: 'text-orange-700',
        icon: 'text-orange-600',
        accent: 'bg-orange-100/80',
        glow: 'shadow-orange-500/20',
        // Enhanced properties for Step 2 interior styling
        interiorBg: 'bg-[#12101A]',
        interiorBorder: 'border-orange-400/20',
        bulletBg: 'bg-orange-400/15',
        bulletIcon: 'text-orange-400',
        badgeBg: 'bg-orange-400/10 border-orange-400/25',
        badgeText: 'text-orange-300',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        noticeBar: 'bg-orange-400/8 border-orange-400/15'
      };
    }
    if (slug.includes('sales')) {
      return {
        gradient: 'from-red-600 via-red-700 to-red-800',
        border: 'border-red-200/30',
        bg: 'bg-red-50/50',
        text: 'text-red-700',
        icon: 'text-red-600',
        accent: 'bg-red-100/80',
        glow: 'shadow-red-500/20',
        // Enhanced properties for Step 2 interior styling
        interiorBg: 'bg-[#12101A]',
        interiorBorder: 'border-red-400/20',
        bulletBg: 'bg-red-400/15',
        bulletIcon: 'text-red-400',
        badgeBg: 'bg-red-400/10 border-red-400/25',
        badgeText: 'text-red-300',
        textPrimary: 'text-white',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-400',
        noticeBar: 'bg-red-400/8 border-red-400/15'
      };
    }
    return {
      gradient: 'from-primary via-primary/90 to-primary/80',
      border: 'border-primary/20',
      bg: 'bg-primary/5',
      text: 'text-primary',
      icon: 'text-primary',
      accent: 'bg-primary/10',
      glow: 'shadow-primary/20',
      // Enhanced properties for Step 2 interior styling
      interiorBg: 'bg-[#12101A]',
      interiorBorder: 'border-primary/20',
      bulletBg: 'bg-primary/15',
      bulletIcon: 'text-primary',
      badgeBg: 'bg-primary/10 border-primary/25',
      badgeText: 'text-primary',
      textPrimary: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      noticeBar: 'bg-primary/8 border-primary/15'
    };
  };

  const totalPrice = selectedModules.reduce((sum, module) => sum + module.price, 0);
  const totalCurrency = selectedModules[0]?.currency || 'EUR';

  // Separate main plan and add-on modules
  const mainPlan = selectedModules.find(m => 
    m.slug.includes('start') || m.slug.includes('grow') || 
    m.slug.includes('scale') || m.slug.includes('dominate')
  );
  
  const addOnModules = selectedModules.filter(m => 
    m.slug.includes('marketing') || m.slug.includes('sales')
  );

  const availableToAdd = availableModules?.filter(module => 
    module.is_active && 
    module.stripe_product_id && 
    !selectedModules.some(selected => selected.id === module.id) &&
    (module.module_slug.includes('marketing') || module.module_slug.includes('sales'))
  ) || [];

  const comingSoonModules = availableModules?.filter(module => 
    module.is_active && 
    !module.stripe_product_id && 
    !selectedModules.some(selected => selected.id === module.id) &&
    (module.module_slug.includes('marketing') || module.module_slug.includes('sales'))
  ) || [];

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Gekozen pakket
            </span>
          </div>
        </div>
        {onChangePlan && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangePlan}
            className="h-8 px-3 text-xs text-primary hover:text-primary/80 transition-colors border border-primary/20 hover:border-primary/30 hover:bg-primary/5"
          >
            <Edit3 className="h-3 w-3 mr-1.5" />
            Wijzig
          </Button>
        )}
      </div>

      {/* Main Lead Engine Plan - Enhanced with Fully Rounded Card */}
      {mainPlan && (
        <div className="rounded-xl overflow-hidden shadow-2xl">
          <Collapsible 
            open={expandedModules.has(mainPlan.id)} 
            onOpenChange={() => toggleExpanded(mainPlan.id)}
          >
            {/* Premium Gradient Header - Matches Step 1 */}
            <CollapsibleTrigger className="w-full group">
              <div className={`px-6 py-6 bg-gradient-to-r ${getModuleTheme(mainPlan.slug).gradient} text-white relative overflow-hidden cursor-pointer hover:brightness-105 transition-all duration-300 rounded-t-xl`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold mb-2 tracking-tight">{mainPlan.name}</h3>
                    <p className="text-white/90 text-sm font-medium">Jouw gekozen leadgeneratie pakket</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold tracking-tight">{formatPrice(mainPlan.price, mainPlan.currency)}</div>
                    <div className="text-white/90 text-sm font-medium">{mainPlan.credits.leads.period}</div>
                  </div>
                </div>
              </div>
            </CollapsibleTrigger>

            {/* Enhanced Dark Interior - Matches Step 1 Styling with Full Rounded Bottom */}
            <CollapsibleContent>
              <div className={`${getModuleTheme(mainPlan.slug).interiorBg} border ${getModuleTheme(mainPlan.slug).interiorBorder} shadow-lg rounded-b-xl`}>
                {/* Credits Section - Enhanced with Dark Theme */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className={`w-2 h-2 rounded-full ${getModuleTheme(mainPlan.slug).bulletIcon.replace('text-', 'bg-')}`}></div>
                    <h4 className={`text-sm font-semibold ${getModuleTheme(mainPlan.slug).textPrimary}`}>Inclusief credits</h4>
                  </div>
                  
                  {/* Credits List - Dark Theme Enhanced Layout */}
                  <div className="space-y-5">
                    {/* Lead Credits */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-6 h-6 rounded-full ${getModuleTheme(mainPlan.slug).bulletBg} flex items-center justify-center`}>
                          <User className={`h-3.5 w-3.5 ${getModuleTheme(mainPlan.slug).bulletIcon}`} />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className={`text-sm font-semibold ${getModuleTheme(mainPlan.slug).textPrimary}`}>
                          {formatNumber(mainPlan.credits.leads.amount)} Lead credits {mainPlan.credits.leads.period}
                        </div>
                        {mainPlan.credits.leads.bonusAmount && (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getModuleTheme(mainPlan.slug).badgeBg} border`}>
                            <span className={`text-xs font-medium ${getModuleTheme(mainPlan.slug).badgeText}`}>
                              🎉 Maand 1: {formatNumber(mainPlan.credits.leads.bonusAmount)} credits (i.p.v. {formatNumber(mainPlan.credits.leads.amount)})
                            </span>
                          </div>
                        )}
                        <p className={`text-xs ${getModuleTheme(mainPlan.slug).textMuted} leading-relaxed`}>
                          {mainPlan.credits.leads.description}
                        </p>
                      </div>
                    </div>

                    {/* Email Credits */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-6 h-6 rounded-full ${getModuleTheme(mainPlan.slug).bulletBg} flex items-center justify-center`}>
                          <Mail className={`h-3.5 w-3.5 ${getModuleTheme(mainPlan.slug).bulletIcon}`} />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className={`text-sm font-semibold ${getModuleTheme(mainPlan.slug).textPrimary}`}>
                          {formatNumber(mainPlan.credits.emails.amount)} E-mail credits {mainPlan.credits.emails.period}
                        </div>
                        <p className={`text-xs ${getModuleTheme(mainPlan.slug).textMuted} leading-relaxed`}>
                          {mainPlan.credits.emails.description}
                        </p>
                      </div>
                    </div>

                    {/* LinkedIn Credits */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-6 h-6 rounded-full ${getModuleTheme(mainPlan.slug).bulletBg} flex items-center justify-center`}>
                          <Users className={`h-3.5 w-3.5 ${getModuleTheme(mainPlan.slug).bulletIcon}`} />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className={`text-sm font-semibold ${getModuleTheme(mainPlan.slug).textPrimary}`}>
                          {formatNumber(mainPlan.credits.linkedin.amount)} LinkedIn credits {mainPlan.credits.linkedin.period}
                        </div>
                        <p className={`text-xs ${getModuleTheme(mainPlan.slug).textMuted} leading-relaxed`}>
                          {mainPlan.credits.linkedin.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced BTW Notice - Dark Theme */}
                <div className={`px-6 py-4 ${getModuleTheme(mainPlan.slug).noticeBar} border-t ${getModuleTheme(mainPlan.slug).interiorBorder}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getModuleTheme(mainPlan.slug).bulletIcon.replace('text-', 'bg-')}`}></div>
                    <span className={`text-sm font-medium ${getModuleTheme(mainPlan.slug).textSecondary}`}>Alle prijzen zijn exclusief BTW</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Add-on Modules */}
      {addOnModules.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-foreground">Extra modules</h4>
            <p className="text-xs text-muted-foreground">Aanvullende functionaliteit voor je pakket</p>
          </div>
          
          {addOnModules.map((module) => {
            const theme = getModuleTheme(module.slug);
            const isExpanded = expandedModules.has(module.id);
            
            return (
              <Card key={module.id} className={`border ${theme.border} shadow-lg bg-card overflow-hidden`}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(module.id)}>
                  <CollapsibleTrigger className="w-full group">
                    <div className="p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                            )}
                            <div className="space-y-0.5">
                              <div className="font-semibold text-sm text-foreground">{module.name}</div>
                              <div className="text-xs text-muted-foreground">Extra module</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-bold text-base ${theme.text}`}>
                              {formatPrice(module.price, module.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">per maand</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveModule(module.id);
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 text-xs text-muted-foreground bg-accent/20">
                      <div className={`p-3 rounded-lg ${theme.bg} border ${theme.border}`}>
                        Uitgebreide functionaliteit voor {module.name.toLowerCase()}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Module Section */}
      {availableToAdd.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-500" />
              Module toevoegen
            </h4>
            <p className="text-xs text-muted-foreground">Breid je pakket uit met extra functionaliteit</p>
          </div>
          
          <div className="grid gap-3">
            {availableToAdd.map((module) => {
              const theme = getModuleTheme(module.module_slug);
              
              return (
                <Card
                  key={module.id}
                  className={`border ${theme.border} cursor-pointer hover:shadow-lg transition-all duration-200 bg-card hover:bg-accent/30 group`}
                  onClick={() => onAddModule(module.id)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-sm text-foreground group-hover:text-foreground/90 transition-colors">
                          {module.module_name}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {module.description}
                        </div>
                        {module.requires_lead_engine && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Vereist Lead Engine
                          </Badge>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <div className={`font-bold text-base ${theme.text}`}>
                          {formatPrice(module.monthly_price, module.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">per maand</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Coming Soon Modules */}
      {comingSoonModules.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Binnenkort beschikbaar
            </h4>
            <p className="text-xs text-muted-foreground">Deze modules komen binnenkort beschikbaar</p>
          </div>
          
          <div className="grid gap-2">
            {comingSoonModules.map((module) => (
              <Card
                key={module.id}
                className="border border-muted bg-muted/5 opacity-50"
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="font-semibold text-xs text-muted-foreground">
                        {module.module_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {module.description}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-3">
                      Binnenkort
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
