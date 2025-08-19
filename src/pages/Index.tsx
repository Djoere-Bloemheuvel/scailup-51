
import React, { memo } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

// Import all new premium components
import { PremiumHeader } from "@/components/landing/PremiumHeader";
import { PremiumHeroRedesigned } from "@/components/landing/PremiumHeroRedesigned";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { PremiumFooter } from "@/components/landing/PremiumFooter";

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

// Main redesigned landing page
const Index = memo(() => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#111111] relative overflow-hidden">
      <PremiumHeader />
      
      <main className="relative z-10">
        <PremiumHeroRedesigned />
        <ServicesSection />
        <ProcessSection />
        <FeaturesSection />
        <FinalCTASection />
      </main>
      
      <PremiumFooter />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
