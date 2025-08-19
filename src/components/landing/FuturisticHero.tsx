
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Sparkles } from "lucide-react";
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
      {/* Dark background with subtle patterns */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(0deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Ambient lighting effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium tracking-wide">WELKOM BIJ SCAILUP</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                WE ARE{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
                  AI-DRIVEN
                </span>
                <br />
                GROWTH AGENCY
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

          {/* Right Column - Futuristic Visual */}
          <div className="relative">
            {/* Main circular glow effect */}
            <div className="relative w-full h-[600px] flex items-center justify-center">
              {/* Central glowing orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 blur-3xl animate-pulse-glow"></div>
              </div>
              
              {/* Outer ring */}
              <div className="relative w-96 h-96 rounded-full border border-blue-500/30 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
                {/* Inner ring */}
                <div className="w-72 h-72 rounded-full border border-purple-500/40 flex items-center justify-center animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                  {/* Core */}
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <Sparkles className="h-16 w-16 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
                
                {/* Floating elements around the rings */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>

              {/* Floating data elements */}
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-16 bg-gradient-to-t from-transparent via-blue-400/60 to-transparent animate-data-flow"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with additional info */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Sales Automation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Lead Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Marketing Automation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
