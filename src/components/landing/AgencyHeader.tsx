
import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const AgencyHeader = memo(() => {
  const { openModal } = useConversionModalContext();

  const handlePlanCallClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('AgencyHeader: Plan strategiegesprek clicked - opening modal');
    openModal();
  }, [openModal]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/80 backdrop-blur-xl border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              SCAILUP
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-[#CCCCCC] hover:text-white transition-colors text-sm font-medium">
              Services
            </a>
            <a href="#cases" className="text-[#CCCCCC] hover:text-white transition-colors text-sm font-medium">
              Cases
            </a>
            <a href="#testimonials" className="text-[#CCCCCC] hover:text-white transition-colors text-sm font-medium">
              Testimonials
            </a>
            <Link to="/contact" className="text-[#CCCCCC] hover:text-white transition-colors text-sm font-medium">
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <Button 
            onClick={handlePlanCallClick}
            className="bg-gradient-to-r from-[#2196F3] to-[#21CBF3] text-white px-6 py-2 text-sm font-medium hover:shadow-lg hover:shadow-[#2196F3]/25 transition-all duration-300"
          >
            Plan Strategiegesprek
          </Button>
        </div>
      </div>
    </header>
  );
});

AgencyHeader.displayName = 'AgencyHeader';
