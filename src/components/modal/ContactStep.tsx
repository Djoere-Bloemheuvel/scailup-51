
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, Calendar, Clock, Send } from "lucide-react";

interface FormData {
  naam: string;
  email: string;
  telefoon: string;
  notities: string;
}

export const ContactStep: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    naam: '',
    email: '',
    telefoon: '',
    notities: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Contact form submitted:', formData);
    alert('Bedankt! We nemen binnen 24 uur contact met je op.');
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalBooking = () => {
    console.log('Opening Cal.com booking');
    // Replace with actual Cal.com integration
    window.open('https://cal.com/scailup/gesprek', '_blank');
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Laten we kennismaken
        </h2>
        <p className="text-muted-foreground">
          Plan een gratis strategiegesprek en ontdek hoe we je kunnen helpen
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Vertel ons over je bedrijf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Naam *
                </label>
                <input
                  type="text"
                  required
                  value={formData.naam}
                  onChange={(e) => handleInputChange('naam', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Je naam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mailadres *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="je@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={formData.telefoon}
                  onChange={(e) => handleInputChange('telefoon', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="06 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Waar kunnen we je mee helpen?
                </label>
                <textarea
                  value={formData.notities}
                  onChange={(e) => handleInputChange('notities', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Vertel ons over je uitdaging..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Versturen...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Gesprek aanvragen
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Direct Booking & Info */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center space-y-4">
              <Calendar className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Direct inplannen?</h3>
              <p className="text-sm text-muted-foreground">
                Kies direct een geschikt moment in onze agenda
              </p>
              <Button
                onClick={handleCalBooking}
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Calendar className="h-4 w-4" />
                Plan direct een call
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Wat kun je verwachten?</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-primary" />
                <span>30 minuten strategiegesprek</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-primary" />
                <span>Persoonlijke benadering van je uitdaging</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-primary" />
                <span>Concrete aanbevelingen voor groei</span>
              </li>
            </ul>
          </Card>

          <div className="bg-muted/20 p-4 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Waarom kiezen voor ScailUp?</h3>
            <p className="text-muted-foreground text-sm">
              Meer dan 500 bedrijven zijn je voorgegaan. Gemiddeld zien onze klanten een 3x toename in leads binnen de eerste 3 maanden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
