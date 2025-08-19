
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';
import { 
  ArrowRight, 
  Menu, 
  X,
  Sparkles
} from "lucide-react";

export function PremiumHeader() {
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
    { href: "#services", label: "Services" },
    { href: "#cases", label: "Cases" },
    { href: "#over-ons", label: "Over Ons" }
  ];

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PremiumHeader: Contact button clicked - opening modal');
    openModal();
  };

  const handleMobileContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PremiumHeader Mobile: Contact button clicked - opening modal');
    openModal();
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-[#111111]/95 backdrop-blur-xl border-b border-[#222222]' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              SCAILUP
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[#CCCCCC] hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center">
            {!user && (
              <Button 
                onClick={handleContactClick}
                className="group bg-[#111111] border border-transparent bg-gradient-to-r from-[#2196F3] to-[#21CBF3] p-[1px] rounded-full hover:shadow-lg hover:shadow-[#2196F3]/25 transition-all duration-300"
                type="button"
              >
                <div className="bg-[#111111] text-white px-6 py-2 rounded-full flex items-center gap-2 group-hover:bg-[#111111]/90 transition-all duration-300 text-sm font-medium">
                  Contact
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#222222]/50 transition-colors duration-200"
            type="button"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 p-6 bg-[#111111]/95 backdrop-blur-xl rounded-2xl border border-[#222222]">
            <nav className="flex flex-col gap-4 mb-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[#CCCCCC] hover:text-white transition-colors py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            
            {!user && (
              <Button 
                onClick={handleMobileContactClick}
                className="w-full group bg-[#111111] border border-transparent bg-gradient-to-r from-[#2196F3] to-[#21CBF3] p-[1px] rounded-full"
                type="button"
              >
                <div className="w-full bg-[#111111] text-white py-3 rounded-full flex items-center justify-center gap-2 group-hover:bg-[#111111]/90 transition-all duration-300">
                  Contact
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
