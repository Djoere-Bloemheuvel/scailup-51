
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const FuturisticHero = memo(() => {
  const { openModal } = useConversionModalContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FuturisticHero: Start button clicked - opening modal');
    openModal();
  }, [openModal]);

  // Cinematic background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    let animationId: number;

    const animate = () => {
      time += 0.005;
      
      // Clear with subtle gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(2, 6, 23, 0.98)');
      gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.95)');
      gradient.addColorStop(1, 'rgba(30, 41, 59, 0.92)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle moving light rays
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < 3; i++) {
        const angle = time * 0.3 + (i * Math.PI * 2 / 3);
        const x1 = centerX + Math.cos(angle) * 200;
        const y1 = centerY + Math.sin(angle) * 100;
        const x2 = centerX + Math.cos(angle) * 800;
        const y2 = centerY + Math.sin(angle) * 400;

        const lightGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        lightGradient.addColorStop(0, `hsla(${220 + i * 30}, 70%, 60%, 0.02)`);
        lightGradient.addColorStop(0.5, `hsla(${220 + i * 30}, 70%, 60%, 0.01)`);
        lightGradient.addColorStop(1, `hsla(${220 + i * 30}, 70%, 60%, 0)`);

        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      {/* Cinematic canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Ultra-subtle gradient overlays for depth */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-950/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/30"></div>
      </div>

      {/* Minimal floating elements */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div 
          className="absolute w-px h-32 bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-float"
          style={{
            left: '20%',
            top: '30%',
            animationDuration: '8s',
            animationDelay: '0s'
          }}
        />
        <div 
          className="absolute w-px h-24 bg-gradient-to-b from-transparent via-purple-400/15 to-transparent animate-float"
          style={{
            right: '25%',
            top: '60%',
            animationDuration: '12s',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Centered content */}
      <div className="container mx-auto px-6 py-20 relative z-40">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl animate-fade-in">
            <Sparkles className="h-4 w-4 text-blue-300/70" />
            <span className="text-blue-200/80 text-sm font-medium tracking-wider">WELKOM BIJ SCAILUP</span>
          </div>
          
          {/* Main Heading */}
          <div className="space-y-8 max-w-5xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h1 className="text-6xl lg:text-8xl font-bold text-white leading-[0.9] tracking-tight">
              WE ARE{" "}
              <span className="block bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
                AI-DRIVEN
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-white to-purple-300 bg-clip-text text-transparent">
                GROWTH AGENCY
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300/80 leading-relaxed max-w-4xl mx-auto font-light animate-fade-in" style={{ animationDelay: '0.6s' }}>
              Van startup naar scale-up. ScailUp automatiseert je sales, marketing en groeiprocessen 
              met geavanceerde AI-technologie zodat jij je kunt focussen op wat écht belangrijk is.
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Button 
              onClick={handleStartClick}
              size="lg" 
              className="group relative gap-4 px-16 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-700 text-xl font-medium hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-[1.02] border-0 rounded-2xl"
            >
              <span className="tracking-wide">START GRATIS</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom minimal info */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in" style={{ animationDelay: '1.2s' }}>
        <div className="flex items-center gap-8 text-gray-400/60 text-sm">
          <span>AI Sales Automation</span>
          <div className="w-1 h-1 bg-gray-400/40 rounded-full"></div>
          <span>Lead Generation</span>
          <div className="w-1 h-1 bg-gray-400/40 rounded-full"></div>
          <span>Marketing Automation</span>
        </div>
      </div>
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
