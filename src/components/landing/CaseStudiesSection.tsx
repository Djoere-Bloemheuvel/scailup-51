
import React, { memo } from 'react';
import { TrendingUp, Users, Target } from "lucide-react";

const cases = [
  {
    logo: "TechStart",
    company: "TechStart B.V.",
    industry: "SaaS",
    challenge: "Geen consistent leadflow",
    result: {
      appointments: 47,
      pipeline: "€890K",
      period: "60 dagen"
    },
    description: "Van 2 naar 47 gekwalificeerde afspraken per maand door gerichte LinkedIn outreach en AI-gedreven personalisatie.",
    icon: TrendingUp,
    gradient: "from-[#2196F3] to-[#21CBF3]"
  },
  {
    logo: "GrowthCo",
    company: "GrowthCo",
    industry: "Consultancy", 
    challenge: "Te veel tijd in outbound",
    result: {
      appointments: 34,
      pipeline: "€1.2M",
      period: "45 dagen"
    },
    description: "Volledig geautomatiseerde outbound strategie die 25 uur per week bespaart en consistente pipeline opbouwt.",
    icon: Users,
    gradient: "from-purple-500 to-purple-600"
  },
  {
    logo: "InnovateB2B",
    company: "Innovate B2B",
    industry: "Marketing",
    challenge: "Lage conversie rates",
    result: {
      appointments: 29,
      pipeline: "€650K", 
      period: "30 dagen"
    },
    description: "Door hyper-gepersonaliseerde messaging en smart targeting een conversie verbetering van 340%.",
    icon: Target,
    gradient: "from-green-500 to-emerald-500"
  }
];

export const CaseStudiesSection = memo(() => {
  return (
    <section id="cases" className="py-32 bg-[#111111] relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bewezen Resultaten
          </h2>
          <p className="text-xl text-[#CCCCCC] max-w-3xl mx-auto">
            Ontdek hoe wij B2B bedrijven helpen om hun agenda vol te krijgen met ideale klanten.
          </p>
        </div>

        {/* Cases Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {cases.map((caseItem, index) => (
            <div 
              key={index}
              className="group bg-[#111111] border border-[#222222] rounded-3xl p-8 hover:border-[#2196F3]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#2196F3]/10 hover:-translate-y-2"
            >
              {/* Company Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${caseItem.gradient} rounded-xl flex items-center justify-center`}>
                  <caseItem.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{caseItem.company}</h3>
                  <p className="text-sm text-[#CCCCCC]">{caseItem.industry}</p>
                </div>
              </div>

              {/* Challenge */}
              <div className="mb-6">
                <p className="text-sm text-[#2196F3] font-medium mb-2">Uitdaging</p>
                <p className="text-[#CCCCCC] text-sm">{caseItem.challenge}</p>
              </div>

              {/* Results */}
              <div className="bg-[#0A0A0A] rounded-2xl p-6 mb-6">
                <p className="text-sm text-[#2196F3] font-medium mb-4">Resultaten in {caseItem.result.period}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${caseItem.gradient} bg-clip-text text-transparent`}>
                      {caseItem.result.appointments}
                    </div>
                    <div className="text-xs text-[#CCCCCC]">Afspraken</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${caseItem.gradient} bg-clip-text text-transparent`}>
                      {caseItem.result.pipeline}
                    </div>
                    <div className="text-xs text-[#CCCCCC]">Pipeline</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[#CCCCCC] text-sm leading-relaxed">
                {caseItem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

CaseStudiesSection.displayName = 'CaseStudiesSection';
