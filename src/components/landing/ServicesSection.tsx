
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Database, Brain, Users } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const services = [
  {
    icon: Zap,
    title: "AI Automations",
    description: "Complete outbound marketing automation. Van lead generatie tot conversie - volledig AI-gedreven.",
    gradient: "from-[#2196F3] to-[#21CBF3]"
  },
  {
    icon: Database,
    title: "Lead Generation",
    description: "Slimme prospectidentificatie en -kwalificatie. Onze AI vindt de perfecte prospects voor jouw bedrijf.",
    gradient: "from-[#21CBF3] to-[#2196F3]"
  },
  {
    icon: Brain,
    title: "Custom AI SaaS",
    description: "Op maat gemaakte AI-oplossingen die perfect aansluiten bij jouw bedrijfsprocessen en doelen.",
    gradient: "from-[#2196F3] to-[#21CBF3]"
  },
  {
    icon: Users,
    title: "Consultancy",
    description: "Strategische begeleiding en expertise om jouw AI-gedreven groei te maximaliseren en optimaliseren.",
    gradient: "from-[#21CBF3] to-[#2196F3]"
  }
];

export const ServicesSection = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleLearnMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ServicesSection: Learn more clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section className="py-32 bg-[#111111] relative">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#2196F3]/5 to-[#21CBF3]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What ScailUp Delivers
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-3xl mx-auto">
            Van AI-gedreven automatisering tot strategische consultancy - 
            wij leveren complete oplossingen voor exponentiële groei.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#2196F3]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#2196F3]/10 hover:-translate-y-2"
            >
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#21CBF3] transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-[#CCCCCC] text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={handleLearnMoreClick}
            className="group bg-[#111111] border-2 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3]/10 px-8 py-4 text-lg font-medium transition-all duration-300"
          >
            Ontdek Alle Services
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';
