
import React, { memo } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

// Import all agency-focused components
import { AgencyHeader } from "@/components/landing/AgencyHeader";
import { AgencyHero } from "@/components/landing/AgencyHero";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { CaseStudiesSection } from "@/components/landing/CaseStudiesSection";
import { WhyScailUpSection } from "@/components/landing/WhyScailUpSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { AgencyFooter } from "@/components/landing/AgencyFooter";

// Loading component
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-[#111111]">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#2196F3] mx-auto" />
      <p className="text-[#CCCCCC]">Laden...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Main agency landing page
const Index = memo(() => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#111111] relative overflow-hidden">
      <AgencyHeader />
      
      <main className="relative z-10">
        <AgencyHero />
        <SocialProofSection />
        <ServicesSection />
        <CaseStudiesSection />
        <WhyScailUpSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      
      <AgencyFooter />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
