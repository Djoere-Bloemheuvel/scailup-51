
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingUp, Mail, Linkedin, Brain, Bot } from "lucide-react";
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
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />

        {/* Main hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
            
            {/* Left Content */}
            <div className="space-y-12 animate-fade-in">
              {/* Main headline */}
              <div className="space-y-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[0.85] tracking-tight">
                  AI-gedreven{' '}
                  <span className="font-medium bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    groei
                  </span>
                  <br />
                  voor moderne{' '}
                  <span className="font-medium">
                    bedrijven
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-lg">
                  Van 10 naar 1000+ leads per maand met volledig geautomatiseerde outbound marketing.
                </p>
              </div>

              {/* Key metrics */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-light text-white">94%</div>
                  <div className="text-sm text-slate-500">Precisie</div>
                </div>
                <div className="w-px h-12 bg-slate-800"></div>
                <div className="text-center">
                  <div className="text-3xl font-light text-white">5x</div>
                  <div className="text-sm text-slate-500">Sneller</div>
                </div>
                <div className="w-px h-12 bg-slate-800"></div>
                <div className="text-center">
                  <div className="text-3xl font-light text-white">€2.3M</div>
                  <div className="text-sm text-slate-500">Pipeline</div>
                </div>
              </div>

              {/* CTA */}
              <Button 
                onClick={handlePlanGesprekClick} 
                className="group bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 hover:scale-105"
              >
                Neem contact op
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            {/* Right Visual - Services Flow */}
            <div className="relative">
              <div className="relative w-full max-w-2xl mx-auto">
                
                {/* Central workflow visualization */}
                <div className="relative">
                  
                  {/* Step 1: Data Collection */}
                  <div className="relative mb-16">
                    <div className="absolute -inset-8 bg-blue-500/5 rounded-3xl blur-xl"></div>
                    <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Target className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-medium text-white mb-2">Lead Database</div>
                          <div className="text-sm text-slate-400 mb-3">Automatische identificatie en verrijking van prospects</div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-green-400">●</span>
                            <span className="text-slate-300">2,847 leads deze maand</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection line */}
                  <div className="absolute left-8 top-24 w-px h-8 bg-gradient-to-b from-blue-400/60 to-transparent"></div>

                  {/* Step 2: AI Personalization */}
                  <div className="relative mb-16 ml-8">
                    <div className="absolute -inset-8 bg-purple-500/5 rounded-3xl blur-xl"></div>
                    <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Brain className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-medium text-white mb-2">AI Personalisatie</div>
                          <div className="text-sm text-slate-400 mb-3">Hyperpersoonlijke berichten voor elke prospect</div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-green-400">●</span>
                            <span className="text-slate-300">91% relevantie score</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection line */}
                  <div className="absolute left-16 top-56 w-px h-8 bg-gradient-to-b from-purple-400/60 to-transparent"></div>

                  {/* Step 3: Multi-Channel Outreach */}
                  <div className="relative mb-16">
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Email */}
                      <div className="relative">
                        <div className="absolute -inset-4 bg-green-500/5 rounded-2xl blur-lg"></div>
                        <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                              <Mail className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">Email AI</div>
                              <div className="text-xs text-green-400">87% open rate</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div className="relative">
                        <div className="absolute -inset-4 bg-blue-500/5 rounded-2xl blur-lg"></div>
                        <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <Linkedin className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">LinkedIn AI</div>
                              <div className="text-xs text-blue-400">73% response</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection line */}
                  <div className="absolute left-1/2 -translate-x-px top-80 w-px h-8 bg-gradient-to-b from-cyan-400/60 to-transparent"></div>

                  {/* Step 4: Automation & Results */}
                  <div className="relative">
                    <div className="absolute -inset-8 bg-cyan-500/5 rounded-3xl blur-xl"></div>
                    <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Bot className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-medium text-white mb-2">Sales Automation</div>
                          <div className="text-sm text-slate-400 mb-3">24/7 automatische lead nurturing en conversie</div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-green-400">●</span>
                            <span className="text-slate-300">€2.3M pipeline waarde</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-gradient-to-b from-slate-950 to-slate-900 relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left side - simple metrics */}
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
                <div className="text-sm text-blue-400 font-medium tracking-wider uppercase">Over ScailUp</div>
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
