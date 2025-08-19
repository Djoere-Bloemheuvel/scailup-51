
import React, { memo } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

// Import the hero components
import { ProfessionalHeader } from "@/components/landing/ProfessionalHeader";
import { FuturisticHero } from "@/components/landing/FuturisticHero";

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
      </main>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
