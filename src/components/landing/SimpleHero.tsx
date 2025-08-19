
import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import HeroFunctionalities from "../HeroFunctionalities";
import { OnboardingPathsSection } from '@/components/OnboardingPathsSection';
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const SimpleHero = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== SIMPLE HERO START BUTTON CLICKED ===');
    console.log('SimpleHero: Start button clicked - opening rebuilt modal');
    openModal();
    console.log('=== SIMPLE HERO START BUTTON COMPLETED ===');
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== SIMPLE HERO DEMO BUTTON CLICKED ===');
    console.log('SimpleHero: Demo button clicked - opening rebuilt modal');
    openModal();
    console.log('=== SIMPLE HERO DEMO BUTTON COMPLETED ===');
  };

  return (
    <>
      <section className="min-h-screen flex flex-col relative bg-background pt-20">
        {/* Simple background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background"></div>
        
        {/* Hero Content */}
        <div className="flex-1 flex items-center relative z-10">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Schaal je bedrijf{" "}
                  <span className="text-primary">
                    exponentieel
                  </span>{" "}
                  met AI
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Van startup naar scale-up. ScailUp automatiseert je sales, marketing en groeiprocessen zodat jij je kunt focussen op wat écht belangrijk is.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleStartClick} 
                  size="lg" 
                  className="gap-2"
                  type="button"
                >
                  Start Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleDemoClick}
                  variant="outline" 
                  size="lg" 
                  className="gap-2"
                  type="button"
                >
                  <Play className="h-5 w-5" />
                  Bekijk Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HeroFunctionalities Section */}
      <div className="bg-background">
        <HeroFunctionalities />
      </div>

      {/* Onboarding Paths Section */}
      <div data-onboarding-section>
        <OnboardingPathsSection />
      </div>
    </>
  );
});

SimpleHero.displayName = 'SimpleHero';
