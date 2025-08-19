
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Zap, TrendingUp, Users, Mail, BarChart3, Brain } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const PremiumHero = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleContactClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PremiumHero: Contact button clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="min-h-screen bg-[#111111] relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        
        {/* Main Hero Content */}
        <div className="text-center space-y-8 mb-20">
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tight">
              AI-Gedreven
              <br />
              <span className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
                Outbound Engine
              </span>
            </h1>
            
            <p className="text-xl text-[#CCCCCC] max-w-2xl mx-auto leading-relaxed">
              Van 10 naar 1000+ leads per maand. Wij automatiseren je complete outbound marketing met geavanceerde AI.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleContactClick}
              className="group bg-[#111111] border border-transparent bg-gradient-to-r from-[#2196F3] to-[#21CBF3] p-[1px] rounded-full hover:shadow-lg hover:shadow-[#2196F3]/25 transition-all duration-300"
            >
              <div className="bg-[#111111] text-white px-8 py-3 rounded-full flex items-center gap-3 group-hover:bg-[#111111]/90 transition-all duration-300">
                Start Gratis Consult
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent mb-2">
              2,847+
            </div>
            <div className="text-[#CCCCCC]">Leads deze maand</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent mb-2">
              94%
            </div>
            <div className="text-[#CCCCCC]">Conversie ratio</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent mb-2">
              €2.3M
            </div>
            <div className="text-[#CCCCCC]">Pipeline waarde</div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Onze AI-Services
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-2xl mx-auto">
            Complete outbound automatisering van strategie tot conversie
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="group relative">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#2196F3]/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#2196F3]/10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Outbound Automation</h3>
              <p className="text-[#CCCCCC] mb-4">
                Complete done-for-you service. Wij nemen je outbound marketing volledig over.
              </p>
              <ul className="space-y-2 text-sm text-[#CCCCCC]">
                <li>• Campagne setup & beheer</li>
                <li>• AI-gegenereerde berichten</li>
                <li>• Multi-channel approach</li>
                <li>• Continue optimalisatie</li>
              </ul>
            </div>
          </div>

          {/* Service 2 */}
          <div className="group relative">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#2196F3]/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#2196F3]/10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lead Engine</h3>
              <p className="text-[#CCCCCC] mb-4">
                Slimme prospectidentificatie. Onze AI vindt en valideert perfecte prospects.
              </p>
              <ul className="space-y-2 text-sm text-[#CCCCCC]">
                <li>• AI-gedreven research</li>
                <li>• Automatische kwalificatie</li>
                <li>• Realtime data verrijking</li>
                <li>• Smart filtering</li>
              </ul>
            </div>
          </div>

          {/* Service 3 */}
          <div className="group relative">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#2196F3]/30 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#2196F3]/10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-xl flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Personalisatie</h3>
              <p className="text-[#CCCCCC] mb-4">
                Hyperpersoonlijke communicatie. Elk bericht afgestemd op de prospect.
              </p>
              <ul className="space-y-2 text-sm text-[#CCCCCC]">
                <li>• Contextbewuste berichten</li>
                <li>• Emotionele intelligentie</li>
                <li>• Timing optimalisatie</li>
                <li>• Culturele aanpassingen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-[#CCCCCC] mb-8">Vertrouwd door innovatieve bedrijven</p>
          
          {/* Company logos placeholder */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-40">
            <div className="flex items-center justify-center h-12 bg-[#222222] rounded-lg">
              <Users className="h-6 w-6 text-[#CCCCCC]" />
            </div>
            <div className="flex items-center justify-center h-12 bg-[#222222] rounded-lg">
              <TrendingUp className="h-6 w-6 text-[#CCCCCC]" />
            </div>
            <div className="flex items-center justify-center h-12 bg-[#222222] rounded-lg">
              <BarChart3 className="h-6 w-6 text-[#CCCCCC]" />
            </div>
            <div className="flex items-center justify-center h-12 bg-[#222222] rounded-lg">
              <Mail className="h-6 w-6 text-[#CCCCCC]" />
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-[#2196F3]/10 to-[#21CBF3]/10 border-t border-[#222222]">
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Klaar voor Exponentiële Groei?
            </h3>
            <p className="text-xl text-[#CCCCCC] mb-8">
              Start vandaag nog met je gratis consult en ontdek je groei potentieel.
            </p>
            
            <Button 
              onClick={handleContactClick}
              className="group bg-[#111111] border border-transparent bg-gradient-to-r from-[#2196F3] to-[#21CBF3] p-[1px] rounded-full hover:shadow-xl hover:shadow-[#2196F3]/30 transition-all duration-300"
            >
              <div className="bg-[#111111] text-white px-10 py-4 rounded-full flex items-center gap-3 group-hover:bg-[#111111]/90 transition-all duration-300">
                Plan Een Gesprek
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Subtle background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2196F3]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#21CBF3]/5 rounded-full blur-3xl" />
    </section>
  );
});

PremiumHero.displayName = 'PremiumHero';
