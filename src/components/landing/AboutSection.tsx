
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target, Rocket } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const AboutSection = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleGetStartedClick = () => {
    console.log('AboutSection: Get Started button clicked - opening modal');
    openModal();
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - 3D Illustration Area */}
          <div className="relative">
            {/* 3D-style illustration placeholder */}
            <div className="relative w-full h-96 flex items-center justify-center">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
              
              {/* 3D Robot/AI illustration mockup */}
              <div className="relative z-10 flex flex-col items-center space-y-4">
                {/* Robot head */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <Sparkles className="h-12 w-12 text-white animate-pulse" />
                </div>
                
                {/* Floating elements */}
                <div className="flex space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-xl transform -rotate-12 animate-float">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div className="w-20 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-xl transform rotate-6">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-xl transform rotate-12 animate-float" style={{ animationDelay: '1s' }}>
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                {/* Speech bubble */}
                <div className="relative mt-8">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl">
                    <p className="text-blue-200 text-sm font-medium">HELLO</p>
                  </div>
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white/10 border-l border-b border-white/20 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <Rocket className="h-4 w-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium tracking-wide">ABOUT US</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                We Bring{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI-Driven
                </span>{" "}
                Growth
                <br />
                To Life.
              </h2>
              
              {/* Decorative underline */}
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              
              <p className="text-lg text-gray-300 leading-relaxed">
                Bij ScailUp combineren we geavanceerde AI-technologie met bewezen groeistrategieën. 
                Onze missie is om bedrijven te helpen exponentieel groeien door slim gebruik van 
                automatisering en data-gedreven inzichten.
              </p>
            </div>
            
            {/* Features List */}
            <div className="space-y-4">
              {[
                "AI-gedreven lead generatie en kwalificatie",
                "Geautomatiseerde sales & marketing workflows", 
                "Realtime analytics en performance tracking",
                "Persoonlijke begeleiding en strategisch advies"
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">{feature}</p>
                </div>
              ))}
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={handleGetStartedClick}
              size="lg" 
              className="gap-3 px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 text-lg font-semibold group"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export { AboutSection };
