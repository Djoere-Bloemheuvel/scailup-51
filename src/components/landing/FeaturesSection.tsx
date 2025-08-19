
import React, { memo } from 'react';
import { Zap, Clock, Target } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Slim",
    subtitle: "AI-Gedreven Precisie",
    description: "Onze AI analyseert en optimaliseert elk aspect van je outbound marketing voor maximale effectiviteit."
  },
  {
    icon: Clock,
    title: "Snel", 
    subtitle: "24/7 Operationeel",
    description: "Terwijl jij slaapt, werkt onze AI door aan het genereren van leads en het optimaliseren van campagnes."
  },
  {
    icon: Target,
    title: "Onzichtbaar",
    subtitle: "Naadloze Integratie", 
    description: "Volledig geautomatiseerd proces dat op de achtergrond werkt zonder jouw dagelijkse operaties te verstoren."
  }
];

export const FeaturesSection = memo(() => {
  return (
    <section className="py-32 bg-[#111111] relative">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-[#2196F3]/5 to-[#21CBF3]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Slim. Snel.{' '}
            <span className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
              Onzichtbaar.
            </span>
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-3xl mx-auto">
            Onze AI werkt intelligent, efficiënt en volledig geautomatiseerd om jouw bedrijf te laten groeien.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-10 w-10 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <h4 className="text-lg text-[#2196F3] mb-4 font-medium">
                {feature.subtitle}
              </h4>
              <p className="text-[#CCCCCC] leading-relaxed max-w-sm mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = 'FeaturesSection';
