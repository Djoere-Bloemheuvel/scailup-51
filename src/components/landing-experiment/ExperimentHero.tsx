
import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Database, Mail, Linkedin, Sparkles, Bot } from "lucide-react";
import { OptimizedDashboardMockup } from "../landing/OptimizedDashboardMockup";
import HeroFunctionalities from "../HeroFunctionalities";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const ExperimentHero = memo(() => {
  const { openModal } = useConversionModalContext();

  const features = [
    {
      id: "database",
      title: "Lead Database",
      icon: Database,
      anchor: "#lead-database",
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "email",
      title: "Email Outreach",
      subtitle: "powered by Sarah AI",
      icon: Mail,
      anchor: "#email-outreach",
      color: "from-green-500 to-green-600"
    },
    {
      id: "linkedin",
      title: "LinkedIn Outreach",
      subtitle: "powered by Sarah AI",
      icon: Linkedin,
      anchor: "#linkedin-outreach",
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "personalization",
      title: "AI Personalisatie",
      icon: Sparkles,
      anchor: "#ai-personalisatie",
      color: "from-pink-500 to-pink-600"
    },
    {
      id: "automation",
      title: "Sales Automation",
      icon: Bot,
      anchor: "#sales-automation",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  const handleFeatureClick = (anchor: string) => {
    const element = document.querySelector(anchor);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const handleStartClick = () => {
    console.log('ExperimentHero: Start button clicked - opening modal');
    openModal();
  };

  const handleDemoClick = () => {
    console.log('ExperimentHero: Demo button clicked - opening modal');
    openModal();
  };

  return (
    <>
      {/* Combined Hero Section with AI/Tech Background */}
      <section className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 pt-20">
        {/* Enhanced AI/Tech Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient mesh with lighter tones */}
          <div className="absolute inset-0 opacity-40" style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 60%),
              radial-gradient(circle at 60% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 60%),
              radial-gradient(circle at 30% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)
            `
          }} />
          
          {/* High-tech grid pattern */}
          <div className="absolute inset-0 opacity-15" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
              linear-gradient(0deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }} />

          {/* Tech circuit lines */}
          <div className="absolute inset-0">
            <svg className="w-full h-full opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <defs>
                <linearGradient id="circuitGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.4"/>
                </linearGradient>
                <linearGradient id="circuitGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(236, 72, 153)" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal circuit lines */}
              <path d="M0,200 L200,200 L220,180 L300,180 L320,200 L500,200 L520,220 L600,220 L1000,220" 
                    stroke="url(#circuitGradient1)" strokeWidth="2" fill="none" className="animate-pulse [animation-duration:4s]"/>
              <path d="M0,400 L150,400 L170,380 L250,380 L270,400 L450,400 L470,420 L650,420 L1000,420" 
                    stroke="url(#circuitGradient2)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:6s] [animation-delay:1s]"/>
              <path d="M0,600 L180,600 L200,580 L350,580 L370,600 L550,600 L570,620 L750,620 L1000,620" 
                    stroke="url(#circuitGradient1)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:5s] [animation-delay:2s]"/>
              
              {/* Vertical circuit lines */}
              <path d="M200,0 L200,150 L220,170 L220,250 L200,270 L200,400 L180,420 L180,500 L200,520 L200,1000" 
                    stroke="url(#circuitGradient2)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:7s] [animation-delay:0.5s]"/>
              <path d="M500,0 L500,120 L520,140 L520,280 L500,300 L500,450 L480,470 L480,600 L500,620 L500,1000" 
                    stroke="url(#circuitGradient1)" strokeWidth="2" fill="none" className="animate-pulse [animation-duration:8s] [animation-delay:1.5s]"/>
              <path d="M800,0 L800,180 L820,200 L820,320 L800,340 L800,500 L780,520 L780,650 L800,670 L800,1000" 
                    stroke="url(#circuitGradient2)" strokeWidth="1.5" fill="none" className="animate-pulse [animation-duration:6s] [animation-delay:3s]"/>
              
              {/* Circuit nodes */}
              <circle cx="220" cy="180" r="4" fill="rgb(59, 130, 246)" className="animate-pulse [animation-duration:3s]"/>
              <circle cx="520" cy="140" r="3" fill="rgb(139, 92, 246)" className="animate-pulse [animation-duration:4s] [animation-delay:1s]"/>
              <circle cx="470" cy="420" r="3" fill="rgb(16, 185, 129)" className="animate-pulse [animation-duration:5s] [animation-delay:2s]"/>
              <circle cx="820" cy="200" r="4" fill="rgb(236, 72, 153)" className="animate-pulse [animation-duration:3.5s] [animation-delay:0.5s]"/>
            </svg>
          </div>

          {/* Floating tech elements */}
          <div className="absolute inset-0">
            {/* Large glowing spheres */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/15 to-purple-500/15 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-500/10 to-blue-500/15 rounded-full blur-2xl animate-pulse-glow [animation-delay:2s]" />
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-violet-500/8 to-pink-500/12 rounded-full blur-xl animate-pulse-glow [animation-delay:4s]" />
            
            {/* Tech particles */}
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-1 h-1 bg-primary/60 rounded-full animate-float" 
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${4 + Math.random() * 6}s`
                }} 
              />
            ))}
          </div>

          {/* Data stream effect */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div 
                key={`stream-${i}`}
                className="absolute w-px h-16 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-data-flow" 
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${6 + Math.random() * 4}s`
                }} 
              />
            ))}
          </div>
        </div>
        
        {/* Hero Content Container */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="container mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
              {/* Left Column - Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-6">
                  <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
                    Schaal je bedrijf{" "}
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                      exponentieel
                    </span>{" "}
                    met AI
                  </h2>
                  <p className="text-xl text-blue-100/90 leading-relaxed animate-fade-in [animation-delay:0.2s]">
                    Van startup naar scale-up. ScailUp automatiseert je sales, marketing en groeiprocessen zodat jij je kunt focussen op wat écht belangrijk is.
                  </p>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in [animation-delay:0.4s]">
                  <Button 
                    onClick={handleStartClick}
                    size="lg" 
                    className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/30 animate-glow text-white border-0"
                  >
                    Start Gratis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={handleDemoClick}
                    variant="outline" 
                    size="lg" 
                    className="gap-2 border-blue-300/30 hover:bg-blue-500/10 text-blue-100 hover:text-white backdrop-blur-sm"
                  >
                    <Play className="h-5 w-5" />
                    Bekijk Demo
                  </Button>
                </div>
              </div>

              {/* Right Column - Dashboard Mockup */}
              <div className="animate-fade-in [animation-delay:0.6s] relative">
                <div className="relative">
                  {/* Glow effect behind mockup */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-2xl transform scale-110" />
                  <OptimizedDashboardMockup />
                </div>
              </div>
            </div>

            {/* Feature Navigation integrated into hero */}
            <div className="animate-fade-in [animation-delay:0.8s]">
              <div className="w-full max-w-6xl mx-auto">
                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-5 gap-4">
                  {features.map((feature) => (
                    <Button
                      key={feature.id}
                      variant="outline"
                      onClick={() => handleFeatureClick(feature.anchor)}
                      className="group relative h-auto p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg transition-transform group-hover:scale-110`}>
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold block text-white">{feature.title}</span>
                          {feature.subtitle && (
                            <span className="text-xs text-blue-200/70 italic block mt-0.5">
                              {feature.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                    </Button>
                  ))}
                </div>

                {/* Mobile Horizontal Scroll */}
                <div className="md:hidden">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex space-x-4 p-1">
                      {features.map((feature) => (
                        <Button
                          key={feature.id}
                          variant="outline"
                          onClick={() => handleFeatureClick(feature.anchor)}
                          className="group relative flex-shrink-0 h-auto p-4 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 min-w-[140px]"
                        >
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 text-white shadow-lg transition-transform group-hover:scale-110`}>
                              <feature.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold block text-white leading-tight">{feature.title}</span>
                              {feature.subtitle && (
                                <span className="text-xs text-blue-200/70 italic block mt-0.5 leading-tight">
                                  {feature.subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                        </Button>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="invisible" />
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HeroFunctionalities section directly connected */}
      <div className="bg-background relative z-10">
        <div id="lead-database" className="scroll-mt-20">
          <HeroFunctionalities />
        </div>
      </div>
    </>
  );
});

ExperimentHero.displayName = 'ExperimentHero';
