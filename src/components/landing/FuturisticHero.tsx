
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
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
    <section className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#1e293b]" />
      
      {/* Premium ambient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-slate-300/[0.01] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>

      {/* Subtle grid overlay for premium tech feel */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148, 163, 184) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      {/* Main Content Container */}
      <div className="container mx-auto px-6 relative z-10 min-h-screen">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-screen pt-24 lg:pt-0">
          
          {/* Left Column - Premium Text Content */}
          <div className="space-y-10 lg:space-y-14">
            
            {/* Premium pre-headline */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 tracking-[0.3em] uppercase opacity-80">
                WELKOM BIJ SCAILUP
              </p>
              <div className="w-16 h-px bg-gradient-to-r from-slate-400/40 to-transparent"></div>
            </div>
            
            {/* Premium main headlines */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extralight text-slate-50 leading-[1.05] tracking-[-0.02em]">
                <span className="block mb-3">WIJ ZIJN EEN</span>
                <span className="block font-normal mb-3">
                  <span className="text-blue-400 font-medium">AI-FIRST</span>{' '}
                  <span className="text-slate-50">MARKETING</span>
                </span>
                <span className="block text-slate-200 font-light">& SALES AGENCY</span>
              </h1>
            </div>
            
            {/* Premium description */}
            <div className="max-w-xl">
              <p className="text-xl md:text-2xl text-slate-400 leading-[1.6] font-light tracking-[-0.01em]">
                We helpen ambitieuze bedrijven schalen met geavanceerde AI-oplossingen. 
                Van intelligente leadgeneratie tot geautomatiseerde conversie.
              </p>
            </div>
            
            {/* Premium CTA Button */}
            <div className="pt-6">
              <Button 
                onClick={handlePlanGesprекClick}
                variant="outline"
                size="lg" 
                className="group relative border border-slate-600/50 bg-slate-900/20 backdrop-blur-sm text-slate-200 hover:bg-slate-800/30 hover:border-slate-500/60 px-10 py-5 text-lg font-medium rounded-xl transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/40 hover:-translate-y-0.5"
              >
                <Calendar className="h-5 w-5 mr-4 opacity-80" />
                <span className="font-medium tracking-wide">PLAN EEN GESPREK</span>
                <ArrowRight className="h-5 w-5 ml-4 opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Premium button inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-slate-100/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>
            </div>

          </div>

          {/* Right Column - Premium Hero Image */}
          <div className="relative lg:h-full flex items-center justify-center">
            <div className="relative w-full max-w-2xl lg:max-w-none">
              {/* Sophisticated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-400/[0.04] via-blue-500/[0.02] to-slate-600/[0.03] blur-[80px] scale-110" />
              
              {/* Premium container */}
              <div className="relative z-10 bg-gradient-to-br from-slate-800/10 via-slate-900/20 to-slate-950/30 backdrop-blur-xl rounded-3xl p-10 border border-slate-700/20 shadow-2xl shadow-slate-950/60">
                <img 
                  src="/futuristic-ai-interface.png" 
                  alt="Premium AI-powered business intelligence dashboard" 
                  className="w-full h-auto object-contain rounded-2xl"
                  style={{ 
                    filter: 'contrast(1.1) brightness(1.05) saturate(0.9)',
                  }}
                />
                
                {/* Premium inner border */}
                <div className="absolute inset-8 rounded-2xl border border-slate-600/10 pointer-events-none" />
              </div>
              
              {/* Subtle floating elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-slate-400/[0.02] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/[0.015] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '3s' }} />
            </div>
          </div>

        </div>
      </div>

      {/* Premium bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent" />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#030712]/20" />
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
