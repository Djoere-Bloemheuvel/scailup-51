
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, Mail, Linkedin } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const services = [
  {
    id: "account-based-marketing",
    title: "Account Based Marketing",
    subtitle: "Gerichte enterprise benadering.",
    description: "Wij identificeren en benaderen de juiste beslissers binnen jouw target accounts met gepersonaliseerde campagnes die écht converteren.",
    icon: Target,
    gradient: "from-blue-400/30 via-purple-400/25 to-cyan-400/20",
    glowColor: "blue-500/30",
    accentColor: "blue-400",
    features: [
      "Strategische account selectie & research",
      "Multi-stakeholder mapping & engagement",
      "Gepersonaliseerde content per beslisser",
      "Account-specifieke landing pages"
    ]
  },
  {
    id: "hyper-personalized-email",
    title: "Hyper Personalized Email Campagnes", 
    subtitle: "AI-gedreven email marketing.",
    description: "Onze AI analyseert prospect data om hyperpersoonlijke emails te creëren die opvallen in overvolle inboxen en leiden tot meetings.",
    icon: Mail,
    gradient: "from-purple-400/30 via-pink-400/25 to-rose-400/20",
    glowColor: "purple-500/30",
    accentColor: "purple-400",
    features: [
      "AI-gegenereerde subject lines & content",
      "Dynamische personalisatie op schaal",
      "A/B testing & optimalisatie",
      "Advanced deliverability management"
    ]
  },
  {
    id: "linkedin-outreach",
    title: "LinkedIn Outreach",
    subtitle: "Professionele netwerk activatie.",
    description: "Systematische LinkedIn prospecting met authentieke, gepersonaliseerde berichten die relaties bouwen en B2B kansen creëren.",
    icon: Linkedin,
    gradient: "from-emerald-400/30 via-teal-400/25 to-cyan-400/20",
    glowColor: "emerald-500/30",
    accentColor: "emerald-400",
    features: [
      "Strategische connection requests",
      "Gepersonaliseerde follow-up sequences",
      "Social selling content strategie",
      "LinkedIn Sales Navigator integratie"
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
    <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-32">
      {/* Content */}
      <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-semibold text-white/95 leading-tight">
              {service.title}
            </h2>
            <p className="text-lg text-white/60 font-light tracking-wide">
              {service.subtitle}
            </p>
          </div>
          
          <div className={`w-20 h-px bg-gradient-to-r from-${service.accentColor} via-${service.accentColor}/60 to-transparent`}></div>
          
          <p className="text-xl text-white/70 leading-relaxed font-light">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <div className={`w-1.5 h-1.5 bg-${service.accentColor}/60 rounded-full mt-2.5 flex-shrink-0 transition-all duration-500 group-hover:bg-${service.accentColor} group-hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]`}></div>
              <span className="text-white/70 font-light leading-relaxed group-hover:text-white/85 transition-colors duration-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button 
            onClick={handleLearnMoreClick}
            className={`relative overflow-hidden bg-${service.accentColor}/20 backdrop-blur-xl border border-${service.accentColor}/30 text-white hover:bg-${service.accentColor}/25 hover:border-${service.accentColor}/40 px-8 py-3.5 text-base font-medium transition-all duration-500 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] hover:scale-[1.02] group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-${service.accentColor}/10 via-${service.accentColor}/20 to-${service.accentColor}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <span className="relative z-10">Meer informatie</span>
          </Button>
          
          <Button 
            onClick={handleStartClick}
            variant="outline"
            className={`relative overflow-hidden bg-transparent border border-${service.accentColor}/40 text-white/90 hover:bg-${service.accentColor}/10 hover:border-${service.accentColor}/50 px-8 py-3.5 text-base font-medium transition-all duration-500 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)] hover:scale-[1.02] group backdrop-blur-sm`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-${service.accentColor}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <span className="relative z-10 flex items-center gap-2">
              Start nu
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>
      </div>

      {/* Premium Visual */}
      <div className={`relative flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
        <div className="relative">
          {/* Main glassmorphic card */}
          <div className="relative w-80 h-80 group">
            {/* Colored ambient glow */}
            <div className={`absolute -inset-12 bg-gradient-to-br ${service.gradient} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000`}></div>
            
            {/* Secondary colored ambient layer */}
            <div className={`absolute -inset-8 bg-${service.glowColor} rounded-full blur-2xl opacity-40 animate-pulse`} style={{ animationDuration: '4s' }}></div>
            
            {/* Glassmorphic container */}
            <div className="relative w-full h-full bg-white/[0.08] backdrop-blur-2xl rounded-3xl border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden group-hover:bg-white/[0.12] group-hover:border-white/[0.25] transition-all duration-700">
              {/* Colored gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-60`}></div>
              
              {/* Animated shimmer effect with color */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                <div className={`absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-${service.accentColor}/30 to-transparent skew-x-12 animate-shimmer`}></div>
              </div>
              
              {/* Icon container */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative">
                  {/* Icon background with color accent */}
                  <div className={`w-24 h-24 bg-white/[0.15] backdrop-blur-xl rounded-2xl border border-${service.accentColor}/30 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] group-hover:scale-110 group-hover:bg-white/[0.2] group-hover:border-${service.accentColor}/40 transition-all duration-500`}>
                    <service.icon className={`h-12 w-12 text-${service.accentColor}/90 group-hover:text-${service.accentColor} transition-colors duration-300`} />
                  </div>
                  
                  {/* Floating particles with color */}
                  <div className={`absolute -top-3 -right-3 w-2 h-2 bg-${service.accentColor}/80 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]`}></div>
                  <div className={`absolute -bottom-2 -left-3 w-1.5 h-1.5 bg-${service.accentColor}/60 rounded-full animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.4)]`} style={{ animationDelay: '1s' }}></div>
                  <div className={`absolute top-1/2 -left-6 w-1 h-1 bg-${service.accentColor}/70 rounded-full animate-pulse shadow-[0_0_4px_rgba(59,130,246,0.5)]`} style={{ animationDelay: '2s' }}></div>
                  <div className={`absolute top-1/3 -right-5 w-1 h-1 bg-${service.accentColor}/50 rounded-full animate-pulse shadow-[0_0_4px_rgba(59,130,246,0.3)]`} style={{ animationDelay: '3s' }}></div>
                </div>
              </div>
              
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '32px 32px'
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

export const ModernServicesSection = memo(() => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900/95 to-gray-950">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center py-24 space-y-8">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.08] backdrop-blur-xl rounded-full text-white/80 text-sm font-medium border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="tracking-wide">Done-for-You Services</span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-6xl font-light text-white/95 leading-tight tracking-tight">
              Premium Outbound{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent font-normal">
                Marketing Services
              </span>
            </h2>
            
            <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed font-light">
              Wij nemen je complete outbound marketing over — van strategie tot uitvoering. 
              Volledig geoptimaliseerd door AI voor maximale conversie.
            </p>
          </div>
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
