
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Mail, 
  Users, 
  Phone, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FunctionalityTabs = () => {
  const [activeTab, setActiveTab] = useState("database");

  const functionalities = [
    {
      id: "database",
      title: "Data Base",
      icon: Database,
      description: "Beheer en analyseer je leads met AI-ondersteuning",
      features: [
        "Automatisch verrijkte lead data",
        "Slimme filters & segmentatie", 
        "AI-suggesties voor de beste outreach",
        "Realtime inzicht in prestaties"
      ],
      stats: { success: "94%", active: "247" },
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "email",
      title: "AI Email Channel",
      icon: Mail,
      description: "Geautomatiseerde email campagnes met AI-personalisatie",
      features: [
        "AI-gegenereerde email content",
        "Automatische follow-up sequenties",
        "A/B testing voor optimalisatie",
        "Geavanceerde deliverability"
      ],
      stats: { success: "87%", active: "1,234" },
      color: "from-green-500 to-green-600"
    },
    {
      id: "linkedin",
      title: "AI LinkedIn Channel",
      icon: Users,
      description: "Scaleer je LinkedIn outreach met intelligente automatisering",
      features: [
        "Gepersonaliseerde LinkedIn berichten",
        "Connection request automatisering",
        "Profile viewing strategieën",
        "Engagement tracking"
      ],
      stats: { success: "73%", active: "892" },
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "calling",
      title: "AI Cold Calling",
      icon: Phone,
      description: "AI-ondersteunde cold calling voor maximale conversie",
      features: [
        "AI call scripts en coaching",
        "Automatische call scheduling",
        "Conversation intelligence",
        "Call outcome tracking"
      ],
      stats: { success: "65%", active: "156" },
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      icon: BarChart3,
      description: "Uitgebreide analytics voor data-driven beslissingen",
      features: [
        "Real-time dashboard insights",
        "ROI tracking per channel",
        "Predictive analytics",
        "Custom reporting tools"
      ],
      stats: { success: "99%", active: "5,678" },
      color: "from-pink-500 to-pink-600"
    }
  ];

  const currentFunc = functionalities.find(f => f.id === activeTab);

  return (
    <div className="w-full max-w-7xl mx-auto px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          AI-Powered Features
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
          Alles wat je nodig hebt in{" "}
          <span className="gradient-text">één platform</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Van lead generatie tot conversie - onze AI-tools zorgen voor een naadloze sales experience
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Enhanced Tab Navigation */}
        <TabsList className="grid w-full grid-cols-5 bg-card/30 backdrop-blur-xl border border-border/20 rounded-2xl p-2 mb-12 h-auto">
          {functionalities.map((func) => (
            <TabsTrigger
              key={func.id}
              value={func.id}
              className="flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${func.color} p-3 text-white shadow-lg transition-transform group-hover:scale-110`}>
                <func.icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold block">{func.title}</span>
                <span className="text-xs text-muted-foreground hidden sm:block mt-1">
                  {func.stats.success} success
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Enhanced Tab Content */}
        {functionalities.map((func) => (
          <TabsContent key={func.id} value={func.id} className="mt-0">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                    <func.icon className="h-4 w-4" />
                    {func.title}
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                    {func.description}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {func.features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-xl bg-card/20 backdrop-blur-sm border border-border/10 hover:bg-card/30 transition-all duration-300 hover-lift"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="gap-3 text-base font-semibold px-8 py-6 animate-glow hover:scale-105 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                  Probeer {func.title}
                </Button>
              </div>
              
              {/* Right Preview Card */}
              <div className="animate-slide-up">
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
                          <p className="text-sm text-muted-foreground">Dashboard</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                        <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-3 mb-6 p-4 bg-background/50 rounded-xl border border-border/10">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-foreground">Active Campaign</span>
                      <div className="ml-auto">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-8 px-4">
                      Processing insights and optimizing performance...
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-background/70 backdrop-blur-sm rounded-2xl p-6 border border-border/10 hover:bg-background/80 transition-colors">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Success Rate</div>
                        <div className="text-3xl font-bold text-foreground mb-1">{func.stats.success}</div>
                        <div className="text-xs text-green-500 font-medium">↗ +2.4% this week</div>
                      </div>
                      <div className="bg-background/70 backdrop-blur-sm rounded-2xl p-6 border border-border/10 hover:bg-background/80 transition-colors">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Active Leads</div>
                        <div className="text-3xl font-bold text-primary mb-1">{func.stats.active}</div>
                        <div className="text-xs text-blue-500 font-medium">↗ +12% this month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FunctionalityTabs;
