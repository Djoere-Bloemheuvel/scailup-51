
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    <section className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 via-transparent to-slate-900/20" />
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* Hero Content - Apple Style */}
        <div className="text-center space-y-16">
          
          {/* Pre-headline */}
          <div className="space-y-4">
            <p className="text-xs font-medium text-blue-400/60 tracking-[0.3em] uppercase">
              WELKOM BIJ SCAILUP
            </p>
          </div>
          
          {/* Main Headline - Apple Style */}
          <div className="space-y-8 max-w-6xl mx-auto">
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-thin text-white leading-[0.85] tracking-[-0.04em]">
              <span className="block mb-6">Wij zijn een</span>
              <span className="block">
                <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent font-extralight">
                  AI-first
                </span>
              </span>
              <span className="block mt-6 text-slate-100 font-extralight">
                marketing & sales agency
              </span>
            </h1>
          </div>
          
          {/* Subtitle - Apple Style */}
          <div className="max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl text-slate-300 font-light leading-[1.4] tracking-[-0.01em]">
              We helpen ambitieuze bedrijven schalen met geavanceerde AI-oplossingen.
              <br className="hidden md:block" />
              Van intelligente leadgeneratie tot geautomatiseerde conversie.
            </p>
          </div>
          
          {/* CTA Button - Apple Style */}
          <div className="pt-12">
            <Button 
              onClick={handlePlanGesprekClick}
              size="lg"
              className="group bg-blue-500 hover:bg-blue-600 text-white border-0 px-10 py-5 text-xl font-normal rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-[1.02]"
            >
              Plan een gesprek
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

        </div>

        {/* Hero Image Section - Apple Style */}
        <div className="mt-32 lg:mt-40">
          <div className="relative max-w-5xl mx-auto">
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-400/5 via-transparent to-transparent blur-3xl scale-125" />
            
            {/* Main image container */}
            <div className="relative">
              <div className="rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.15)] border border-slate-800/30 bg-gradient-to-br from-slate-900/10 to-black/20 backdrop-blur-sm">
                <img 
                  src="/futuristic-ai-interface.png" 
                  alt="AI-powered business intelligence dashboard" 
                  className="w-full h-auto object-cover"
                  style={{ 
                    filter: 'brightness(0.9) contrast(1.1) saturate(0.8)',
                  }}
                />
              </div>
              
              {/* Reflection effect - Apple style */}
              <div className="absolute -bottom-px left-0 right-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent rounded-b-[2rem]" />
            </div>
            
          </div>
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
