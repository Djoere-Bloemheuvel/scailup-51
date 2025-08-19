
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

  // Cinematic particle animation
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

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)]
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Create connections between nearby particles
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
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
      {/* Cinematic animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' }}
      />

      {/* Multiple animated gradient overlays for depth */}
      <div className="absolute inset-0 z-10">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse-glow" 
             style={{ animationDelay: '0s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-transparent rounded-full blur-2xl animate-pulse-glow" 
             style={{ animationDelay: '2s', animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse-glow" 
             style={{ animationDelay: '4s', animationDuration: '8s' }} />
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 z-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-blue-400/60 to-purple-400/60 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Scanning lines for sci-fi effect */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-line" />
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-scan-line" 
             style={{ animationDelay: '3s', animationDuration: '6s' }} />
      </div>

      {/* Centered content */}
      <div className="container mx-auto px-6 py-20 relative z-40">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium tracking-wide">WELKOM BIJ SCAILUP</span>
          </div>
          
          {/* Main Heading - Centered */}
          <div className="space-y-6 max-w-4xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-6xl lg:text-8xl font-bold text-white leading-tight">
              WE ARE{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse-glow">
                AI-DRIVEN
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                GROWTH AGENCY
              </span>
            </h1>
            
            {/* Decorative underline */}
            <div className="flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full animate-glow"></div>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Van startup naar scale-up. ScailUp automatiseert je sales, marketing en groeiprocessen 
              met geavanceerde AI-technologie zodat jij je kunt focussen op wat écht belangrijk is.
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              onClick={handleStartClick}
              size="lg" 
              className="group relative gap-3 px-12 py-8 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-500 text-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 animate-energy-pulse"
            >
              <span>START GRATIS</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom section with additional info */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Sales Automation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Lead Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
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
