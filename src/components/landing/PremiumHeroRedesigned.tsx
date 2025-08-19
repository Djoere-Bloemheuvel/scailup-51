
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Zap, Target, TrendingUp } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const PremiumHeroRedesigned = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleGetStartedClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PremiumHeroRedesigned: Get Started clicked - opening modal');
    openModal();
  }, [openModal]);

  const handleSeeHowClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PremiumHeroRedesigned: See How It Works clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="min-h-screen bg-[#111111] relative overflow-hidden flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#2196F3]/10 to-[#21CBF3]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-[#21CBF3]/10 to-[#2196F3]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tight">
                Use AI to
                <br />
                <span className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  scale up
                </span>
                <br />
                your business
              </h1>
              
              <p className="text-xl md:text-2xl text-[#CCCCCC] font-light leading-relaxed max-w-xl">
                Van 10 naar 1000+ leads per maand. Onze AI neemt je complete outbound marketing over - volledig geautomatiseerd.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleGetStartedClick}
                className="group bg-gradient-to-r from-[#2196F3] to-[#21CBF3] text-white px-8 py-4 text-lg font-medium hover:shadow-lg hover:shadow-[#2196F3]/25 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                onClick={handleSeeHowClick}
                className="group bg-[#111111] border-2 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3]/10 px-8 py-4 text-lg font-medium transition-all duration-300"
              >
                See How It Works
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  2,847+
                </div>
                <div className="text-sm text-[#CCCCCC]">Leads deze maand</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  94%
                </div>
                <div className="text-sm text-[#CCCCCC]">Conversie ratio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                  €2.3M
                </div>
                <div className="text-sm text-[#CCCCCC]">Pipeline waarde</div>
              </div>
            </div>
          </div>

          {/* Right Visual - Floating AI Card */}
          <div className="relative flex items-center justify-center">
            <div className="relative">
              {/* Main floating card */}
              <div className="bg-[#111111]/80 backdrop-blur-xl border border-[#222222] rounded-3xl p-8 w-80 h-80 flex items-center justify-center shadow-2xl animate-float">
                <div className="relative">
                  {/* Central AI Brain */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-2xl flex items-center justify-center mb-6">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  
                  {/* Floating orbs around the brain */}
                  <div className="absolute -top-8 -right-8 w-4 h-4 bg-[#2196F3] rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-6 -left-6 w-3 h-3 bg-[#21CBF3] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 -left-12 w-2 h-2 bg-gradient-to-r from-[#2196F3] to-[#21CBF3] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute top-1/4 -right-12 w-2 h-2 bg-gradient-to-r from-[#21CBF3] to-[#2196F3] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">AI Engine</h3>
                    <p className="text-sm text-[#CCCCCC]">Powering your growth</p>
                  </div>
                </div>
              </div>

              {/* Additional floating elements */}
              <div className="absolute -top-8 -left-8 bg-[#111111]/60 backdrop-blur-sm rounded-xl p-3 border border-[#222222] animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#2196F3]" />
                  <span className="text-xs text-white">Target</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-[#111111]/60 backdrop-blur-sm rounded-xl p-3 border border-[#222222] animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#21CBF3]" />
                  <span className="text-xs text-white">Automate</span>
                </div>
              </div>

              <div className="absolute top-1/3 -right-16 bg-[#111111]/60 backdrop-blur-sm rounded-xl p-3 border border-[#222222] animate-float" style={{ animationDelay: '3s' }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gradient-to-r from-[#2196F3] to-[#21CBF3]" />
                  <span className="text-xs text-white">Scale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

PremiumHeroRedesigned.displayName = 'PremiumHeroRedesigned';
