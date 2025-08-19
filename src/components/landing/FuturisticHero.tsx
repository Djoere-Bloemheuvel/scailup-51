
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Linkedin, Database, Bot, Brain } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const FuturisticHero = memo(() => {
  const { openModal } = useConversionModalContext();
  
  const handlePlanGesprekClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FuturisticHero: Plan een gesprek button clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <>
      {/* Main Hero Section */}
      <section className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-slate-950 to-blue-500/20"></div>
        
        {/* Curved Background Element */}
        <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-cyan-400/10 to-transparent rounded-b-[50px] md:rounded-b-[100px]"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 text-center">
          
          {/* Main Headline */}
          <div className="space-y-8 mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[0.9] tracking-tight">
              AI-gedreven Outbound en de{' '}
              <span className="font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Evolutie van Sales
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-4xl mx-auto">
              De nieuwe generatie AI-sales vertegenwoordigt een transformatieve verschuiving waarbij intelligente, 
              autonome systemen complexe taken uitvoeren, beslissingen nemen en samenwerken namens jouw bedrijf.
            </p>
          </div>

          {/* CTA Button */}
          <div className="mb-20">
            <Button 
              onClick={handlePlanGesprekClick} 
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25"
            >
              <Bot className="mr-2 h-5 w-5" />
              Start nu
            </Button>
          </div>

          {/* Service Icons */}
          <div className="flex justify-center gap-6 mb-20">
            {[
              { icon: Database, label: "Lead Database" },
              { icon: Mail, label: "Email AI" },
              { icon: Linkedin, label: "LinkedIn AI" },
              { icon: Brain, label: "AI Personalisatie" },
              { icon: Bot, label: "Automatisering" }
            ].map((service, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="w-16 h-16 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex items-center justify-center hover:bg-slate-800/50 transition-all duration-300 hover:scale-110 hover:border-cyan-500/30">
                  <service.icon className="h-7 w-7 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Big Metric */}
          <div className="mb-16">
            <div className="text-6xl md:text-8xl lg:text-9xl font-light bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              2,847+
            </div>
            <p className="text-lg text-slate-400">
              Multi-channel AI leads deze maand
            </p>
          </div>

          {/* Trust Section */}
          <div className="space-y-8">
            <p className="text-slate-500 text-sm uppercase tracking-wider">
              Vertrouwd door individuen en teams van
            </p>
            
            {/* Company Logos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { name: "TechStart", logo: "TS" },
                { name: "InnovateLab", logo: "IL" },
                { name: "GrowthCorp", logo: "GC" },
                { name: "ScaleUp", logo: "SU" },
                { name: "DataDriven", logo: "DD" },
                { name: "AIForward", logo: "AF" },
                { name: "NextGen", logo: "NG" },
                { name: "ProActive", logo: "PA" }
              ].map((company, index) => (
                <div key={index} className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-lg p-4 flex items-center justify-center hover:bg-slate-800/40 transition-all duration-300">
                  <span className="text-slate-400 font-medium text-sm">{company.logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-gradient-to-b from-slate-950 to-slate-900 relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left side - metrics */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-light text-white mb-2">2,847</div>
                  <div className="text-sm text-slate-500">Leads deze maand</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-light text-white mb-2">73%</div>
                  <div className="text-sm text-slate-500">Response rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-light text-white mb-2">€2.3M</div>
                  <div className="text-sm text-slate-500">Pipeline waarde</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-light text-white mb-2">24/7</div>
                  <div className="text-sm text-slate-500">Automatisering</div>
                </div>
              </div>
            </div>

            {/* Right side content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="text-sm text-cyan-400 font-medium tracking-wider uppercase">Over ScailUp</div>
                <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">
                  AI-gedreven groei{' '}
                  <span className="font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    die werkt
                  </span>
                </h2>
              </div>

              <p className="text-xl text-slate-400 font-light leading-relaxed">
                Wij combineren geavanceerde AI-technologie met bewezen groeistrategieën. 
                Het resultaat? Exponentiële groei door slimme automatisering en data-gedreven inzichten.
              </p>

              <div className="space-y-3">
                {[
                  "AI-gedreven lead generatie",
                  "Geautomatiseerde workflows", 
                  "Realtime analytics",
                  "Persoonlijke begeleiding"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    <span className="text-slate-300 font-light">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

FuturisticHero.displayName = 'FuturisticHero';
export { FuturisticHero };
