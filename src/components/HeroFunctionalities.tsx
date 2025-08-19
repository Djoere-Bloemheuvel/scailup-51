import React, { useState, useMemo, useCallback, memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Mail, Users, Phone, BarChart3, CheckCircle, ArrowRight, Sparkles, TrendingUp, Linkedin, Bot, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

// Updated functionality data type to make subtitle optional
interface FunctionalityData {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  description: string;
  features: readonly string[];
  stats: {
    success: string;
    active: string;
  };
  color: string;
}

// Memoized functionality data
const FUNCTIONALITIES_DATA: readonly FunctionalityData[] = [
  {
    id: "database",
    title: "Lead Database", 
    icon: Database,
    description: "Bouw en beheer je prospect database intelligent",
    features: [
      "Automatische lead-verrijking met AI",
      "Slimme segmentatie en targeting",
      "Realtime kwaliteitschecks en validatie",
      "Integratie met alle grote platforms"
    ],
    stats: {
      success: "94%",
      active: "247"
    },
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "email",
    title: "Email Outreach",
    subtitle: "powered by Sarah AI",
    icon: Mail,
    description: "Schaal je email marketing met gepersonaliseerde AI",
    features: [
      "AI-gegenereerde, persoonlijke content",
      "Slimme timing en frequentie optimalisatie",
      "Automatische A/B testing en verbetering",
      "Hoge deliverability en inbox placement"
    ],
    stats: {
      success: "87%",
      active: "1,234"
    },
    color: "from-green-500 to-green-600"
  },
  {
    id: "linkedin",
    title: "LinkedIn Outreach",
    subtitle: "powered by Sarah AI",
    icon: Linkedin,
    description: "Automatiseer je LinkedIn strategie voor maximale groei",
    features: [
      "Gepersonaliseerde connection requests",
      "Slimme message sequenties",
      "Profile viewing en engagement strategieën",
      "Compliance-safe automation"
    ],
    stats: {
      success: "73%",
      active: "892"
    },
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "personalization",
    title: "AI Personalisatie",
    icon: Sparkles,
    description: "Hyperpersoonlijke berichten voor elke prospect",
    features: [
      "Deep learning prospect analyse",
      "Contextbewuste berichtgeneratie",
      "Emotionele intelligentie integratie",
      "Culturele en taaloptimalisatie"
    ],
    stats: {
      success: "91%",
      active: "2,156"
    },
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "automation",
    title: "Sales Automation",
    icon: Bot,
    description: "Volledig geautomatiseerde sales workflows",
    features: [
      "End-to-end sales funnel automatisering",
      "Slimme lead nurturing sequences",
      "Automatische task prioritering",
      "CRM integratie en data synchronisatie"
    ],
    stats: {
      success: "88%",
      active: "1,892"
    },
    color: "from-cyan-500 to-cyan-600"
  }
] as const;

// Memoized tab trigger component
const FunctionalityTab = memo(({ func }: { func: FunctionalityData }) => (
  <TabsTrigger 
    value={func.id} 
    className="flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
  >
    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${func.color} p-3 text-white shadow-lg transition-transform group-hover:scale-110`}>
      <func.icon className="h-6 w-6" />
    </div>
    <div className="text-center">
      <span className="text-sm font-semibold block">{func.title}</span>
      {func.subtitle && (
        <span className="text-xs text-muted-foreground/80 italic block mt-0.5">
          {func.subtitle}
        </span>
      )}
      <span className="text-xs text-muted-foreground hidden sm:block mt-1">
        {func.stats.success} succes
      </span>
    </div>
  </TabsTrigger>
));

FunctionalityTab.displayName = 'FunctionalityTab';

// Memoized feature item component
const FeatureItem = memo(({ feature }: { feature: string }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-card/20 backdrop-blur-sm border border-border/10 hover:bg-card/30 transition-all duration-300 hover-lift">
    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
      <CheckCircle className="h-4 w-4 text-primary" />
    </div>
    <span className="text-muted-foreground font-medium">{feature}</span>
  </div>
));

FeatureItem.displayName = 'FeatureItem';

// Memoized preview card component
const PreviewCard = memo(({ func }: { func: FunctionalityData }) => (
  <div className="relative">
    {/* Glowing background effect */}
    <div className={`absolute -inset-4 bg-gradient-to-r ${func.color} opacity-20 blur-2xl rounded-3xl animate-pulse-glow`}></div>
    
    <div className="relative bg-card/60 backdrop-blur-xl rounded-3xl border border-border/20 p-8 hover-lift shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${func.color} p-3 text-white shadow-lg`}>
            <func.icon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground">{func.title}</h4>
            <p className="text-sm text-muted-foreground">ScailUp Dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-3 w-3 bg-red-500 rounded-full"></div>
          <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Actieve campagnes</span>
            <span className="text-lg font-bold text-foreground">{func.stats.active}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`bg-gradient-to-r ${func.color} h-2 rounded-full transition-all duration-1000`} style={{ width: func.stats.success }}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl bg-background/50">
            <div className="text-2xl font-bold text-foreground">{func.stats.success}</div>
            <div className="text-xs text-muted-foreground">Succes rate</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-background/50">
            <div className="text-2xl font-bold text-foreground">{func.stats.active}</div>
            <div className="text-xs text-muted-foreground">Actief</div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

PreviewCard.displayName = 'PreviewCard';

// Updated tab content component with modal integration
const FunctionalityContent = memo(({ func }: { func: FunctionalityData }) => {
  const { openModal } = useConversionModalContext();

  const handleStartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${func.title} CTA clicked - opening modal`);
    openModal();
  }, [func.title, openModal]);

  const getAnchorId = useCallback((id: string) => {
    switch (id) {
      case "database": return "lead-database";
      case "email": return "email-outreach";
      case "linkedin": return "linkedin-outreach";
      case "personalization": return "ai-personalisatie";
      default: return "sales-automation";
    }
  }, []);

  return (
    <TabsContent value={func.id} className="mt-0">
      <div 
        id={getAnchorId(func.id)}
        className="grid lg:grid-cols-2 gap-16 items-center scroll-mt-20"
      >
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <func.icon className="h-4 w-4" />
              {func.title}
              {func.subtitle && (
                <span className="text-xs text-primary/70 italic ml-1">
                  ({func.subtitle})
                </span>
              )}
            </div>
            
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {func.description}
            </h3>
          </div>
          
          <div className="space-y-4">
            {func.features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} />
            ))}
          </div>
          
          <Button 
            size="lg" 
            className="gap-3 text-base font-semibold px-8 py-6 animate-glow hover:scale-105 transition-transform"
            onClick={handleStartClick}
            type="button"
          >
            <ArrowRight className="h-5 w-5" />
            Start met {func.title}
          </Button>
        </div>
        
        {/* Right Preview Card */}
        <div className="animate-slide-up">
          <PreviewCard func={func} />
        </div>
      </div>
    </TabsContent>
  );
});

FunctionalityContent.displayName = 'FunctionalityContent';

// Main optimized hero functionalities component
const HeroFunctionalities = memo(() => {
  const [activeTab, setActiveTab] = useState("database");

  // Memoized functionalities data
  const functionalities = useMemo(() => FUNCTIONALITIES_DATA, []);

  // Optimized tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pt-20">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Enhanced Tab Navigation */}
        <TabsList className="grid w-full grid-cols-5 bg-card/30 backdrop-blur-xl border border-border/20 rounded-2xl p-2 mb-12 h-auto">
          {functionalities.map((func) => (
            <FunctionalityTab key={func.id} func={func} />
          ))}
        </TabsList>

        {/* Enhanced Tab Content with anchor IDs */}
        {functionalities.map((func) => (
          <FunctionalityContent key={func.id} func={func} />
        ))}
      </Tabs>
    </div>
  );
});

HeroFunctionalities.displayName = 'HeroFunctionalities';

export default HeroFunctionalities;
