
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';
import { 
  ArrowRight, 
  Sparkles, 
  Menu, 
  X
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/30' 
        : 'bg-slate-950/80 backdrop-blur-md'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo - Apple Style */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                SCAILUP
              </h1>
              <span className="text-xs text-slate-400 font-medium">
                AI Growth Agency
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Apple Style */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Button - Apple Style */}
          <div className="hidden lg:flex items-center">
            {!user && (
              <Button 
                onClick={handleContactClick}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-2 text-sm font-medium rounded-full transition-all duration-200"
                type="button"
              >
                Contact
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
            type="button"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu - Apple Style */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 p-6 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800/30">
            <nav className="flex flex-col gap-4 mb-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-slate-300 hover:text-white transition-colors py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            
            {!user && (
              <Button 
                onClick={handleMobileContactClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 py-3 text-base font-medium rounded-full"
                type="button"
              >
                Contact
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
