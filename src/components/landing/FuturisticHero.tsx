
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
    <section className="min-h-screen bg-[#0A0F1C] relative overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1C] via-[#0E1528] to-[#1A1F3A]" />
      
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '3s' }} />
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-6 relative z-10 min-h-screen">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen pt-20 lg:pt-0">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8 lg:space-y-12">
            
            {/* Pre-headline */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-cyan-400 tracking-[0.2em] uppercase">
                WELKOM BIJ SCAILUP
              </p>
              <div className="w-12 h-0.5 bg-cyan-400"></div>
            </div>
            
            {/* Main Headlines */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[1.1] tracking-tight">
                <span className="block">WIJ ZIJN EEN</span>
                <span className="block font-medium">
                  <span className="text-cyan-400">AI-FIRST</span>{' '}
                  <span className="text-white">MARKETING</span>
                </span>
                <span className="block">& SALES AGENCY</span>
              </h1>
            </div>
            
            {/* Description */}
            <div className="max-w-lg">
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
                We helpen bedrijven groeien met slimme AI-oplossingen voor marketing en sales. 
                Van leadgeneratie tot conversie - wij maken het verschil.
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="pt-4">
              <Button 
                onClick={handlePlanGesprекClick}
                variant="outline"
                size="lg" 
                className="group relative border-2 border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400 hover:text-[#0A0F1C] px-8 py-4 text-base font-medium rounded-none transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
              >
                <Calendar className="h-5 w-5 mr-3" />
                <span className="font-semibold tracking-wide">PLAN EEN GESPREK</span>
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>

          </div>

          {/* Right Column - Hero Image */}
          <div className="relative lg:h-full flex items-center justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-3xl scale-110" />
              
              {/* Main hero image */}
              <div className="relative z-10 bg-gradient-to-br from-gray-800/20 to-gray-900/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30">
                <img 
                  src="/placeholder.svg" 
                  alt="AI-powered futuristic interface" 
                  className="w-full h-auto object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))',
                  }}
                />
              </div>
              
              {/* Floating accent elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-400/10 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0F1C] to-transparent" />
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
