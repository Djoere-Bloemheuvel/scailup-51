
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Users, Mail, Linkedin } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const services = [
  {
    id: "account-based-marketing",
    title: "Account Based Marketing",
    subtitle: "Strategische B2B targeting.",
    description: "Wij identificeren en targeten de perfecte accounts voor jouw bedrijf. Van research tot multi-touchpoint campagnes — volledig geautomatiseerd en AI-geoptimaliseerd.",
    icon: Target,
    color: "from-blue-400 to-cyan-400",
    bgGradient: "from-blue-500/20 via-cyan-500/10 to-blue-600/20",
    glowColor: "blue-400",
    features: [
      "AI-gedreven account identificatie & research",
      "Multi-channel touchpoint strategie",
      "Gepersonaliseerde content per account",
      "Real-time engagement tracking & optimalisatie"
    ]
  },
  {
    id: "hyper-personalized-email",
    title: "Hyper Personalized Email Campagnes", 
    subtitle: "Elke email uniek & relevant.",
    description: "Onze AI analyseert elk prospect en creëert hyperpersoonlijke berichten die resoneren. Van subject lines tot call-to-actions — alles volledig op maat.",
    icon: Mail,
    color: "from-purple-400 to-pink-400", 
    bgGradient: "from-purple-500/20 via-pink-500/10 to-purple-600/20",
    glowColor: "purple-400",
    features: [
      "AI-gegenereerde personalisatie op schaal",
      "Emotionele intelligentie integratie",
      "A/B testing op elke campagne element",
      "Predictive send-time optimalisatie"
    ]
  },
  {
    id: "linkedin-outreach",
    title: "LinkedIn Outreach",
    subtitle: "Professionele netwerkuitbreiding.",
    description: "Strategische LinkedIn campagnes die echte connecties opbouwen. Van connection requests tot follow-up sequences — alles volgens de LinkedIn best practices.",
    icon: Linkedin,
    color: "from-green-400 to-emerald-400",
    bgGradient: "from-green-500/20 via-emerald-500/10 to-green-600/20", 
    glowColor: "green-400",
    features: [
      "LinkedIn-compliant automation",
      "Relationship-first benadering",
      "Profile optimization & social selling",
      "Advanced prospect research & targeting"
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
    <div className="grid lg:grid-cols-2 gap-20 items-center min-h-screen py-24">
      {/* Left content */}
      <div className={`space-y-10 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              {service.title}
            </h2>
            <p className="text-xl text-slate-300 font-light">
              {service.subtitle}
            </p>
          </div>
          
          <div className={`w-20 h-1.5 bg-gradient-to-r ${service.color} rounded-full relative`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${service.color} blur-sm opacity-60`}></div>
          </div>
          
          <p className="text-xl text-slate-200 leading-relaxed font-light">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-5">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <div className={`w-2.5 h-2.5 bg-gradient-to-r ${service.color} rounded-full mt-2.5 flex-shrink-0 relative`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-full blur-sm opacity-60 group-hover:opacity-100 transition-opacity`}></div>
              </div>
              <span className="text-slate-200 text-lg leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 pt-4">
          <Button 
            onClick={handleLearnMoreClick}
            className={`bg-gradient-to-r ${service.color} hover:shadow-2xl hover:shadow-${service.glowColor}/25 text-white px-10 py-4 text-lg font-medium transition-all duration-500 rounded-xl relative overflow-hidden group`}
          >
            <span className="relative z-10">Meer informatie</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
          </Button>
          <Button 
            onClick={handleStartClick}
            variant="outline"
            className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/30 px-10 py-4 text-lg font-medium transition-all duration-300 rounded-xl group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start nu
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>
      </div>

      {/* Right visual - Premium glassmorphic design */}
      <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
        <div className="relative w-96 h-96 mx-auto">
          {/* Main glassmorphic container */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/[0.02] backdrop-blur-xl border border-white/20 overflow-hidden">
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${service.bgGradient} animate-pulse-glow`}></div>
            
            {/* Main service icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Icon container with glassmorphism */}
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center relative overflow-hidden">
                  <service.icon className="h-12 w-12 text-white relative z-10" />
                  {/* Subtle inner glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20 rounded-2xl`}></div>
                </div>
                
                {/* Floating connection orbs */}
                <div className={`absolute -top-6 -right-6 w-6 h-6 bg-gradient-to-r ${service.color} rounded-full animate-float relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-full blur-md opacity-60`}></div>
                </div>
                <div className={`absolute -bottom-6 -left-6 w-4 h-4 bg-gradient-to-r ${service.color} rounded-full animate-float relative`} style={{ animationDelay: '1.5s' }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-full blur-md opacity-60`}></div>
                </div>
                <div className={`absolute top-1/2 -left-10 w-3 h-3 bg-gradient-to-r ${service.color} rounded-full animate-float relative`} style={{ animationDelay: '3s' }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-full blur-md opacity-60`}></div>
                </div>
                <div className={`absolute top-1/2 -right-10 w-3 h-3 bg-gradient-to-r ${service.color} rounded-full animate-float relative`} style={{ animationDelay: '4.5s' }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-full blur-md opacity-60`}></div>
                </div>
                
                {/* Connecting light beams */}
                <div className={`absolute top-0 right-0 w-12 h-px bg-gradient-to-r from-transparent via-${service.glowColor}/60 to-transparent transform rotate-45`}></div>
                <div className={`absolute bottom-0 left-0 w-12 h-px bg-gradient-to-r from-transparent via-${service.glowColor}/60 to-transparent transform -rotate-45`}></div>
              </div>
            </div>
            
            {/* Subtle moving grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px',
              animation: 'slide-grid 25s linear infinite'
            }} />
          </div>

          {/* Ambient lighting effects */}
          <div className={`absolute -inset-12 bg-gradient-to-r ${service.color} opacity-20 blur-3xl rounded-full animate-pulse-glow`}></div>
          <div className={`absolute -inset-6 bg-gradient-to-r ${service.color} opacity-10 blur-2xl rounded-full animate-pulse-glow`} style={{ animationDelay: '1s' }}></div>
          
          {/* Premium outer glow */}
          <div className={`absolute -inset-20 bg-gradient-conic from-${service.glowColor}/20 via-transparent to-${service.glowColor}/20 blur-2xl opacity-30 animate-spin`} style={{ animationDuration: '20s' }}></div>
        </div>
      </div>
    </div>
  );
});

ServiceCard.displayName = 'ServiceCard';

export const ModernServicesSection = memo(() => {
  return (
    <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Multiple ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-400/5 rounded-full blur-3xl animate-drift" style={{ animationDelay: '10s' }} />
        <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] bg-green-400/5 rounded-full blur-3xl animate-drift" style={{ animationDelay: '20s' }} />
        
        {/* Premium grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Enhanced section header */}
        <div className="text-center py-24 space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-blue-300 text-sm font-medium">
            <Target className="h-5 w-5" />
            Done-for-You Outbound Services
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            Wij Nemen Je{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Outbound Marketing
            </span>{' '}
            Volledig Over
          </h2>
          
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
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
