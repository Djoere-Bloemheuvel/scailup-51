
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
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white" />
      
      {/* Ambient subtle elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Very subtle floating orbs */}
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-purple-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Pre-headline */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">
              AI-First Marketing & Sales Agency
            </p>
          </div>
          
          {/* Main Headlines - Apple style typography */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-gray-900 leading-[0.9] tracking-tight">
              <span className="block">Slimmere</span>
              <span className="block font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                groei
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-600 leading-tight tracking-tight max-w-3xl mx-auto">
              Minder ruis. Meer impact.
            </p>
          </div>
          
          {/* Description */}
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-normal">
              Van hyperpersoonlijke e-mailcampagnes tot strategische LinkedIn outreach 
              en maatwerk ABM-campagnes die meetbaar omzet opleveren.
            </p>
          </div>
          
          {/* CTA Button - Apple style */}
          <div className="pt-8">
            <Button 
              onClick={handlePlanGesprекClick}
              size="lg" 
              className="group relative bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <Calendar className="h-5 w-5 mr-3" />
              <span>Plan een gesprek</span>
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </div>

          {/* Trust indicators - minimal */}
          <div className="pt-16 space-y-4">
            <p className="text-sm text-gray-400 font-medium">
              Vertrouwd door groeiende bedrijven
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-30">
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-18 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
