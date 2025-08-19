
import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useConversionModalContext } from '@/contexts/ConversionModalContext';

export const ConversionModalRebuilt: React.FC = () => {
  const { isOpen, closeModal } = useConversionModalContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="relative w-[95vw] max-w-2xl h-auto max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welkom bij ScailUp</h2>
            <p className="text-muted-foreground">Start je gratis account</p>
          </div>
          
          <button
            ref={closeButtonRef}
            onClick={closeModal}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Modal content */}
        <div className="flex-1 p-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-primary rounded-full"></div>
            </div>
            <h3 className="text-xl font-semibold">Begin je groeireis</h3>
            <p className="text-muted-foreground">
              ScailUp helpt je bedrijf exponentieel groeien met AI-gedreven automatisering.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">AI Sales Automatisering</span>
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Lead Generatie</span>
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Marketing Automatisering</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={closeModal}
              size="lg" 
              className="w-full"
            >
              Start Gratis Account
            </Button>
            <Button 
              variant="outline" 
              onClick={closeModal}
              size="lg" 
              className="w-full"
            >
              Plan een Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
