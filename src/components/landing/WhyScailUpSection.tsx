
import React, { memo } from 'react';
import { CheckCircle, Brain, BarChart3 } from "lucide-react";

const benefits = [
  {
    icon: CheckCircle,
    title: "End-to-end gedaan voor jou",
    description: "Van strategie tot uitvoering - wij regelen alles. Jij hoeft alleen maar de afspraken in je agenda in te plannen.",
    gradient: "from-[#2196F3] to-[#21CBF3]"
  },
  {
    icon: Brain,
    title: "AI-ondersteund, menselijk opgevolgd",
    description: "Geavanceerde AI voor personalisatie en targeting, gecombineerd met persoonlijke begeleiding en optimalisatie.",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: BarChart3,
    title: "Transparante resultaten & reporting",
    description: "Real-time inzicht in je campagne performance, open rates, response rates en pipeline ontwikkeling.",
    gradient: "from-green-500 to-emerald-500"
  }
];

export const WhyScailUpSection = memo(() => {
  return (
    <section className="py-32 bg-gradient-to-b from-[#111111] to-[#0A0A0A] relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Waarom kiezen voor{' '}
            <span className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] bg-clip-text text-transparent">
              ScailUp?
            </span>
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-3xl mx-auto">
            Wij zijn geen SaaS tool die je zelf moet uitzoeken. Wij zijn je outbound partner die alles voor je regelt.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              {/* Icon */}
              <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className="h-10 w-10 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4">
                {benefit.title}
              </h3>
              <p className="text-[#CCCCCC] leading-relaxed max-w-sm mx-auto">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 bg-[#111111]/50 backdrop-blur-sm rounded-2xl px-8 py-6 border border-[#222222]">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[#CCCCCC] text-sm">Gemiddeld 6 weken tot eerste resultaten</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-[#222222]"></div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#2196F3] rounded-full animate-pulse"></div>
              <span className="text-[#CCCCCC] text-sm">Maandelijks opzegbaar contract</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-[#222222]"></div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-[#CCCCCC] text-sm">Persoonlijke account manager</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

WhyScailUpSection.displayName = 'WhyScailUpSection';
