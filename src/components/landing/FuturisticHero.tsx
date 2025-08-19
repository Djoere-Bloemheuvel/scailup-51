
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

  // Subtle abstract animation
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

    const orbs: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;
    }> = [];

    // Create gentle floating orbs
    for (let i = 0; i < 40; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 80 + 20,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.15 + 0.05,
        hue: Math.random() * 60 + 200 // Blue to purple range
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(orb => {
        orb.x += orb.speedX;
        orb.y += orb.speedY;

        // Gentle boundary behavior
        if (orb.x < -orb.size || orb.x > canvas.width + orb.size) orb.speedX *= -1;
        if (orb.y < -orb.size || orb.y > canvas.height + orb.size) orb.speedY *= -1;

        // Create gradient orb
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        gradient.addColorStop(0, `hsla(${orb.hue}, 70%, 60%, ${orb.opacity})`);
        gradient.addColorStop(0.7, `hsla(${orb.hue}, 70%, 60%, ${orb.opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${orb.hue}, 70%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950">
      {/* Subtle animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' }}
      />

      {/* Soft gradient overlays */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/8 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-br from-purple-500/6 to-transparent rounded-full blur-2xl animate-pulse" 
             style={{ animationDelay: '3s', animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/4 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '6s', animationDuration: '10s' }} />
      </div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0 z-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Centered content */}
      <div className="container mx-auto px-6 py-20 relative z-40">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-blue-400/70" />
            <span className="text-blue-300/80 text-sm font-medium tracking-wide">WELKOM BIJ SCAILUP</span>
          </div>
          
          {/* Main Heading - Centered */}
          <div className="space-y-6 max-w-4xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
              WE ARE{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                AI-DRIVEN
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                GROWTH AGENCY
              </span>
            </h1>
            
            {/* Decorative underline */}
            <div className="flex justify-center">
              <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-emerald-500/50 rounded-full"></div>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-300/90 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Van startup naar scale-up. ScailUp automatiseert je sales, marketing en groeiprocessen 
              met geavanceerde AI-technologie zodat jij je kunt focussen op wat écht belangrijk is.
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              onClick={handleStartClick}
              size="lg" 
              className="group relative gap-3 px-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-500 text-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 border-0"
            >
              <span>START GRATIS</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom section with additional info */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <div className="flex flex-col items-center gap-4 text-gray-400/80">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-pulse"></div>
              <span>AI Sales Automation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Lead Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Marketing Automation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
