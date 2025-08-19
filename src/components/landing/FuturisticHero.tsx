import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, TrendingUp, Sparkles, Brain, Rocket, Shield, Users, Mail, BarChart3, CheckCircle } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const FuturisticHero = memo(() => {
  const { openModal } = useConversionModalContext();
  
  const handlePlanGesprekClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FuturisticHero: Plan een gesprek button clicked - opening modal');
    openModal();
  }, [openModal]);

  return <>
    {/* Main Hero Section */}
    <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }} />
        
        {/* Multiple ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-cyan-400/8 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: '2s'
        }} />
        <div className="absolute bottom-1/3 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{
          animationDelay: '4s'
        }} />
      </div>

      {/* Main hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
          
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Service badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-sm rounded-full border border-blue-500/20">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-300 font-medium">Done-For-You Outbound Service</span>
            </div>
            
            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                <span className="block text-white mb-2">
                  VOLLEDIGE OUTBOUND
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent mb-2">
                  AUTOMATISERING
                </span>
                <span className="block text-white text-xl md:text-2xl font-normal text-slate-300">
                  Powered by AI
                </span>
              </h1>
              
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
              
              <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-xl">
                Wij nemen je complete outbound over. Van lead research tot meeting booking - 
                volledig geautomatiseerd met geavanceerde AI. Jij focust op sluiten, wij zorgen voor de pipeline.
              </p>
            </div>

            {/* Service features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Complete lead research",
                "AI-gegenereerde berichten", 
                "Multi-channel outreach",
                "Automatische follow-ups"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Results showcase */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/40 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 text-center">
                <div className="text-2xl font-bold text-white mb-1">10-50x</div>
                <div className="text-xs text-slate-400">Meer leads</div>
              </div>
              
              <div className="bg-slate-900/40 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 text-center">
                <div className="text-2xl font-bold text-white mb-1">87%</div>
                <div className="text-xs text-slate-400">Response rate</div>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 text-center">
                <div className="text-2xl font-bold text-white mb-1">100%</div>
                <div className="text-xs text-slate-400">Hands-off</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button 
                onClick={handlePlanGesprekClick} 
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 border-0"
              >
                START JOUW OUTBOUND MACHINE
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <p className="text-sm text-slate-500">Geen setup, geen gedoe - wij regelen alles</p>
            </div>
          </div>

          {/* Right Visual - Outbound Process Visualization */}
          <div className="relative animate-slide-up flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              
              {/* Central process hub */}
              <div className="relative mb-8">
                {/* Outer orbit ring */}
                <div className="relative w-80 h-80 mx-auto">
                  {/* Glowing center */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-400/30 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                  
                  {/* Process steps orbiting around center */}
                  <div className="absolute inset-12 border border-blue-400/20 rounded-full">
                    {/* Center AI hub */}
                    <div className="absolute inset-1/3 bg-gradient-to-br from-blue-400/60 via-cyan-300/70 to-blue-500/60 rounded-full backdrop-blur-sm border border-cyan-300/30 flex items-center justify-center">
                      <div className="text-center">
                        <Brain className="h-6 w-6 text-white mx-auto mb-1" />
                        <div className="text-xs text-white font-medium">ScailUp</div>
                        <div className="text-xs text-cyan-200">AI Engine</div>
                      </div>
                    </div>
                    
                    {/* Orbiting process elements */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30 animate-float">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-400" />
                        <div className="text-xs text-white">Lead Research</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-green-400/30 animate-float" style={{ animationDelay: '1s' }}>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-green-400" />
                        <div className="text-xs text-white">AI Messaging</div>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30 animate-float" style={{ animationDelay: '2s' }}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-400" />
                        <div className="text-xs text-white">Follow-up</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-orange-400/30 animate-float" style={{ animationDelay: '3s' }}>
                      <div className="flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-orange-400" />
                        <div className="text-xs text-white">Booking</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process flow indicators */}
              <div className="space-y-4">
                {/* Live activity feed */}
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">Live Outbound Activity</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-green-400">ACTIEF</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      <span className="text-slate-300">152 prospects geanalyseerd</span>
                      <span className="text-slate-500 ml-auto">nu</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      <span className="text-slate-300">47 gepersonaliseerde emails verzonden</span>
                      <span className="text-slate-500 ml-auto">2m</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                      <span className="text-slate-300">8 responses ontvangen</span>
                      <span className="text-slate-500 ml-auto">5m</span>
                    </div>
                  </div>
                </div>

                {/* Pipeline metrics */}
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">2,847</div>
                      <div className="text-xs text-slate-400">Leads</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">342</div>
                      <div className="text-xs text-slate-400">Responses</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">89</div>
                      <div className="text-xs text-slate-400">Meetings</div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-green-400 to-blue-400 h-1.5 rounded-full transition-all duration-1000" style={{ width: '73%' }} />
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
      {/* Background elements */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2">
        <div className="w-32 h-32 relative">
          {/* 3D-like geometric shapes */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-400/30 rounded-full blur-xl" />
          <div className="absolute inset-4 bg-gradient-to-br from-purple-500/30 to-blue-500/40 transform rotate-45 blur-lg" />
          <div className="absolute inset-8 bg-gradient-to-br from-cyan-400/40 to-purple-400/50 rounded-lg transform -rotate-12 blur-md" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - geometric visualization */}
          <div className="relative">
            <div className="space-y-6">
              {/* Floating cards with metrics */}
              <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">2,847</div>
                    <div className="text-sm text-slate-400">Leads deze maand</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 transform rotate-2 hover:rotate-0 transition-transform duration-500 ml-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">73%</div>
                    <div className="text-sm text-slate-400">Response rate</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">€2.3M</div>
                    <div className="text-sm text-slate-400">Pipeline waarde</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-sm text-blue-400 font-medium tracking-wider">OVER ONS</div>
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Wij Brengen{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  AI-Gedreven Groei
                </span>{' '}
                Tot Leben.
              </h2>
              
              <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </div>

            <p className="text-xl text-slate-400 leading-relaxed">
              Bij ScailUp combineren we geavanceerde AI-technologie met bewezen groeistrategieën. 
              Onze missie is om bedrijven exponentieel te laten groeien door slim gebruik van 
              automatisering en data-gedreven inzichten.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["AI-gedreven lead generatie", "Geautomatiseerde workflows", "Realtime analytics", "Persoonlijke begeleiding"].map((feature, index) => <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                  <span className="text-slate-300">{feature}</span>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  </>;
});

FuturisticHero.displayName = 'FuturisticHero';
export { FuturisticHero };
