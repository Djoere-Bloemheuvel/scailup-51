
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';
import { 
  ArrowRight, 
  Sparkles, 
  Menu, 
  X, 
  Search
} from "lucide-react";

export function ProfessionalHeader() {
  const { user } = useAuth();
  const { openModal } = useConversionModalContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    { href: "#home", label: "Home" },
    { href: "#over-ons", label: "Over Ons" },
    { href: "#diensten", label: "Diensten" },
    { href: "#portfolio", label: "Portfolio" },
    { href: "#contact", label: "Contact" }
  ];

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ProfessionalHeader: Contact button clicked - opening modal');
    openModal();
  };

  const handleMobileContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('ProfessionalHeader Mobile: Contact button clicked - opening modal');
    openModal();
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      isScrolled 
        ? 'bg-[#030712]/98 backdrop-blur-2xl border-b border-slate-800/40 shadow-2xl shadow-slate-950/20' 
        : 'bg-[#030712]/90 backdrop-blur-xl'
    }`}>
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Premium Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="h-11 w-11 bg-gradient-to-br from-blue-500/90 to-slate-400/80 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:shadow-blue-400/30 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-50 group-hover:text-blue-400 transition-all duration-300 tracking-tight">
                SCAILUP
              </h1>
              <span className="text-xs text-slate-500 tracking-[0.2em] font-medium uppercase">
                AI GROWTH AGENCY
              </span>
            </div>
          </Link>

          {/* Premium Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-slate-400 hover:text-slate-200 transition-all duration-300 group font-medium text-sm tracking-wide"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-slate-400 transition-all duration-500 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Premium Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="p-3 rounded-2xl hover:bg-slate-800/30 transition-all duration-300 group">
              <Search className="h-5 w-5 text-slate-500 group-hover:text-slate-300 transition-colors duration-300" />
            </button>
            
            {!user && (
              <Button 
                onClick={handleContactClick}
                variant="outline"
                className="gap-3 border border-slate-600/40 bg-slate-900/20 backdrop-blur-sm text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 hover:border-slate-500/60 transition-all duration-500 px-6 py-3 rounded-2xl shadow-lg shadow-slate-950/40 hover:shadow-xl hover:shadow-slate-900/60 hover:-translate-y-0.5"
                type="button"
              >
                Contact
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 rounded-2xl hover:bg-slate-800/30 transition-all duration-300"
            type="button"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-slate-200" />
            ) : (
              <Menu className="h-6 w-6 text-slate-200" />
            )}
          </button>
        </div>

        {/* Premium Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 p-8 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-700/30 animate-fade-in shadow-2xl shadow-slate-950/60">
            <nav className="flex flex-col gap-6 mb-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-slate-300 hover:text-slate-100 transition-colors py-3 font-medium text-lg tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-4 pt-6 border-t border-slate-700/30">
              {!user && (
                <Button 
                  onClick={handleMobileContactClick}
                  className="w-full gap-3 bg-gradient-to-r from-blue-600/90 to-slate-600/80 hover:from-blue-500/90 hover:to-slate-500/80 text-lg py-4 rounded-2xl shadow-xl shadow-slate-950/60 transition-all duration-500"
                  type="button"
                >
                  Contact
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
