
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export const AgencyFooter = memo(() => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#222222] relative">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2196F3] to-transparent opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          
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
            <p className="text-[#CCCCCC] text-sm max-w-xs leading-relaxed">
              Done-for-you outbound marketing voor B2B bedrijven. Meer afspraken, minder gedoe.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <div className="space-y-3">
              <a href="#services" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                LinkedIn Outreach
              </a>
              <a href="#services" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Cold Email Campagnes
              </a>
              <a href="#services" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                AI SDR
              </a>
              <a href="#services" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Lead Engine
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Bedrijf</h3>
            <div className="space-y-3">
              <a href="#cases" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Cases
              </a>
              <a href="#testimonials" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Testimonials
              </a>
              <Link to="/contact" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Over ons
              </Link>
              <Link to="/contact" className="block text-[#CCCCCC] hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#CCCCCC] text-sm">
                <Mail className="h-4 w-4 text-[#2196F3]" />
                <span>hello@scailup.com</span>
              </div>
              <div className="flex items-center gap-3 text-[#CCCCCC] text-sm">
                <Phone className="h-4 w-4 text-[#2196F3]" />
                <span>+31 6 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-[#CCCCCC] text-sm">
                <MapPin className="h-4 w-4 text-[#2196F3]" />
                <span>Amsterdam, Nederland</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-[#222222]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#CCCCCC] text-xs">
              © 2024 ScailUp. Alle rechten voorbehouden.
            </p>
            
            {/* Social Links */}
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
                href="mailto:hello@scailup.com"
                className="w-10 h-10 bg-[#111111] border border-[#222222] rounded-lg flex items-center justify-center hover:border-[#2196F3]/50 transition-all duration-300 group"
              >
                <Mail className="h-5 w-5 text-[#CCCCCC] group-hover:text-[#2196F3] transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

AgencyFooter.displayName = 'AgencyFooter';
