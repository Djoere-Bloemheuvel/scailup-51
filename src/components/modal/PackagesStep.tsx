
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Rocket, Crown } from "lucide-react";

export const PackagesStep: React.FC = () => {
  const packages = [
    {
      name: "Starter",
      icon: Zap,
      price: "€49",
      period: "eenmalig",
      description: "Perfect voor bedrijven die net beginnen met leadgeneratie",
      features: [
        "1000 leads binnen 24 uur",
        "AI-campagne setup",
        "Basis analytics",
        "Email support"
      ],
      popular: false,
      ctaText: "Start met Starter",
      checkoutUrl: "#" // Replace with actual Stripe checkout URL
    },
    {
      name: "Professional",
      icon: Rocket,
      price: "€149",
      period: "per maand",
      description: "Ideaal voor groeiende bedrijven die serieus willen schalen",
      features: [
        "5000 leads per maand",
        "Geavanceerde AI-campagnes",
        "Uitgebreide analytics",
        "Priority support",
        "LinkedIn integratie",
        "A/B testing"
      ],
      popular: true,
      ctaText: "Start met Professional",
      checkoutUrl: "#" // Replace with actual Stripe checkout URL
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "€399",
      period: "per maand",
      description: "Voor bedrijven die maximale groei en controle willen",
      features: [
        "Onbeperkte leads",
        "Custom AI-training",
        "Dedicated account manager",
        "24/7 support",
        "Custom integraties",
        "White-label optie"
      ],
      popular: false,
      ctaText: "Start met Enterprise",
      checkoutUrl: "#" // Replace with actual Stripe checkout URL
    }
  ];

  const handleCheckout = (checkoutUrl: string, packageName: string) => {
    console.log(`Starting checkout for ${packageName}`);
    // Replace with actual Stripe checkout logic
    window.open(checkoutUrl, '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Kies het pakket dat bij je past
        </h2>
        <p className="text-muted-foreground">
          Van starter tot enterprise - begin vandaag nog met groei
        </p>
      </div>

      <div className="grid gap-6 max-h-[60vh] overflow-y-auto">
        {packages.map((pkg, index) => (
          <Card 
            key={pkg.name} 
            className={`relative ${pkg.popular ? 'border-primary shadow-lg' : 'border-border'} transition-all duration-300 hover:shadow-xl`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Meest populair
                </div>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${pkg.popular ? 'bg-primary/10' : 'bg-muted/50'}`}>
                  <pkg.icon className={`h-6 w-6 ${pkg.popular ? 'text-primary' : 'text-foreground'}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">/{pkg.period}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{pkg.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3 mb-4">
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => handleCheckout(pkg.checkoutUrl, pkg.name)}
                className={`w-full ${pkg.popular ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'}`}
                variant={pkg.popular ? "default" : "secondary"}
              >
                {pkg.ctaText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
