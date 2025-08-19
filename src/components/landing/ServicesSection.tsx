
import React, { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Linkedin, Mail, Brain, Database } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

const services = [
  {
    icon: Linkedin,
    title: "LinkedIn Outreach",
    description: "Gepersonaliseerde LinkedIn campagnes die je ideale klanten bereiken. Van research tot follow-up, volledig geautomatiseerd.",
    features: ["Smart targeting", "Gepersonaliseerde berichten", "Automated follow-ups"],
    gradient: "from-[#2196F3] to-[#21CBF3]"
  },
  {
    icon: Mail,
    title: "Cold Email Campagnes", 
    description: "Multi-touch email sequences die converteren. Warme leads door slimme personalisatie en perfect getimed berichten.",
    features: ["Multi-sequence campaigns", "A/B testing", "Deliverability optimalisatie"],
    gradient: "from-[#21CBF3] to-[#2196F3]"
  },
  {
    icon: Brain,
    title: "AI SDR (Appointment Setter)",
    description: "Onze AI SDR kwalificeert leads, beantwoordt vragen en plant afspraken in je agenda. 24/7 operationeel.",
    features: ["Lead kwalificatie", "Intelligent gesprekken", "Agenda integratie"],
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: Database,
    title: "Lead Engine",
    description: "Geen lijsten kopen meer. Wij vinden en verifiëren je ideale prospects met 95%+ accuraatheid door AI-gedreven research.",
    features: ["Real-time prospecting", "Data verificatie", "Custom targeting"],
    gradient: "from-green-500 to-emerald-500"
  }
];

export const ServicesSection = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleGetStartedClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ServicesSection: Aan de slag clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <section id="services" className="py-32 bg-[#111111] relative">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#2196F3]/5 to-[#21CBF3]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Onze Outbound Services
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-3xl mx-auto">
            End-to-end outbound marketing - van lead research tot geboekte afspraken. 
            Volledig voor je geregeld, zodat jij je kunt focussen op sluiten.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group bg-[#111111] border border-[#222222] rounded-3xl p-8 hover:border-[#2196F3]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#2196F3]/10 hover:-translate-y-2"
            >
              {/* Icon & Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#21CBF3] transition-colors duration-300">
                  {service.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-[#CCCCCC] leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Features */}
              <div className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#2196F3] to-[#21CBF3] rounded-full"></div>
                    <span className="text-[#CCCCCC] text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={handleGetStartedClick}
            className="group bg-[#111111] border-2 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3]/10 px-10 py-4 text-lg font-medium transition-all duration-300"
          >
            Laten we jouw strategie bespreken
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
});

ServicesSection.displayName = 'ServicesSection';
