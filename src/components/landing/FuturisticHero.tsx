
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, TrendingUp, Sparkles, Brain, Rocket, Shield, Users, Mail, BarChart3, Database, Linkedin, Bot } from "lucide-react";
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
              {/* Main headline */}
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

            {/* Right Visual - Services Showcase */}
            <div className="relative animate-slide-up flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                
                {/* Central Services Hub */}
                <div className="relative">
                  {/* Main hub container */}
                  <div className="relative w-80 h-80 mx-auto">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-400/30 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    
                    {/* Central core */}
                    <div className="absolute inset-8 bg-slate-900/80 backdrop-blur-sm rounded-full border border-cyan-300/30 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto">
                          <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-white font-bold">ScailUp</div>
                        <div className="text-xs text-slate-400">AI Platform</div>
                      </div>
                    </div>

                    {/* Service nodes positioned around the circle */}
                    
                    {/* Lead Database - Top */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-blue-400/30 animate-float">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Database className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">Lead Database</span>
                          <span className="text-xs text-blue-400">2,847 leads</span>
                        </div>
                      </div>
                    </div>

                    {/* Email Outreach - Top Right */}
                    <div className="absolute -top-2 -right-8">
                      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-green-400/30 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">Email AI</span>
                          <span className="text-xs text-green-400">87% open rate</span>
                        </div>
                      </div>
                    </div>

                    {/* LinkedIn Outreach - Right */}
                    <div className="absolute top-1/2 -right-12 -translate-y-1/2">
                      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-purple-400/30 animate-float" style={{ animationDelay: '2s' }}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Linkedin className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">LinkedIn AI</span>
                          <span className="text-xs text-purple-400">73% response</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Personalization - Bottom Right */}
                    <div className="absolute -bottom-2 -right-8">
                      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-pink-400/30 animate-float" style={{ animationDelay: '3s' }}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <Brain className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">AI Personalisatie</span>
                          <span className="text-xs text-pink-400">91% relevantie</span>
                        </div>
                      </div>
                    </div>

                    {/* Sales Automation - Bottom */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/30 animate-float" style={{ animationDelay: '4s' }}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">Automation</span>
                          <span className="text-xs text-cyan-400">24/7 actief</span>
                        </div>
                      </div>
                    </div>

                    {/* Analytics - Left */}
                    <div className="absolute top-1/2 -left-12 -translate-y-1/2">
                      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-orange-400/30 animate-float" style={{ animationDelay: '5s' }}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">Analytics</span>
                          <span className="text-xs text-orange-400">Real-time</span>
                        </div>
                      </div>
                    </div>

                    {/* Connection lines with glow effect */}
                    <div className="absolute inset-0">
                      {/* Connecting lines from center to each service */}
                      <div className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-transparent to-blue-400/60 transform -translate-y-1/2 -translate-x-full rotate-[320deg] origin-right"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-transparent to-green-400/60 transform -translate-y-1/2 -translate-x-full rotate-[20deg] origin-right"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-transparent to-purple-400/60 transform -translate-y-1/2 -translate-x-full rotate-[0deg] origin-right"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-transparent to-pink-400/60 transform -translate-y-1/2 -translate-x-full rotate-[340deg] origin-right"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-transparent to-cyan-400/60 transform -translate-y-1/2 -translate-x-full rotate-[280deg] origin-right"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-px bg-gradient-to-r from-transparent to-orange-400/60 transform -translate-y-1/2 -translate-x-full rotate-[180deg] origin-right"></div>
                    </div>
                  </div>
                </div>

                {/* Bottom metrics summary */}
                <div className="mt-8 bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400 font-medium">LIVE RESULTATEN</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-white">€2.3M</div>
                        <div className="text-xs text-slate-400">Pipeline</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">2,847</div>
                        <div className="text-xs text-slate-400">Leads</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">94%</div>
                        <div className="text-xs text-slate-400">Success</div>
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
