
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap, Target, TrendingUp } from "lucide-react";
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
      {/* Hero Section - Premium Apple Style */}
      <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Grid */}
          <div 
            className="absolute inset-0 opacity-[0.03] animate-pulse-glow"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Premium Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/8 rounded-full blur-3xl animate-drift" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/4 rounded-full blur-3xl animate-wave" />
          
          {/* Neural Network Dots */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-neural-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400/30 rounded-full animate-neural-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/2 left-1/2 w-1 h-1 bg-indigo-400/20 rounded-full animate-neural-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-32">
          <div className="text-center space-y-16">
            
            {/* Power Statement */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-6 py-3 rounded-full border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm">
                <Zap className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-blue-300 text-sm font-medium">AI-gedreven outbound marketing</span>
              </div>
              
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-extralight text-white leading-[0.85] tracking-tighter">
                Elke lead
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent font-thin">
                  wordt klant
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-slate-300 font-extralight leading-relaxed max-w-4xl mx-auto">
                We stoppen verspilling.
                <br className="hidden md:block" />
                Elke email, elk bericht, elke campagne is raak.
              </p>
            </div>

            {/* Premium Video Container */}
            <div className="relative mt-24 mb-20">
              {/* Glow Effects */}
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 via-cyan-500/15 to-blue-500/10 blur-3xl animate-glow" />
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/5 via-cyan-400/10 to-blue-400/5 blur-2xl" />
              
              {/* Video Frame */}
              <div className="relative">
                <div 
                  className="aspect-[16/10] rounded-3xl overflow-hidden backdrop-blur-xl border border-white/[0.08]"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(15, 23, 42, 0.95) 0%, 
                        rgba(30, 41, 59, 0.8) 50%, 
                        rgba(15, 23, 42, 0.95) 100%
                      )
                    `,
                    boxShadow: `
                      0 40px 80px -20px rgba(0, 0, 0, 0.6),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05),
                      0 0 0 1px rgba(59, 130, 246, 0.1)
                    `
                  }}
                >
                  {/* Premium Abstract Animation */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Floating Elements */}
                    <div className="absolute inset-0">
                      {/* Large Orbs */}
                      <div className="absolute top-1/6 left-1/5 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-500/15 rounded-full blur-xl animate-drift" />
                      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-400/15 to-blue-500/10 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }} />
                      <div className="absolute bottom-1/4 left-1/2 w-28 h-28 bg-gradient-to-br from-indigo-400/12 to-purple-500/8 rounded-full blur-md animate-wave" style={{ animationDelay: '4s' }} />
                      
                      {/* Data Flow Lines */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse" />
                        <div className="absolute bottom-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
                      </div>
                      
                      {/* Neural Network Connections */}
                      <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 400 240">
                          <defs>
                            <linearGradient id="connection" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.4)" />
                              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                            </linearGradient>
                          </defs>
                          <line x1="80" y1="60" x2="320" y2="180" stroke="url(#connection)" strokeWidth="1" className="animate-pulse" />
                          <line x1="120" y1="180" x2="280" y2="60" stroke="url(#connection)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                          <circle cx="80" cy="60" r="3" fill="rgba(59, 130, 246, 0.6)" className="animate-neural-pulse" />
                          <circle cx="320" cy="180" r="3" fill="rgba(59, 130, 246, 0.6)" className="animate-neural-pulse" style={{ animationDelay: '1s' }} />
                          <circle cx="120" cy="180" r="3" fill="rgba(6, 182, 212, 0.6)" className="animate-neural-pulse" style={{ animationDelay: '0.5s' }} />
                          <circle cx="280" cy="60" r="3" fill="rgba(6, 182, 212, 0.6)" className="animate-neural-pulse" style={{ animationDelay: '2s' }} />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Premium Play Button */}
                    <button className="relative z-10 group transform hover:scale-110 transition-all duration-500">
                      <div className="relative">
                        <div className="w-24 h-24 bg-white/[0.08] backdrop-blur-md rounded-full flex items-center justify-center border border-white/[0.12] group-hover:bg-white/[0.12] transition-all duration-300 group-hover:border-white/20">
                          <Play className="h-10 w-10 text-white ml-1 drop-shadow-lg" fill="white" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                    
                    {/* Floating Stats */}
                    <div className="absolute top-8 left-8 glass-morphism rounded-2xl p-4 backdrop-blur-md">
                      <div className="text-cyan-400 text-sm font-medium">Response Rate</div>
                      <div className="text-white text-2xl font-light">73%</div>
                    </div>
                    
                    <div className="absolute bottom-8 right-8 glass-morphism rounded-2xl p-4 backdrop-blur-md">
                      <div className="text-blue-400 text-sm font-medium">Leads Generated</div>
                      <div className="text-white text-2xl font-light">2,847</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium CTA */}
            <div className="space-y-8">
              <Button 
                onClick={handlePlanGesprekClick}
                size="lg"
                className="group relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-400 text-white border-0 px-12 py-6 text-xl font-medium rounded-full shadow-2xl hover:shadow-blue-500/30 transition-all duration-700 hover:scale-[1.02] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                Plan je gratis strategiegesprek
                <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <p className="text-slate-400 text-lg font-light">
                30 minuten die je business transformeren
                <span className="text-slate-500 block text-sm mt-1">Geen sales pitch. Alleen strategie.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waarom ScailUp - Power Statements */}
      <section className="py-40 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-24">
            
            {/* Section Header */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-6 py-3 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm">
                <Target className="h-4 w-4 text-cyan-400 mr-2" />
                <span className="text-cyan-300 text-sm font-medium">Geen verspilling meer</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl font-extralight text-white leading-tight tracking-tight">
                Waarom je
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-thin"> kiest voor ons</span>
              </h2>
            </div>

            {/* Power Statements Grid */}
            <div className="grid md:grid-cols-3 gap-16">
              {[
                {
                  icon: Target,
                  title: "Laser-precise targeting",
                  description: "Wij bereiken exact de juiste persoon, op het juiste moment, met de juiste boodschap.",
                  impact: "94% deliverability"
                },
                {
                  icon: Zap,
                  title: "AI-gedreven personalisatie", 
                  description: "Elke email, elk LinkedIn bericht is uniek. Geen templates, geen massa-mails.",
                  impact: "5x hogere conversie"
                },
                {
                  icon: TrendingUp,
                  title: "Schaalbare groei",
                  description: "Van 10 tot 1000 leads per maand. Onze systemen groeien naadloos mee.",
                  impact: "Unlimited scale"
                }
              ].map((item, index) => (
                <div key={index} className="group space-y-8 hover-lift">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/[0.05] group-hover:border-white/10 transition-all duration-500">
                      <item.icon className="h-8 w-8 text-blue-300 group-hover:text-cyan-300 transition-colors duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-light text-white leading-tight">{item.title}</h3>
                    <p className="text-slate-300 leading-relaxed font-light text-lg">{item.description}</p>
                    
                    <div className="pt-4">
                      <div className="text-lg font-medium bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                        {item.impact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Onze Aanpak Section */}
      <section className="py-40 bg-gradient-to-b from-slate-950 to-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section header */}
          <div className="text-center mb-32">
            <h2 className="text-6xl md:text-7xl font-extralight text-white leading-tight mb-8 tracking-tight">
              Drie pijlers voor 
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-thin"> maximale impact</span>
            </h2>
            <p className="text-2xl text-slate-300 font-extralight max-w-3xl mx-auto leading-relaxed">
              Elke campagne is chirurgisch precies. Elke boodschap is persoonlijk. Elk resultaat is meetbaar.
            </p>
          </div>

          {/* Approach blocks */}
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                title: "Email campagnes",
                subtitle: "Directe impact",
                description: "Hyper-gepersonaliseerde emails die doorbreken in overvolle inboxen. Elke email voelt alsof je hem persoonlijk hebt geschreven.",
                stats: "94% deliverability",
                color: "blue"
              },
              {
                title: "LinkedIn outreach", 
                subtitle: "Executive access",
                description: "Strategische verbindingen opbouwen met C-level beslissers. Wij openen deuren die anderen gesloten houden.",
                stats: "73% response rate",
                color: "cyan"
              },
              {
                title: "Account-Based Marketing",
                subtitle: "Premium targeting",
                description: "Volledige campagnes rond je meest waardevolle prospects. Elk touchpoint is onderdeel van één verhaal.",
                stats: "5x hogere ROI",
                color: "indigo"
              }
            ].map((approach, index) => (
              <div 
                key={index}
                className="group relative p-10 rounded-3xl border border-slate-800/50 hover:border-slate-700/50 transition-all duration-700 hover:-translate-y-3 hover-lift"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 50%, rgba(15, 23, 42, 0.9) 100%)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {/* Premium glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-${approach.color}-500/10 via-${approach.color}-400/15 to-${approach.color}-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                
                <div className="relative space-y-8">
                  <div className="space-y-3">
                    <div className={`text-sm text-${approach.color}-300 font-medium tracking-wide uppercase`}>{approach.subtitle}</div>
                    <h3 className="text-3xl font-light text-white leading-tight">{approach.title}</h3>
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed text-lg font-light">{approach.description}</p>
                  
                  <div className="pt-6 border-t border-slate-800/50">
                    <div className={`text-2xl font-light bg-gradient-to-r from-${approach.color}-300 to-${approach.color}-200 bg-clip-text text-transparent`}>
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
      <section className="py-40 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section header */}
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-extralight text-white leading-tight mb-8 tracking-tight">
              Impact die 
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-thin"> spreekt voor zich</span>
            </h2>
            <p className="text-xl text-slate-300 font-extralight max-w-2xl mx-auto">
              Deze maand alleen al hebben we duizenden leads gegenereerd voor onze klanten.
            </p>
          </div>

          {/* Impact stats */}
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { number: "2.847", label: "Leads gegenereerd", period: "deze maand", trend: "+47%" },
              { number: "94%", label: "Email deliverability", period: "gemiddelde score", trend: "Branche: 21%" },
              { number: "€2.3M", label: "Pipeline gecreëerd", period: "dit kwartaal", trend: "+134%" },
              { number: "73%", label: "Response rate", period: "LinkedIn outreach", trend: "Branche: 12%" }
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-6 group hover-lift">
                <div className="relative">
                  <div className="text-5xl md:text-6xl font-extralight bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="space-y-2">
                  <div className="text-white font-light text-lg">{stat.label}</div>
                  <div className="text-slate-400 text-sm">{stat.period}</div>
                  <div className="text-cyan-300 text-sm font-medium">{stat.trend}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl animate-drift" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-8">
            <h2 className="text-6xl md:text-7xl font-extralight text-white leading-tight tracking-tight">
              Stop met gokken.
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent font-thin">Start met winnen.</span>
            </h2>
            <p className="text-2xl text-slate-300 font-extralight max-w-3xl mx-auto leading-relaxed">
              Laten we jouw outbound marketing transformeren van kosten naar investering.
            </p>
          </div>

          <div className="space-y-6">
            <Button 
              onClick={handlePlanGesprekClick}
              size="lg"
              className="group relative bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-400 text-white border-0 px-16 py-8 text-2xl font-medium rounded-full shadow-2xl hover:shadow-cyan-500/25 transition-all duration-700 hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              Plan je gratis strategiegesprek
              <ArrowRight className="ml-4 h-7 w-7 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            
            <p className="text-slate-400 text-lg font-light">
              30 minuten. Geen verplichtingen. Alleen resultaten.
            </p>
          </div>
        </div>
      </section>
    </>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
