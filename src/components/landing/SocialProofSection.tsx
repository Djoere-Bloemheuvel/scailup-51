
import { memo } from 'react';

const companies = [
  "TechStart", "InnovateCorp", "Scale Solutions", "GrowthCo", "ScaleTech", 
  "B2B Masters", "SaaS Growth", "Digital Boost"
];

export const SocialProofSection = memo(() => {
  return (
    <section className="py-20 bg-[#111111] border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-8">
          <p className="text-[#CCCCCC] text-lg">
            Vertrouwd door snelgroeiende B2B bedrijven
          </p>
          
          {/* Logo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
            {companies.map((company, index) => (
              <div 
                key={index} 
                className="text-[#CCCCCC]/60 text-sm font-medium hover:text-[#CCCCCC] transition-colors duration-300 text-center"
              >
                {company}
              </div>
            ))}
          </div>
          
          {/* Trust Badge */}
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 bg-[#0A0A0A] border border-[#222222] rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[#CCCCCC] text-sm">200+ tevreden klanten sinds 2022</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SocialProofSection.displayName = 'SocialProofSection';
