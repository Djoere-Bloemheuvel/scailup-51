
import React, { memo } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

// Import the premium components
import { PremiumHeader } from "@/components/landing/PremiumHeader";
import { PremiumHero } from "@/components/landing/PremiumHero";

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

// Main landing page component
const Index = memo(() => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#111111] relative overflow-hidden">
      <PremiumHeader />
      
      <main className="relative z-10">
        <PremiumHero />
      </main>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
