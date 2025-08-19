import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Sparkles, Brain, Zap, Target, Cpu, Globe, Layers } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const FuturisticHero = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleStartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FuturisticHero: Start button clicked - opening modal');
    openModal();
  }, [openModal]);

  const handleContactClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FuturisticHero: Contact button clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden bg-gray-950">
      {/* Enhanced background with depth */}
      <div className="absolute inset-0">
        {/* Base gradient with more depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900" />
        
        {/* Layered atmospheric effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(59,130,246,0.08)_0%,transparent_50%)]" />
        
        {/* Dynamic grid with perspective */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
              linear-gradient(0deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(1000px) rotateX(45deg) scale(2)',
            transformOrigin: 'center bottom'
          }}
        />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium tracking-wide">WELKOM BIJ SCAILUP</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
                  WE ARE AI-DRIVEN
                </span>{" "}
                <span className="text-white">GROWTH AGENCY</span>
              </h1>
              
              {/* Decorative underline */}
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                Van startup naar scale-up. ScailUp automatiseert je sales, marketing en groeiprocessen 
                met geavanceerde AI-technologie zodat jij je kunt focussen op wat écht belangrijk is.
              </p>
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={handleStartClick}
              size="lg" 
              className="group relative gap-3 px-8 py-6 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300 text-lg font-semibold"
            >
              <span>START GRATIS</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Column - 3D AI Brain Visualization */}
          <div className="relative">
            <div className="relative w-full h-[600px] flex items-center justify-center">
              {/* Main 3D Brain Structure */}
              <div className="relative w-80 h-80">
                {/* Central core - AI brain */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Outer neural network ring */}
                  <div className="absolute w-full h-full rounded-full border-2 border-blue-400/30 animate-spin-slow">
                    {/* Neural connection points */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 bg-blue-400/80 rounded-full shadow-lg shadow-blue-400/50"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `
                            translate(-50%, -50%) 
                            rotate(${i * 45}deg) 
                            translateY(-150px)
                          `,
                          animationDelay: `${i * 0.2}s`
                        }}
                      >
                        <div className="w-full h-full bg-blue-400 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Middle processing ring */}
                  <div className="absolute w-72 h-72 rounded-full border border-purple-400/40 animate-reverse-spin">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-4 h-4 bg-purple-400/70 rounded-full shadow-lg shadow-purple-400/50"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `
                            translate(-50%, -50%) 
                            rotate(${i * 60}deg) 
                            translateY(-130px)
                          `,
                          animationDelay: `${i * 0.3}s`
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Core AI Brain */}
                  <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/40 via-purple-500/40 to-cyan-500/40 backdrop-blur-sm border border-white/20 shadow-2xl shadow-blue-500/30">
                    {/* Inner brain structure */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400/60 to-purple-500/60 border border-white/10">
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-cyan-400/50 to-blue-500/50 flex items-center justify-center">
                        <Brain className="h-16 w-16 text-white animate-pulse drop-shadow-lg" />
                      </div>
                    </div>
                    
                    {/* Synaptic connections */}
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-8 bg-gradient-to-t from-transparent via-blue-300/60 to-transparent"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `
                            translate(-50%, -50%) 
                            rotate(${i * 30}deg) 
                            translateY(-70px)
                          `,
                          animationDelay: `${i * 0.1}s`
                        }}
                      >
                        <div className="w-full h-full animate-pulse opacity-70"></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Floating AI capability icons */}
                <div className="absolute -top-8 -left-8">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400/80 to-green-500/80 rounded-2xl shadow-2xl shadow-emerald-500/30 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float">
                    <Zap className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-12">
                  <div className="relative w-14 h-14 bg-gradient-to-br from-orange-400/80 to-red-500/80 rounded-xl shadow-2xl shadow-orange-500/30 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
                    <Target className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="absolute -bottom-8 -right-8">
                  <div className="relative w-16 h-16 bg-gradient-to-br from-violet-400/80 to-purple-500/80 rounded-2xl shadow-2xl shadow-violet-500/30 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                    <Cpu className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-12">
                  <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400/80 to-blue-500/80 rounded-xl shadow-2xl shadow-cyan-500/30 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
                    <Globe className="h-7 w-7 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <div className="absolute top-1/2 -left-16 transform -translate-y-1/2">
                  <div className="relative w-12 h-12 bg-gradient-to-br from-pink-400/80 to-rose-500/80 rounded-lg shadow-2xl shadow-pink-500/30 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                    <Layers className="h-6 w-6 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Ambient data streams */}
              {[...Array(15)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 bg-gradient-to-t from-transparent via-blue-400/40 to-transparent animate-data-stream"
                  style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${10 + Math.random() * 80}%`,
                    height: `${40 + Math.random() * 60}px`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${2 + Math.random() * 3}s`
                  }}
                />
              ))}

              {/* Background glow effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with AI capabilities */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Neural Network Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>AI Lead Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Intelligent Automation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
