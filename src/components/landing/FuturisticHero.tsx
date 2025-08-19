
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const FuturisticHero = memo(() => {
  const { openModal } = useConversionModalContext();

  const handlePlanGesprекClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FuturisticHero: Plan een gesprek button clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-slate-900/40" />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        
        {/* Hero Content - Apple Style */}
        <div className="text-center space-y-12">
          
          {/* Pre-headline */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-blue-400/80 tracking-[0.2em] uppercase">
              WELKOM BIJ SCAILUP
            </p>
          </div>
          
          {/* Main Headline - Apple Style */}
          <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-thin text-white leading-[0.9] tracking-[-0.025em]">
              <span className="block mb-4">Wij zijn een</span>
              <span className="block">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-light">
                  AI-first
                </span>
              </span>
              <span className="block mt-4 text-slate-200">
                marketing & sales agency
              </span>
            </h1>
          </div>
          
          {/* Subtitle - Apple Style */}
          <div className="max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl text-slate-400 font-light leading-relaxed">
              We helpen ambitieuze bedrijven schalen met geavanceerde AI-oplossingen.
              <br className="hidden md:block" />
              Van intelligente leadgeneratie tot geautomatiseerde conversie.
            </p>
          </div>
          
          {/* CTA Button - Apple Style */}
          <div className="pt-8">
            <Button 
              onClick={handlePlanGesprekClick}
              size="lg"
              className="group bg-blue-600 hover:bg-blue-700 text-white border-0 px-8 py-4 text-lg font-medium rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Plan een gesprek
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

        </div>

        {/* Hero Image Section - Apple Style */}
        <div className="mt-20 lg:mt-24">
          <div className="relative max-w-4xl mx-auto">
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent blur-3xl scale-110" />
            
            {/* Main image container */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-800/50 bg-gradient-to-br from-slate-800/20 to-slate-900/40 backdrop-blur-sm">
                <img 
                  src="/futuristic-ai-interface.png" 
                  alt="AI-powered business intelligence dashboard" 
                  className="w-full h-auto object-cover"
                  style={{ 
                    filter: 'brightness(1.1) contrast(1.05) saturate(0.9)',
                  }}
                />
              </div>
              
              {/* Reflection effect - Apple style */}
              <div className="absolute -bottom-px left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent rounded-b-3xl" />
            </div>
            
          </div>
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
