
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const AgencyHero = memo(() => {
  const { openModal } = useConversionModalContext();

  const handlePlanCallClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('AgencyHero: Plan strategiegesprek clicked - opening modal');
    openModal();
  }, [openModal]);

  const handleViewCasesClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Scroll to cases section
    document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section className="min-h-screen bg-[#111111] relative overflow-hidden flex items-center pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-[#2196F3]/10 to-[#21CBF3]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-[#21CBF3]/10 to-[#2196F3]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-10">
          
          {/* Main Headlines */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tight">
              Meer afspraken.
              <br />
              <span className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                Minder gedoe.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#CCCCCC] font-light leading-relaxed max-w-3xl mx-auto">
              ScailUp helpt B2B bedrijven om continu hun agenda te vullen met ideale klanten 
              via AI-gedreven outbound. Volledig voor je geregeld.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={handlePlanCallClick}
              className="group bg-gradient-to-r from-[#2196F3] to-[#21CBF3] text-white px-10 py-4 text-lg font-medium hover:shadow-xl hover:shadow-[#2196F3]/30 transition-all duration-300"
            >
              Plan een strategiegesprek
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            <Button 
              onClick={handleViewCasesClick}
              className="group bg-[#111111] border-2 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3]/10 px-10 py-4 text-lg font-medium transition-all duration-300"
            >
              <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              Bekijk onze cases
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-16">
            <p className="text-[#CCCCCC] text-sm mb-8">Vertrouwd door 200+ B2B bedrijven</p>
            <div className="grid grid-cols-3 gap-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  847
                </div>
                <div className="text-sm text-[#CCCCCC]">Afspraken deze maand</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  €4.2M
                </div>
                <div className="text-sm text-[#CCCCCC]">Pipeline waarde</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  94%
                </div>
                <div className="text-sm text-[#CCCCCC]">Klant tevredenheid</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AgencyHero.displayName = 'AgencyHero';
