
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Phone } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const FinalCTASection = memo(() => {
  const { openModal } = useConversionModalContext();

  const handlePlanCallClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FinalCTASection: Plan strategiegesprek clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="py-32 bg-gradient-to-b from-[#111111] to-[#0A0A0A] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#2196F3]/10 to-[#21CBF3]/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto space-y-12">
          
          {/* Main CTA Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Klaar om je agenda vol te krijgen
              <br />
              <span className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                met ideale klanten?
              </span>
            </h2>
            
            <p className="text-xl text-[#CCCCCC] leading-relaxed max-w-3xl mx-auto">
              Plan een strategiegesprek en ontdek hoe wij jouw outbound marketing volledig kunnen 
              overnemen. Geen tools, geen gedoe - alleen resultaten.
            </p>
          </div>

          {/* What to Expect */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-xl flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">15-min Intake</h3>
              <p className="text-sm text-[#CCCCCC]">We analyseren jouw situatie en doelen</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Custom Strategie</h3>
              <p className="text-sm text-[#CCCCCC]">Persoonlijk plan voor jouw bedrijf</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Snelle Setup</h3>
              <p className="text-sm text-[#CCCCCC]">Start binnen 2 weken met campagnes</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Button 
              onClick={handlePlanCallClick}
              className="group bg-gradient-to-r from-[#2196F3] to-[#21CBF3] text-white px-12 py-6 text-xl font-semibold hover:shadow-xl hover:shadow-[#2196F3]/30 transition-all duration-300"
            >
              Plan een strategiegesprek
              <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="pt-8 space-y-4">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-[#CCCCCC]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Gratis strategiegesprek</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#2196F3] rounded-full"></div>
                <span>Geen verplichtingen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Direct bruikbaar advies</span>
              </div>
            </div>
            
            <p className="text-[#CCCCCC] text-sm">
              ⚡ Meestal reageren we binnen 2 uur
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = 'FinalCTASection';
