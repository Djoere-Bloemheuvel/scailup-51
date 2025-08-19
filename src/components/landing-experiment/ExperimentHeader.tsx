
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';
import { 
  ArrowRight, 
  Sparkles, 
  LogIn, 
  Menu, 
  X, 
  TrendingUp,
  Rocket,
  Shield
} from "lucide-react";

export function ExperimentHeader() {
  const { user } = useAuth();
  const { openModal } = useConversionModalContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isAdmin = user?.email === "djoere@scailup.io";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#solutions", label: "Solutions" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Success Stories" }
  ];

  const handleStartFreeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== EXPERIMENT HEADER CTA CLICKED ===');
    console.log('ExperimentHeader: Start Free button clicked - opening rebuilt modal');
    openModal();
    console.log('=== EXPERIMENT HEADER CTA COMPLETED ===');
  };

  const handleMobileStartFreeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== EXPERIMENT HEADER MOBILE CTA CLICKED ===');
    console.log('ExperimentHeader Mobile: Start Free button clicked - opening rebuilt modal');
    openModal();
    setIsMenuOpen(false);
    console.log('=== EXPERIMENT HEADER MOBILE CTA COMPLETED ===');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-xl border-b border-border/20 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Experiment Version */}
          <Link to="/landing-experiment" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
                <Sparkles className="h-6 w-6 text-primary-foreground animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                ScailUp
              </h1>
              <span className="text-xs text-primary/60 italic">Experiment</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-muted-foreground hover:text-foreground transition-colors duration-200 group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/20 hover:bg-card/40 transition-all duration-200 border border-border/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-200 border border-amber-500/20">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Admin</span>
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Active</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
                <Button 
                  onClick={handleStartFreeClick}
                  className="relative gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/30 transition-all duration-300 group overflow-hidden"
                  type="button"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <Rocket className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Start Free</span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-card/20 transition-colors"
            type="button"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 p-4 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/20 animate-fade-in">
            <nav className="flex flex-col gap-4 mb-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-border/20">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-700 dark:text-amber-300">Admin</span>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-2 p-3 rounded-lg hover:bg-card/20 transition-colors">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Button 
                    onClick={handleMobileStartFreeClick}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
                    type="button"
                  >
                    <Rocket className="h-4 w-4" />
                    Start Free
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
