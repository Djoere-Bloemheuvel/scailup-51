
import React, { memo } from 'react';
import { Search, Target, Zap, TrendingUp } from "lucide-react";

const processSteps = [
  {
    number: "01",
    icon: Search,
    title: "Research & Analyse",
    description: "We analyseren jouw markt, concurrentie en doelgroep om de perfecte strategie te ontwikkelen.",
    color: "from-[#2196F3] to-[#21CBF3]",
    bgColor: "bg-[#2196F3]/10"
  },
  {
    number: "02", 
    icon: Target,
    title: "Targeting & Setup",
    description: "Precisie targeting en complete setup van AI-gedreven campagnes voor optimale resultaten.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10"
  },
  {
    number: "03",
    icon: Zap,
    title: "Automatiseer & Launch",
    description: "Volledige automatisering van je outbound marketing met geavanceerde AI-personalisatie.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10"
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Optimaliseer & Scale",
    description: "Continue optimalisatie en schaling van je campaigns voor exponentiële groei.",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10"
  }
];

export const ProcessSection = memo(() => {
  return (
    <section className="py-32 bg-gradient-to-b from-[#111111] to-[#0A0A0A] relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Van Visie naar Uitvoering
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-3xl mx-auto">
            Ons bewezen proces zorgt voor een naadloze overgang van strategie naar resultaten.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Floating card */}
              <div className={`${step.bgColor} backdrop-blur-sm border border-[#222222] rounded-3xl p-8 hover:border-opacity-50 transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl`}>
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                    {step.number}
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-[#CCCCCC] text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Connection line (except for last item) */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[#222222] to-transparent transform -translate-y-1/2" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ProcessSection.displayName = 'ProcessSection';
