
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight, Calendar, CheckCircle, X } from "lucide-react";
import { CallbackRequestForm } from './CallbackRequestForm';

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hardcoded pricing since there are no pricing tables in the database
const STARTER_BOOST_PRICE = 49;
const CURRENCY = 'EUR';

// Stripe redirect function
const redirectToStripeCheckout = async ({ plan }: { plan: string }) => {
  console.log('Redirecting to Stripe checkout for plan:', plan);
  // This would typically call your Stripe checkout edge function
  // For now, we'll redirect to the registration page as a fallback
  window.location.href = '/registreer';
};

// Cal.com integration
const loadCalScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector('script[src="https://cal.com/embed/embed.js"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cal.com/embed/embed.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cal.com script'));
    document.head.appendChild(script);
  });
};

const openCalOverlay = async () => {
  try {
    await loadCalScript();
    // Open Cal.com overlay - you'll need to replace with your actual Cal.com username
    if (window.Cal) {
      window.Cal("ui", {
        "styles": {"branding": {"color": "#000000"}},
        "hideEventTypeDetails": false,
        "layout": "month_view"
      });
      window.Cal("openPopup", {
        "link": "YOUR-NAME" // Replace with actual Cal.com username
      });
    }
  } catch (error) {
    console.error('Error loading Cal.com:', error);
    // Fallback to direct link
    window.open('https://cal.com/YOUR-NAME', '_blank');
  }
};

export const ConversionModal: React.FC<ConversionModalProps> = ({ isOpen, onClose }) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoadingCal, setIsLoadingCal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Debug logging
  console.log('ConversionModal render - isOpen:', isOpen);
  console.log('ConversionModal render - onClose:', onClose);

  const handleStripeCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await redirectToStripeCheckout({ plan: 'starter_boost' });
    } catch (error) {
      console.error('Error redirecting to Stripe:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCalBooking = async () => {
    setIsLoadingCal(true);
    try {
      await openCalOverlay();
    } catch (error) {
      console.error('Error opening Cal.com:', error);
    } finally {
      setIsLoadingCal(false);
    }
  };

  const handleCallbackSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      onClose();
    }, 3000);
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${price}`;
  };

  const handleDialogOpenChange = (open: boolean) => {
    console.log('Dialog onOpenChange called with:', open);
    if (!open) {
      console.log('Dialog wants to close - calling onClose');
      onClose();
    }
  };

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        console.log('Escape key pressed - closing modal');
        onClose();
      }
    };

    if (isOpen) {
      console.log('Modal is open - adding event listeners');
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      console.log('Modal is closed - removing event listeners');
      document.body.style.overflow = 'unset';
    }

    return () => {
      console.log('Cleaning up modal event listeners');
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Force the dialog to be controlled and log state changes
  useEffect(() => {
    console.log('ConversionModal useEffect - isOpen changed to:', isOpen);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[80vw] w-[80vw] max-h-[80vh] p-0 gap-0 z-[100] bg-background border border-border rounded-2xl shadow-2xl backdrop-blur-sm animate-fade-in">
        <DialogHeader className="p-8 pb-0 relative">
          <DialogTitle className="text-3xl font-bold text-center text-foreground">
            Klaar om te beginnen?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Kies een van de beschikbare opties om te beginnen met onze diensten
          </DialogDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-6 top-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Sluiten</span>
          </Button>
        </DialogHeader>
        
        <div className="flex-1 p-8 pt-4 overflow-y-auto">
          {showSuccessMessage ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Bedankt!</h3>
                <p className="text-muted-foreground text-lg">
                  We hebben je aanvraag ontvangen en nemen binnen 24 uur contact met je op.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 h-full">
                {/* Left Column - Start Direct */}
                <Card className="bg-card border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
                  <CardContent className="p-8 h-full flex flex-col justify-between">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">✅</span>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">
                            Start direct
                          </h3>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Ontvang vandaag nog 1.000 leads met onze AI-outreach engine
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <span className="text-foreground text-base">AI-campagne binnen 24 uur actief</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <span className="text-foreground text-base">Dubbele leads in je eerste maand</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <span className="text-foreground text-base">Resultaat binnen 7 dagen – of we optimaliseren gratis</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleStripeCheckout}
                      disabled={isCheckingOut}
                      className="w-full h-14 text-lg font-bold gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 mt-8"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          Verwerken...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-6 w-6" />
                          Start nu voor {formatPrice(STARTER_BOOST_PRICE, CURRENCY)}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Right Column - Callback Form */}
                <Card className="bg-card border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/20">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className="space-y-8 flex-1">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">📞</span>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">
                            Liever eerst even sparren?
                          </h3>
                        </div>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Laat je gegevens achter of plan direct een gesprek
                        </p>
                      </div>

                      <div className="flex-1">
                        <CallbackRequestForm onSuccess={handleCallbackSuccess} />
                      </div>

                      <div className="text-center pt-4 border-t border-border">
                        <Button
                          onClick={handleCalBooking}
                          disabled={isLoadingCal}
                          variant="ghost"
                          className="text-primary hover:text-primary/90 hover:bg-primary/10 p-0 h-auto gap-2 text-base"
                        >
                          {isLoadingCal ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Laden...
                            </>
                          ) : (
                            <>
                              <Calendar className="h-5 w-5" />
                              📅 Liever zelf een moment kiezen?
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
