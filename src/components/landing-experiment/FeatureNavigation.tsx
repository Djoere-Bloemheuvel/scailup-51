
import React from 'react';
import { Database, Mail, Linkedin, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const FeatureNavigation = () => {
  const features = [
    {
      id: "database",
      title: "Lead Database",
      icon: Database,
      anchor: "#lead-database",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "email",
      title: "Email Outreach",
      subtitle: "powered by Sarah AI",
      icon: Mail,
      anchor: "#email-outreach",
      color: "from-green-500 to-green-600"
    },
    {
      id: "linkedin",
      title: "LinkedIn Outreach",
      subtitle: "powered by Sarah AI",
      icon: Linkedin,
      anchor: "#linkedin-outreach",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "personalization",
      title: "AI Personalisatie",
      icon: Sparkles,
      anchor: "#ai-personalisatie",
      color: "from-pink-500 to-pink-600"
    },
    {
      id: "automation",
      title: "Sales Automation",
      icon: Bot,
      anchor: "#sales-automation",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  const handleFeatureClick = (anchor: string) => {
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 mt-12">
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-5 gap-4">
        {features.map((feature) => (
          <Button
            key={feature.id}
            variant="outline"
            onClick={() => handleFeatureClick(feature.anchor)}
            className="group relative h-auto p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg transition-transform group-hover:scale-110`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-semibold block text-white">{feature.title}</span>
                {feature.subtitle && (
                  <span className="text-xs text-blue-200/70 italic block mt-0.5">
                    {feature.subtitle}
                  </span>
                )}
              </div>
            </div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
          </Button>
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 p-1">
            {features.map((feature) => (
              <Button
                key={feature.id}
                variant="outline"
                onClick={() => handleFeatureClick(feature.anchor)}
                className="group relative flex-shrink-0 h-auto p-4 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 min-w-[140px]"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 text-white shadow-lg transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-white leading-tight">{feature.title}</span>
                    {feature.subtitle && (
                      <span className="text-xs text-blue-200/70 italic block mt-0.5 leading-tight">
                        {feature.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default FeatureNavigation;
