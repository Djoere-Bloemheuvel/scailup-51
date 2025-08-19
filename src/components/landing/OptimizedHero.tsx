
import React, { memo, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { OptimizedDashboardMockup } from "./OptimizedDashboardMockup";
import HeroFunctionalities from "../HeroFunctionalities";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

// Pre-calculated particle positions for performance
const PARTICLE_POSITIONS = [
  { left: '20%', top: '25%', delay: '0s', duration: '6s' },
  { left: '35%', top: '15%', delay: '1s', duration: '8s' },
  { left: '50%', top: '30%', delay: '2s', duration: '7s' },
  { left: '65%', top: '20%', delay: '3s', duration: '9s' },
  { left: '80%', top: '35%', delay: '4s', duration: '5s' },
  { left: '25%', top: '45%', delay: '5s', duration: '10s' },
  { left: '40%', top: '55%', delay: '6s', duration: '7s' },
  { left: '55%', top: '40%', delay: '7s', duration: '8s' },
  { left: '70%', top: '50%', delay: '8s', duration: '6s' },
  { left: '85%', top: '60%', delay: '9s', duration: '9s' },
  { left: '30%', top: '70%', delay: '10s', duration: '7s' },
  { left: '45%', top: '80%', delay: '11s', duration: '8s' },
  { left: '60%', top: '75%', delay: '12s', duration: '6s' },
  { left: '75%', top: '85%', delay: '13s', duration: '9s' },
  { left: '90%', top: '90%', delay: '14s', duration: '7s' }
];

// Pre-calculated stream positions for performance
const STREAM_POSITIONS = [
  { left: '15%', delay: '0s', duration: '8s' },
  { left: '25%', delay: '1s', duration: '10s' },
  { left: '35%', delay: '2s', duration: '7s' },
  { left: '45%', delay: '3s', duration: '9s' },
  { left: '55%', delay: '4s', duration: '6s' },
  { left: '65%', delay: '5s', duration: '8s' },
  { left: '75%', delay: '6s', duration: '10s' },
  { left: '85%', delay: '7s', duration: '7s' }
];

// Memoized particle component
const TechParticle = memo(({ position }: { position: typeof PARTICLE_POSITIONS[0] }) => (
  <div 
    className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float" 
    style={{
      left: position.left,
      top: position.top,
      animationDelay: position.delay,
      animationDuration: position.duration
    }} 
  />
));

TechParticle.displayName = 'TechParticle';

// Memoized stream component
const DataStream = memo(({ position }: { position: typeof STREAM_POSITIONS[0] }) => (
  <div 
    className="absolute w-px h-16 bg-gradient-to-b from-transparent via-primary/25 to-transparent animate-data-flow" 
    style={{
      left: position.left,
      animationDelay: position.delay,
      animationDuration: position.duration
    }} 
  />
));

DataStream.displayName = 'DataStream';

// Memoized background effects component
const BackgroundEffects = memo(() => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Base gradient mesh with CSS custom properties for Lovable compatibility */}
    <div 
      className="absolute inset-0 opacity-30"
      style={{
        '--gradient-1': 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
        '--gradient-2': 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 60%)',
        '--gradient-3': 'radial-gradient(circle at 60% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
        '--gradient-4': 'radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.08) 0%, transparent 50%)',
        background: 'var(--gradient-1), var(--gradient-2), var(--gradient-3), var(--gradient-4)'
      } as React.CSSProperties}
    />
    
    {/* High-tech grid pattern with CSS custom properties */}
    <div 
      className="absolute inset-0 opacity-10"
      style={{
        '--grid-color': 'rgba(59, 130, 246, 0.2)',
        '--grid-size': '80px',
        backgroundImage: `
          linear-gradient(90deg, var(--grid-color) 1px, transparent 1px),
          linear-gradient(0deg, var(--grid-color) 1px, transparent 1px)
        `,
        backgroundSize: 'var(--grid-size) var(--grid-size)'
      } as React.CSSProperties}
    />

    {/* Tech circuit lines - optimized SVG */}
    <div className="absolute inset-0">
      <svg className="w-full h-full opacity-15" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="circuitGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4"/>
            <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="circuitGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(236, 72, 153)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4"/>
          </linearGradient>
        </defs>
        
        {/* Horizontal circuit lines */}
        <path d="M0,200 L200,200 L220,180 L300,180 L320,200 L500,200 L520,220 L600,220 L1000,220" 
              stroke="url(#circuitGradient1)" strokeWidth="2" fill="none" className="animate-pulse [animation-duration:4s]"/>
        <path d="M0,400 L150,400 L170,380 L250,380 L270,400 L450,400 L470,420 L650,420 L1000,420" 
              stroke="url(#circuitGradient2)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:6s] [animation-delay:1s]"/>
        <path d="M0,600 L180,600 L200,580 L350,580 L370,600 L550,600 L570,620 L750,620 L1000,620" 
              stroke="url(#circuitGradient1)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:5s] [animation-delay:2s]"/>
        
        {/* Vertical circuit lines */}
        <path d="M200,0 L200,150 L220,170 L220,250 L200,270 L200,400 L180,420 L180,500 L200,520 L200,1000" 
              stroke="url(#circuitGradient2)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:7s] [animation-delay:0.5s]"/>
        <path d="M500,0 L500,120 L520,140 L520,280 L500,300 L500,450 L480,470 L480,600 L500,620 L500,1000" 
              stroke="url(#circuitGradient1)" strokeWidth="2" fill="none" className="animate-pulse [animation-duration:8s] [animation-delay:1.5s]"/>
        <path d="M800,0 L800,180 L820,200 L820,320 L800,340 L800,500 L780,520 L780,650 L800,670 L800,1000" 
              stroke="url(#circuitGradient2)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:6s] [animation-delay:3s]"/>
        
        {/* Circuit nodes */}
        <circle cx="220" cy="180" r="4" fill="rgb(59, 130, 246)" className="animate-pulse [animation-duration:3s]"/>
        <circle cx="520" cy="140" r="3" fill="rgb(139, 92, 246)" className="animate-pulse [animation-duration:4s] [animation-delay:1s]"/>
        <circle cx="470" cy="420" r="3" fill="rgb(16, 185, 129)" className="animate-pulse [animation-duration:5s] [animation-delay:2s]"/>
        <circle cx="820" cy="200" r="4" fill="rgb(236, 72, 153)" className="animate-pulse [animation-duration:3.5s] [animation-delay:0.5s]"/>
      </svg>
    </div>

    {/* Floating tech elements - optimized with memoization */}
    <div className="absolute inset-0">
      {/* Large glowing spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/8 to-purple-500/8 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-500/6 to-blue-500/8 rounded-full blur-2xl animate-pulse-glow [animation-delay:2s]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-violet-500/5 to-pink-500/7 rounded-full blur-xl animate-pulse-glow [animation-delay:4s]" />
      
      {/* Tech particles - memoized for performance */}
      {PARTICLE_POSITIONS.map((position, i) => (
        <TechParticle key={i} position={position} />
      ))}
    </div>

    {/* Data stream effect - memoized for performance */}
    <div className="absolute inset-0">
      {STREAM_POSITIONS.map((position, i) => (
        <DataStream key={i} position={position} />
      ))}
    </div>
  </div>
));

BackgroundEffects.displayName = 'BackgroundEffects';

// Memoized hero content component
const HeroContent = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleStartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('OptimizedHero: Start button clicked - opening modal');
    openModal();
  }, [openModal]);

  const handleDemoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('OptimizedHero: Demo button clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <div className="flex-1 flex items-center relative z-10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
                Schaal je bedrijf{" "}
                <span className="text-blue-400">
                  exponentieel
                </span>{" "}
                met AI
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed animate-fade-in [animation-delay:0.2s]">
                Van startup naar scale-up. ScailUp automatiseert je sales, marketing en groeiprocessen zodat jij je kunt focussen op wat écht belangrijk is.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:0.4s]">
              <Button 
                onClick={handleStartClick}
                size="lg" 
                className="group relative gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/30 animate-glow text-white border-0 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50"
                type="button"
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-blue-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                <div className="absolute inset-[1px] rounded-lg bg-gradient-to-r from-primary to-blue-500" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-2">
                  <span className="font-semibold">Start Gratis</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </div>
                
                {/* Particle effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                  <div className="absolute top-1/3 left-1/3 w-0.5 h-0.5 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute top-2/3 right-1/3 w-0.5 h-0.5 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                </div>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="group relative gap-2 border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white backdrop-blur-sm overflow-hidden transition-all duration-500 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
                onClick={handleDemoClick}
                type="button"
              >
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center gap-2">
                  <Play className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <span className="font-medium">Bekijk Demo</span>
                </div>
                
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              </Button>
            </div>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className="animate-fade-in [animation-delay:0.6s] relative">
            <div className="relative">
              {/* Glow effect behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-purple-500/15 blur-2xl transform scale-110" />
              <OptimizedDashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

HeroContent.displayName = 'HeroContent';

// Main optimized hero component
export const OptimizedHero = memo(() => {
  return (
    <section className="min-h-screen flex flex-col relative bg-gradient-to-br from-gray-950 via-gray-900 to-black pt-32">
      <BackgroundEffects />
      <HeroContent />
      
      {/* HeroFunctionalities Section */}
      <div className="-mt-8 pb-16 animate-fade-in [animation-delay:0.8s] relative z-10">
        <HeroFunctionalities />
      </div>
    </section>
  );
});

OptimizedHero.displayName = 'OptimizedHero';
