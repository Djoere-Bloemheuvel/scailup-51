
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
    glowColor: "bg-blue-500/20",
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
    glowColor: "bg-purple-500/20",
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
    glowColor: "bg-green-500/20",
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

      {/* Right visual with ambient backlight */}
      <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
        <div className="relative w-80 h-80 mx-auto">
          {/* Ambient glow layers - multiple layers for depth */}
          <div className={`absolute -inset-16 ${service.glowColor} blur-3xl rounded-full opacity-40 animate-pulse`}></div>
          <div className={`absolute -inset-12 ${service.glowColor} blur-2xl rounded-full opacity-60 animate-pulse`} style={{ animationDelay: '1s' }}></div>
          <div className={`absolute -inset-8 ${service.glowColor} blur-xl rounded-full opacity-30 animate-pulse`} style={{ animationDelay: '2s' }}></div>
          
          {/* Main card container */}
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5`}></div>
            
            {/* Central icon container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Icon background with glow */}
                <div className={`w-24 h-24 ${service.bgColor} backdrop-blur-lg rounded-2xl border border-slate-600/30 flex items-center justify-center relative overflow-hidden`}>
                  {/* Inner glow */}
                  <div className={`absolute inset-2 ${service.glowColor} blur-md rounded-xl opacity-50`}></div>
                  <service.icon className="h-12 w-12 text-white relative z-10" />
                </div>
                
                {/* Floating connection points with ambient glow */}
                <div className="absolute -top-6 -right-6 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-[0_0_20px_theme(colors.blue.500)]"></div>
                <div className="absolute -bottom-6 -left-6 w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_theme(colors.purple.500)]" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 -left-10 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_theme(colors.cyan.500)]" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 -right-10 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_theme(colors.green.500)]" style={{ animationDelay: '3s' }}></div>
                
                {/* Connecting lines with glow */}
                <div className="absolute top-0 right-0 w-12 h-px bg-gradient-to-r from-transparent to-blue-500/80 transform rotate-45 shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                <div className="absolute bottom-0 left-0 w-12 h-px bg-gradient-to-r from-transparent to-purple-500/80 transform -rotate-45 shadow-[0_0_10px_theme(colors.purple.500)]"></div>
              </div>
            </div>
            
            {/* Enhanced grid pattern with subtle glow */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

export const ModernServicesSection = memo(() => {
  return (
    <section className="bg-gradient-to-b from-gray-950 via-gray-900/95 to-gray-950 relative overflow-hidden">
      {/* Enhanced ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-green-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
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
