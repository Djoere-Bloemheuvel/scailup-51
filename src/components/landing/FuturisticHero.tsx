
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, TrendingUp, Sparkles } from "lucide-react";
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
        {/* Enhanced background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] animate-pulse"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Multiple ambient glows */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        {/* Main hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-12 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                AI-Powered Outbound Marketing
              </div>
              
              {/* Main headline */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin text-white leading-[0.9] tracking-tight">
                  Slimmer werken,
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-light">
                    sneller groeien
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-2xl">
                  Automatiseer je outbound marketing met AI en bereik de juiste beslissers op het perfecte moment.
                </p>
              </div>

              {/* Key benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Target, label: "94% Bereik", desc: "Precision targeting" },
                  { icon: Zap, label: "5x Sneller", desc: "AI automation" },
                  { icon: TrendingUp, label: "73% Meer", desc: "Qualified leads" }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 text-white">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{benefit.label}</div>
                      <div className="text-xs text-slate-400">{benefit.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="space-y-6">
                <Button 
                  onClick={handlePlanGesprekClick}
                  size="lg"
                  className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 px-10 py-4 text-lg font-medium rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-[1.02]"
                >
                  Start je groeispurt
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                
                <p className="text-slate-500 text-sm">
                  Gratis strategiesessie • Direct resultaat • Geen verplichtingen
                </p>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-slide-up">
              {/* Main dashboard mockup */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-blue-500/20 blur-3xl rounded-3xl animate-pulse-glow" />
                
                {/* Dashboard container */}
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                  {/* Dashboard header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-slate-400 text-sm font-medium">ScailUp Dashboard</span>
                    </div>
                    <div className="text-xs text-slate-500">Live data</div>
                  </div>

                  {/* Metrics cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { label: "Leads deze maand", value: "2,847", change: "+23%" },
                      { label: "Response rate", value: "73%", change: "+12%" },
                      { label: "Pipeline waarde", value: "€2.3M", change: "+45%" },
                      { label: "Actieve campaigns", value: "12", change: "+3%" }
                    ].map((metric, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                        <div className="text-xs text-slate-400 mb-1">{metric.label}</div>
                        <div className="text-lg font-bold text-white mb-1">{metric.value}</div>
                        <div className="text-xs text-green-400">{metric.change}</div>
                      </div>
                    ))}
                  </div>

                  {/* Activity feed */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-300 mb-3">Recente activiteit</div>
                    {[
                      { action: "Nieuwe lead gekwalificeerd", time: "2 min geleden", status: "success" },
                      { action: "Email campaign gestart", time: "8 min geleden", status: "active" },
                      { action: "Meeting ingepland", time: "15 min geleden", status: "scheduled" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 
                          activity.status === 'active' ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm text-slate-300">{activity.action}</div>
                          <div className="text-xs text-slate-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyan-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
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

          <Button 
            onClick={handlePlanGesprekClick}
            size="lg"
            className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 px-12 py-6 text-xl font-medium rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-[1.02]"
          >
            Plan je strategiegesprek
            <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </section>
    </>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
