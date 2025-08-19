import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
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
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}
          />
          
          {/* Ambient glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        {/* Main hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="text-center space-y-12">
            
            {/* Main headline */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-thin text-white leading-[0.9] tracking-tight">
                Bereik de juiste
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-light">
                  beslissers
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-3xl mx-auto">
                Slim, persoonlijk, schaalbaar.
                <br />
                Outbound marketing die écht werkt.
              </p>
            </div>

            {/* Premium video placeholder with glassmorphism */}
            <div className="relative mt-20 mb-16">
              {/* Glow effect behind video */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-blue-500/20 blur-3xl scale-110" />
              
              {/* Video container */}
              <div className="relative">
                <div 
                  className="aspect-video rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10"
                  style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                    boxShadow: `
                      0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `
                  }}
                >
                  {/* Premium abstract animation placeholder */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Animated background elements */}
                    <div className="absolute inset-0">
                      {/* Floating orbs */}
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-xl animate-float" />
                      <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />
                      <div className="absolute bottom-1/3 left-1/2 w-20 h-20 bg-gradient-to-br from-indigo-400/25 to-purple-500/25 rounded-full blur-md animate-float" style={{ animationDelay: '2s' }} />
                      
                      {/* Subtle grid lines */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
                    </div>
                    
                    {/* Play button */}
                    <button className="relative z-10 group">
                      <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/15 transition-all duration-300 group-hover:scale-110">
                        <Play className="h-8 w-8 text-white ml-1" fill="white" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-6">
              <Button 
                onClick={handlePlanGesprekClick}
                size="lg"
                className="group bg-blue-600 hover:bg-blue-500 text-white border-0 px-10 py-4 text-lg font-medium rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-[1.02]"
              >
                Plan je strategiegesprek
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <p className="text-slate-500 text-sm">
                Gratis 30 minuten • Directe impact • Geen verplichtingen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waarom ScailUp Section */}
      <section className="py-32 bg-slate-950 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-20">
            
            {/* Section header */}
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-thin text-white leading-tight">
                Waarom
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-light"> ScailUp</span>
              </h2>
              <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
                Wij zorgen voor meer afspraken, betere leads en minder verspilling.
              </p>
            </div>

            {/* Power statements */}
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "Precisie targeting",
                  description: "Bereik exact de juiste personen op het juiste moment."
                },
                {
                  title: "Persoonlijke aanpak",
                  description: "Elk bericht is uniek en relevant voor de ontvanger."
                },
                {
                  title: "Schaalbare resultaten",
                  description: "Van 10 tot 1000 leads per maand, wij groeien mee."
                }
              ].map((item, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-2xl font-light text-white">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Onze Aanpak Section */}
      <section className="py-32 bg-gradient-to-b from-slate-950 to-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section header */}
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-thin text-white leading-tight mb-6">
              Onze 
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-light"> aanpak</span>
            </h2>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
              Drie pijlers voor maximale impact in je outbound marketing.
            </p>
          </div>

          {/* Approach blocks */}
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Email campagnes",
                subtitle: "Directe impact",
                description: "Hyper-gepersonaliseerde emails die opvallen in overvolle inboxen.",
                stats: "94% deliverability"
              },
              {
                title: "LinkedIn outreach", 
                subtitle: "Zakelijk netwerk",
                description: "Strategische verbindingen opbouwen met beslissers in je doelmarkt.",
                stats: "73% response rate"
              },
              {
                title: "Account-Based Marketing",
                subtitle: "Premium targeting",
                description: "Gerichte campagnes voor je meest waardevolle prospects.",
                stats: "5x hogere ROI"
              }
            ].map((approach, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-3xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-500 hover:-translate-y-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.4) 100%)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {/* Subtle glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative space-y-6">
                  <div className="space-y-2">
                    <div className="text-sm text-cyan-400 font-medium">{approach.subtitle}</div>
                    <h3 className="text-2xl font-light text-white">{approach.title}</h3>
                  </div>
                  
                  <p className="text-slate-400 leading-relaxed">{approach.description}</p>
                  
                  <div className="pt-4 border-t border-slate-800/50">
                    <div className="text-lg font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {approach.stats}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-32 bg-slate-950 relative">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-thin text-white leading-tight mb-6">
              Resultaten die 
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-light"> spreken</span>
            </h2>
          </div>

          {/* Impact stats */}
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "2.847", label: "Leads gegenereerd", period: "deze maand" },
              { number: "94%", label: "Email deliverability", period: "gemiddeld" },
              { number: "€2.3M", label: "Pipeline gecreëerd", period: "dit kwartaal" },
              { number: "73%", label: "Response rate", period: "LinkedIn" }
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-3 group">
                <div className="text-4xl md:text-5xl font-thin bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="space-y-1">
                  <div className="text-white font-medium">{stat.label}</div>
                  <div className="text-sm text-slate-500">{stat.period}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-thin text-white leading-tight">
              Klaar voor
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-light"> groei?</span>
            </h2>
            <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
              Laten we jouw outbound marketing naar het volgende niveau tillen.
            </p>
          </div>
        </div>
      </section>
    </>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
