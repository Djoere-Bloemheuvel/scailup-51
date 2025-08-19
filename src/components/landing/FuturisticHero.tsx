
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const FuturisticHero = memo(() => {
  const { openModal } = useConversionModalContext();

  const handlePlanGesprekClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('FuturisticHero: Plan een gesprek button clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="min-h-screen bg-black relative overflow-hidden">
      {/* Apple-style navigation banner */}
      <div className="relative z-20 bg-black/95 backdrop-blur-xl border-b border-gray-800/30">
        <div className="max-w-6xl mx-auto px-6 py-3 text-center">
          <p className="text-sm text-gray-300">
            AI-gedreven groei voor ambitieuze bedrijven. <a href="#" className="text-blue-400 hover:text-blue-300">Ontdek meer →</a>
          </p>
        </div>
      </div>

      {/* Main hero content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32">
        
        {/* Pre-title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 tracking-tight">
            SCAILUP
          </h2>
        </div>
        
        {/* Main headline with Apple-style glow effect */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white leading-tight tracking-tight mb-6">
            Gebouwd voor{' '}
            <span 
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
              }}
            >
              AI Intelligence
            </span>
            .
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 font-light leading-relaxed max-w-4xl mx-auto">
            Persoonlijk, privé, krachtig.
          </p>
        </div>

        {/* Apple-style product showcase */}
        <div className="relative mt-20 mb-16">
          {/* Glow effect behind the mockup */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-600/30 to-purple-600/20 blur-3xl scale-150"
            style={{ transform: 'translateY(20%)' }}
          />
          
          {/* Dashboard mockup container */}
          <div className="relative z-10 perspective-1000">
            <div 
              className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl transform hover:scale-[1.02] transition-transform duration-700"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(31, 41, 55, 0.8) 100%)',
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.8),
                  0 0 0 1px rgba(59, 130, 246, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }}
            >
              {/* Browser-like header */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-700/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500/70 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500/70 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500/70 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-gray-800/50 rounded-lg px-4 py-1 text-sm text-gray-400 inline-block">
                    dashboard.scailup.ai
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Leads Generated', value: '2,847', change: '+23%', color: 'from-blue-500 to-cyan-400' },
                    { label: 'Conversion Rate', value: '18.5%', change: '+5.2%', color: 'from-green-500 to-emerald-400' },
                    { label: 'Revenue Growth', value: '€127K', change: '+31%', color: 'from-purple-500 to-pink-400' },
                    { label: 'AI Efficiency', value: '94.2%', change: '+12%', color: 'from-orange-500 to-red-400' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                      <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                      <div className="text-lg font-semibold text-white mb-1">{stat.value}</div>
                      <div className={`text-xs bg-gradient-to-r ${stat.color} bg-clip-text text-transparent font-medium`}>
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart area placeholder */}
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">AI Performance Analytics</h3>
                    <div className="flex gap-2">
                      {['7D', '30D', '90D'].map((period) => (
                        <button key={period} className="px-3 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-lg">
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg flex items-end justify-center">
                    <div className="text-gray-400 text-sm">Real-time AI insights</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            onClick={handlePlanGesprekClick}
            size="lg"
            className="group bg-blue-600 hover:bg-blue-700 text-white border-0 px-12 py-4 text-lg font-medium rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-[1.02]"
          >
            Plan een gesprek
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          
          <p className="text-gray-400 text-sm mt-6">
            Gratis 30-minuten strategiesessie • Geen verplichtingen
          </p>
        </div>

      </div>

      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top gradient */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-900/10 via-purple-900/5 to-transparent" />
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
      </div>
    </section>
  );
});

FuturisticHero.displayName = 'FuturisticHero';

export { FuturisticHero };
