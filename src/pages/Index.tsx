
import React, { Suspense, lazy, memo } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

// Lazy load components with correct syntax for named exports
const EnhancedHeader = lazy(() => import("@/components/landing/EnhancedHeader").then(module => ({ default: module.EnhancedHeader })));
const OptimizedHero = lazy(() => import("@/components/landing/OptimizedHero").then(module => ({ default: module.OptimizedHero })));
const SocialProofSection = lazy(() => import("@/components/landing/SocialProofSection").then(module => ({ default: module.SocialProofSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/TestimonialsSection").then(module => ({ default: module.TestimonialsSection })));
const FinalCTASection = lazy(() => import("@/components/landing/FinalCTASection").then(module => ({ default: module.FinalCTASection })));

// Loading component
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="text-muted-foreground">Laden...</p>
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Suspense fallback={<LoadingSpinner />}>
        <EnhancedHeader />
      </Suspense>
      
      <main className="relative z-10">
        <Suspense fallback={<LoadingSpinner />}>
          <OptimizedHero />
        </Suspense>
        
        <div className="bg-background">
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
