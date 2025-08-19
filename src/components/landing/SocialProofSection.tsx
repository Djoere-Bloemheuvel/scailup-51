
import { memo } from 'react';

const companies = ["TechStart", "InnovateCorp", "Scale Solutions", "GrowthCo", "ScaleTech"];

export const SocialProofSection = memo(() => {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center space-y-8 animate-fade-in [animation-delay:1.2s]">
        <p className="text-muted-foreground">Meer dan 4.000 bedrijven groeien met ScailUp</p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {companies.map((company, index) => (
            <div key={index} className="text-muted-foreground/60 text-lg font-medium hover:text-muted-foreground transition-colors">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

SocialProofSection.displayName = 'SocialProofSection';
