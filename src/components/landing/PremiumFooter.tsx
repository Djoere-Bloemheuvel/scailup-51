
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Linkedin, Mail, Phone } from "lucide-react";

export const PremiumFooter = memo(() => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#222222] relative">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2196F3] to-transparent opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          
          {/* Logo & Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-[#2196F3] to-[#21CBF3] rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                SCAILUP
              </h1>
            </Link>
            <p className="text-[#CCCCCC] text-sm max-w-xs">
              AI-gedreven outbound marketing voor exponentiële groei.
            </p>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <nav className="flex flex-wrap justify-center gap-8">
              <a href="#services" className="text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Services
              </a>
              <a href="#process" className="text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Process
              </a>
              <a href="#features" className="text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Features
              </a>
              <Link to="/contact" className="text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          {/* Social & Contact */}
          <div className="flex justify-end">
            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com/company/scailup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#111111] border border-[#222222] rounded-lg flex items-center justify-center hover:border-[#2196F3]/50 transition-all duration-300 group"
              >
                <Linkedin className="h-5 w-5 text-[#CCCCCC] group-hover:text-[#2196F3] transition-colors" />
              </a>
              <a 
                href="mailto:contact@scailup.com"
                className="w-10 h-10 bg-[#111111] border border-[#222222] rounded-lg flex items-center justify-center hover:border-[#2196F3]/50 transition-all duration-300 group"
              >
                <Mail className="h-5 w-5 text-[#CCCCCC] group-hover:text-[#2196F3] transition-colors" />
              </a>
              <a 
                href="tel:+31612345678"
                className="w-10 h-10 bg-[#111111] border border-[#222222] rounded-lg flex items-center justify-center hover:border-[#2196F3]/50 transition-all duration-300 group"
              >
                <Phone className="h-5 w-5 text-[#CCCCCC] group-hover:text-[#2196F3] transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-12 pt-8 border-t border-[#222222] text-center">
          <p className="text-[#CCCCCC] text-xs">
            © 2024 ScailUp. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
});

PremiumFooter.displayName = 'PremiumFooter';
