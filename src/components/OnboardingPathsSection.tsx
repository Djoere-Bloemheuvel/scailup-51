
import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Calendar, MessageCircle, Zap, TrendingUp, Shield, Sparkles, Clock, Target, Rocket } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const OnboardingPathsSection = memo(() => {
  const { openModal } = useConversionModalContext();

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== ONBOARDING PATHS START BUTTON CLICKED ===');
    console.log('OnboardingPathsSection: Start button clicked - opening rebuilt modal');
    openModal();
    console.log('=== ONBOARDING PATHS START BUTTON COMPLETED ===');
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== ONBOARDING PATHS DEMO BUTTON CLICKED ===');
    console.log('OnboardingPathsSection: Demo button clicked - opening rebuilt modal');
    openModal();
    console.log('=== ONBOARDING PATHS DEMO BUTTON COMPLETED ===');
  };

  const handleCallbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== ONBOARDING PATHS CALLBACK BUTTON CLICKED ===');
    console.log('OnboardingPathsSection: Callback button clicked - opening rebuilt modal');
    openModal();
    console.log('=== ONBOARDING PATHS CALLBACK BUTTON COMPLETED ===');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.1)_0%,transparent_50%)]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Klaar om te beginnen?</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Kies je{" "}
            <span className="text-primary">
              startweg
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Van direct beginnen tot eerst even sparren - wij hebben voor elke ondernemer de perfecte start.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Path 1: Direct Start */}
          <Card className="group relative bg-card/40 backdrop-blur-sm border-border/20 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
                    <Rocket className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      Direct starten
                    </h3>
                    <p className="text-muted-foreground">Begin vandaag nog</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">AI-campagne binnen 24 uur actief</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">Dubbele leads in je eerste maand</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">Resultaat binnen 7 dagen</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Setup tijd: 15 minuten</span>
                  </div>
                  <Button 
                    onClick={handleStartClick}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/30 transition-all duration-300 group/btn"
                    type="button"
                  >
                    <span>Start Nu</span>
                    <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Path 2: Demo & Questions */}
          <Card className="group relative bg-card/40 backdrop-blur-sm border-border/20 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 group-hover:scale-110">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                      Demo & Vragen
                    </h3>
                    <p className="text-muted-foreground">Eerst even kijken</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-foreground">Live demo van het platform</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-foreground">Persoonlijke strategie bespreking</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-foreground">Antwoorden op al je vragen</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <div className="flex items-center gap-2 text-emerald-600 mb-4">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Tijd: 20 minuten</span>
                  </div>
                  <Button 
                    onClick={handleDemoClick}
                    variant="outline"
                    className="w-full gap-2 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-600 hover:text-emerald-700 transition-all duration-300 group/btn"
                    type="button"
                  >
                    <span>Bekijk Demo</span>
                    <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Path 3: Personal Consultation */}
          <Card className="group relative bg-card/40 backdrop-blur-sm border-border/20 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-8 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-all duration-300 group-hover:scale-110">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-violet-600 transition-colors">
                      Persoonlijk gesprek
                    </h3>
                    <p className="text-muted-foreground">Maatwerk strategie</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-foreground">Uitgebreide bedrijfsanalyse</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-foreground">Aangepaste groei roadmap</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-violet-600" />
                    </div>
                    <span className="text-foreground">Prioriteiten en planning</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <div className="flex items-center gap-2 text-violet-600 mb-4">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Tijd: 45 minuten</span>
                  </div>
                  <Button 
                    onClick={handleCallbackClick}
                    variant="outline"
                    className="w-full gap-2 border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-500/50 text-violet-600 hover:text-violet-700 transition-all duration-300 group/btn"
                    type="button"
                  >
                    <span>Plan Gesprek</span>
                    <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pt-16 border-t border-border/20">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Nog steeds niet zeker? Geen probleem!
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Laat je gegevens achter en wij bellen je binnen 24 uur voor een vrijblijvend gesprek over jouw groeimogelijkheden.
          </p>
          <Button 
            onClick={handleCallbackClick}
            size="lg"
            variant="outline"
            className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-primary hover:text-primary transition-all duration-300 group"
            type="button"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Bel mij terug</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
});

OnboardingPathsSection.displayName = 'OnboardingPathsSection';
