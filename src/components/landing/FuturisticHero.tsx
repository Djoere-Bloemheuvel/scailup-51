
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
    <section className="min-h-screen flex items-center relative overflow-hidden" style={{ backgroundColor: '#0A0F1C' }}>
      {/* Ambient Background Effects */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-purple-900/10" />
        
        {/* Ambient glow - Electric Cyan */}
        <div 
          className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse-glow"
          style={{ backgroundColor: '#00E5FF' }}
        />
        
        {/* Ambient glow - Neon Purple */}
        <div 
          className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-2xl opacity-15 animate-pulse-glow"
          style={{ 
            backgroundColor: '#8B5CF6',
            animationDelay: '2s'
          }}
        />

        {/* Abstract floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Subtle geometric shapes */}
          <div 
            className="absolute top-20 left-10 w-32 h-1 bg-gradient-to-r opacity-30 animate-drift"
            style={{ 
              background: 'linear-gradient(90deg, transparent, #00E5FF, transparent)'
            }}
          />
          <div 
            className="absolute bottom-32 right-20 w-24 h-1 bg-gradient-to-r opacity-25 animate-drift"
            style={{ 
              background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)',
              animationDelay: '3s'
            }}
          />
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-12">
          
          {/* Main Heading */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
              <span className="block text-white font-black">SLIMMERE</span>
              <span 
                className="block bg-gradient-to-r bg-clip-text text-transparent font-black"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #00E5FF 0%, #8B5CF6 100%)'
                }}
              >
                GROEI
              </span>
            </h1>
            
            {/* Subtitle */}
            <div className="space-y-4">
              <p className="text-2xl md:text-3xl text-gray-300 font-light tracking-wide">
                Minder ruis. Meer impact.
              </p>
              
              {/* Glassmorphism description card */}
              <div 
                className="inline-block p-6 rounded-2xl border backdrop-blur-xl max-w-2xl mx-auto"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <p className="text-lg text-gray-200 leading-relaxed">
                  AI-first marketing & sales agency. Van hyperpersoonlijke e-mailcampagnes 
                  tot strategische LinkedIn outreach en maatwerk ABM-campagnes die 
                  meetbaar omzet opleveren.
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA Button with ambient glow */}
          <div className="flex justify-center">
            <div className="relative group">
              {/* Button glow effect */}
              <div 
                className="absolute -inset-1 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #8B5CF6)'
                }}
              />
              
              <Button 
                onClick={handlePlanGesprекClick}
                size="lg" 
                className="relative gap-3 px-12 py-8 text-xl font-semibold rounded-2xl border-0 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'rgba(0, 229, 255, 0.1)',
                  color: '#00E5FF',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 229, 255, 0.3)'
                }}
              >
                <Calendar className="h-6 w-6" />
                <span>Plan een gesprek</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom ambient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-30">
        <div 
          className="h-full bg-gradient-to-r"
          style={{
            background: 'linear-gradient(90deg, transparent, #00E5FF, #8B5CF6, transparent)'
          }}
        />
      </div>
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
