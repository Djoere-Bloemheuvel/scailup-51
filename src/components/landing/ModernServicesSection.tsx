
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Linkedin, Database, BarChart3, Users, Target, Zap, Brain } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const services = [
  {
    id: "outbound-automation",
    title: "Outbound Automation",
    subtitle: "Complete done-for-you service.",
    description: "Wij nemen je complete outbound marketing over — van strategie tot uitvoering. AI optimaliseert elk bericht voor maximale conversie.",
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    features: [
      "Volledige campagne setup & beheer",
      "AI-gegenereerde, gepersonaliseerde berichten",
      "Multi-channel approach (Email + LinkedIn)",
      "Continue optimalisatie en A/B testing"
    ]
  },
  {
    id: "lead-engine",
    title: "Lead Engine", 
    subtitle: "Slimme prospectidentificatie.",
    description: "Onze AI vindt en valideert de perfecte prospects voor jouw bedrijf. Van data-enrichment tot kwalificatie — volledig geautomatiseerd.",
    icon: Database,
    color: "from-purple-500 to-purple-600", 
    bgColor: "bg-purple-500/10",
    features: [
      "AI-gedreven prospect research",
      "Automatische lead kwalificatie",
      "Realtime data verrijking",
      "Smart filtering & segmentatie"
    ]
  },
  {
    id: "ai-personalization",
    title: "AI Personalisatie",
    subtitle: "Hyperpersoonlijke communicatie.",
    description: "Elk bericht wordt door AI afgestemd op de specifieke prospect. Van bedrijfscontext tot persoonlijke triggers — alles volledig geautomatiseerd.",
    icon: Brain,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10", 
    features: [
      "Contextbewuste berichtgeneratie",
      "Emotionele intelligentie integratie",
      "Timing optimalisatie per prospect",
      "Culturele en taal aanpassingen"
    ]
  }
];

const ServiceCard = memo(({ service, index }: { service: typeof services[0], index: number }) => {
  const { openModal } = useConversionModalContext();

  const handleLearnMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${service.title} - Meer informatie clicked - opening modal`);
    openModal();
  }, [service.title, openModal]);

  const handleStartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${service.title} - Start nu clicked - opening modal`);
    openModal();
  }, [service.title, openModal]);

  return (
    <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-20">
      {/* Left content */}
      <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              {service.title}
            </h2>
            <p className="text-lg text-slate-400 font-light">
              {service.subtitle}
            </p>
          </div>
          
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
          
          <p className="text-xl text-slate-300 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-slate-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleLearnMoreClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Meer informatie
          </Button>
          <Button 
            onClick={handleStartClick}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3 text-base font-medium transition-all duration-300 group"
          >
            Start nu
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>

      {/* Right visual */}
      <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
        <div className="relative w-80 h-80 mx-auto">
          {/* Background card */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden">
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10`}></div>
            
            {/* Floating icon container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Main icon */}
                <div className={`w-20 h-20 ${service.bgColor} backdrop-blur-sm rounded-2xl border border-slate-600/30 flex items-center justify-center`}>
                  <service.icon className="h-10 w-10 text-white" />
                </div>
                
                {/* Floating connection points */}
                <div className="absolute -top-4 -right-4 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 -left-8 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 -right-8 w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
                
                {/* Connecting lines */}
                <div className="absolute top-0 right-0 w-8 h-px bg-gradient-to-r from-transparent to-blue-500/60 transform rotate-45"></div>
                <div className="absolute bottom-0 left-0 w-8 h-px bg-gradient-to-r from-transparent to-purple-500/60 transform -rotate-45"></div>
              </div>
            </div>
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Ambient glow */}
          <div className={`absolute -inset-8 bg-gradient-to-r ${service.color} opacity-20 blur-3xl rounded-3xl animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

export const ModernServicesSection = memo(() => {
  return (
    <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center py-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-sm font-medium">
            <Target className="h-4 w-4" />
            Done-for-You Services
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Wij Nemen Je{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Outbound Marketing
            </span>{' '}
            Volledig Over
          </h2>
          
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Van strategie tot uitvoering — onze AI-gedreven experts zorgen voor exponentiële groei 
            terwijl jij je focust op wat je het beste doet.
          </p>
        </div>

        {/* Services */}
        <div className="space-y-0">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

ModernServicesSection.displayName = 'ModernServicesSection';
