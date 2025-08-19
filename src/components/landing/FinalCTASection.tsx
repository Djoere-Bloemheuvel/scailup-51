
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Settings, Zap } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const FinalCTASection = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleStartAutopilotClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FinalCTASection: Start Autopilot clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="py-32 bg-gradient-to-b from-[#111111] to-[#0A0A0A] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#2196F3]/10 to-[#21CBF3]/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Zet je bedrijf
                <br />
                <span className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  op autopilot
                </span>
              </h2>
              
              <p className="text-xl text-[#CCCCCC] leading-relaxed max-w-xl">
                Stop met handmatig leads zoeken. Laat onze AI je outbound marketing volledig overnemen 
                en focus op wat je het beste doet: je bedrijf laten groeien.
              </p>
            </div>

            {/* Key benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-gradient-to-r from-[#2196F3] to-[#21CBF3] rounded-full"></div>
                <span className="text-[#CCCCCC]">Setup in 24 uur, resultaten binnen 7 dagen</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-gradient-to-r from-[#2196F3] to-[#21CBF3] rounded-full"></div>
                <span className="text-[#CCCCCC]">Geen lange contracten, opzegbaar per maand</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-gradient-to-r from-[#2196F3] to-[#21CBF3] rounded-full"></div>
                <span className="text-[#CCCCCC]">Persoonlijke begeleiding van AI-experts</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button 
                onClick={handleStartAutopilotClick}
                className="group bg-gradient-to-r from-[#2196F3] to-[#21CBF3] text-white px-10 py-4 text-lg font-medium hover:shadow-xl hover:shadow-[#2196F3]/30 transition-all duration-300"
              >
                Start Autopilot Nu
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>

          {/* Right Visual - AI Gear Animation */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
              {/* Large central gear */}
              <div className="w-80 h-80 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2196F3]/20 to-[#21CBF3]/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
                  <div className="absolute inset-8 bg-gradient-to-br from-[#2196F3]/30 to-[#21CBF3]/30 rounded-full">
                    <div className="absolute inset-8 bg-gradient-to-br from-[#2196F3]/40 to-[#21CBF3]/40 rounded-full flex items-center justify-center">
                      <Settings className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>

                {/* Orbiting smaller gears */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-[#21CBF3] to-[#2196F3] rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}>
                  <Zap className="h-8 w-8 text-white" />
                </div>

                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
                  <Settings className="h-6 w-6 text-white" />
                </div>

                <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-[#21CBF3] to-[#2196F3] rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
                  <Zap className="h-7 w-7 text-white" />
                </div>

                <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '15s' }}>
                  <Settings className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-[#2196F3] rounded-full animate-pulse"></div>
              <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-[#21CBF3] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-gradient-to-r from-[#2196F3] to-[#21CBF3] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-[#21CBF3] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = 'FinalCTASection';
