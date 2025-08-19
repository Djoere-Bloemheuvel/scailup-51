
import React, { Suspense, lazy, memo } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

// Import the new components directly
import { ProfessionalHeader } from "@/components/landing/ProfessionalHeader";
import { FuturisticHero } from "@/components/landing/FuturisticHero";
import { AboutSection } from "@/components/landing/AboutSection";

// Lazy load remaining components
const SocialProofSection = lazy(() => import("@/components/landing/SocialProofSection").then(module => ({ default: module.SocialProofSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(module => ({ default: module.TestimonialsSection })));
const FinalCTASection = lazy(() => import("@/components/landing/FinalCTASection").then(module => ({ default: module.FinalCTASection })));

// Loading component
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
      <p className="text-gray-400">Laden...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Main landing page component
const Index = memo(() => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <ProfessionalHeader />
      
      <main className="relative z-10">
        <FuturisticHero />
        <AboutSection />
        
        <div className="bg-gray-950">
          <Suspense fallback={<LoadingSpinner />}>
            <SocialProofSection />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <TestimonialsSection />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <FinalCTASection />
          </Suspense>
        </div>
      </main>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
