import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, TrendingUp, Sparkles, Brain, Rocket, Shield, Users, Mail, BarChart3 } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';
const FuturisticHero = memo(() => {
  const {
    openModal
  } = useConversionModalContext();
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
            <div className="space-y-10 animate-fade-in">
              {/* Welcome badge */}
              
              
              {/* Main headline - smaller size */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[0.9] tracking-tight">
                  WIJ ZIJN 
                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    AI-GEDREVEN
                  </span>
                  <span className="block text-white">
                    GROEI EXPERTS
                  </span>
                </h1>
                
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                
                <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed max-w-xl">
                  Van 10 naar 1000+ leads per maand. Wij automatiseren je outbound marketing met geavanceerde AI en zorgen voor exponentiële groei.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">94%</div>
                      <div className="text-xs text-slate-400">Precisie</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-900/40 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">5x</div>
                      <div className="text-xs text-slate-400">Sneller</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="space-y-4">
                <Button onClick={handlePlanGesprekClick} className="group bg-transparent border-2 border-blue-500/50 hover:bg-blue-500/10 text-blue-400 hover:text-white px-8 py-4 text-lg font-medium transition-all duration-500 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25">
                  NEEM CONTACT OP
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            </div>

            {/* Right Visual - Combined AI Figure + Dashboard */}
            <div className="relative animate-slide-up flex items-center justify-center">
              {/* Main container for both elements */}
              <div className="relative w-full max-w-md">
                
                {/* Central AI visualization */}
                <div className="relative mb-8">
                  {/* Main glowing orb */}
                  <div className="relative w-64 h-64 mx-auto">
                    {/* Outer glow rings */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-400/30 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute inset-4 bg-gradient-to-r from-cyan-400/30 via-blue-500/40 to-purple-400/30 rounded-full blur-2xl animate-pulse" style={{
                    animationDelay: '1s'
                  }} />
                    
                    {/* Central core */}
                    <div className="absolute inset-1/4 bg-gradient-to-br from-blue-400/60 via-cyan-300/70 to-blue-500/60 rounded-full backdrop-blur-sm border border-cyan-300/30">
                      {/* Inner energy patterns */}
                      <div className="absolute inset-2 rounded-full border border-cyan-400/20">
                        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-transparent via-cyan-400/10 to-transparent animate-spin" style={{
                        animationDuration: '20s'
                      }}>
                          {/* Neural network lines */}
                          <div className="absolute top-1/4 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                          <div className="absolute top-3/4 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                          <div className="absolute left-1/4 top-1/4 w-px h-1/2 bg-gradient-to-b from-transparent via-purple-400/60 to-transparent" />
                          <div className="absolute right-1/4 top-1/4 w-px h-1/2 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent" />
                        </div>
                      </div>
                      
                      {/* Center AI symbol */}
                      <div className="absolute inset-1/3 rounded-full bg-gradient-to-br from-white/20 to-cyan-300/40 backdrop-blur-sm flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard-style metrics below orb */}
                <div className="space-y-4">
                  {/* Live metrics card */}
                  <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-400">Live Dashboard</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">LIVE</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">2,847</div>
                        <div className="text-xs text-slate-400">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">€2.3M</div>
                        <div className="text-xs text-slate-400">Pipeline</div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-1.5 rounded-full transition-all duration-1000" style={{
                        width: '73%'
                      }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Activity feed */}
                  <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-slate-300">Nieuwe lead: TechCorp B.V.</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-slate-300">Email geopend: Innovation Inc.</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        <span className="text-slate-300">Meeting gepland: StartupXYZ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating data elements around the main visual */}
                <div className="absolute -top-4 -right-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-cyan-400/20 animate-float">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-cyan-400" />
                    <span className="text-xs text-white">AI Email</span>
                  </div>
                </div>

                <div className="absolute top-1/4 -left-8 bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 border border-purple-400/20 animate-float" style={{
                animationDelay: '2s'
              }}>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3 w-3 text-purple-400" />
                    <span className="text-xs text-white">Analytics</span>
                  </div>
                </div>

                {/* Orbiting particles */}
                <div className="absolute inset-0 animate-spin" style={{
                animationDuration: '30s'
              }}>
                  <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-cyan-400/60 rounded-full -translate-x-1/2 animate-pulse" />
                  <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-400/60 rounded-full -translate-x-1/2 animate-pulse" style={{
                  animationDelay: '1s'
                }} />
                  <div className="absolute left-0 top-1/2 w-1 h-1 bg-purple-400/60 rounded-full -translate-y-1/2 animate-pulse" style={{
                  animationDelay: '2s'
                }} />
                  <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-cyan-400/60 rounded-full -translate-y-1/2 animate-pulse" style={{
                  animationDelay: '3s'
                }} />
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