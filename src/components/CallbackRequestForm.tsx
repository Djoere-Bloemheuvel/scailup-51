
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CallbackRequestFormProps {
  onSuccess: () => void;
}

export const CallbackRequestForm: React.FC<CallbackRequestFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    voornaam: '',
    achternaam: '',
    email: '',
    telefoonnummer: '',
    bericht: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('callback_requests' as any)
        .insert([{
          voornaam: formData.voornaam,
          achternaam: formData.achternaam,
          email: formData.email,
          telefoonnummer: formData.telefoonnummer,
          bericht: formData.bericht || null
        }]);

      if (error) {
        console.error('Error submitting callback request:', error);
        throw error;
      }

      console.log('Callback request submitted successfully');
      onSuccess();
      
      // Reset form
      setFormData({
        voornaam: '',
        achternaam: '',
        email: '',
        telefoonnummer: '',
        bericht: ''
      });
    } catch (error) {
      console.error('Error submitting callback request:', error);
      // Here you could show a toast notification or error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="voornaam" className="text-foreground text-sm font-medium mb-2 block">
            Voornaam *
          </Label>
          <Input
            id="voornaam"
            value={formData.voornaam}
            onChange={(e) => handleInputChange('voornaam', e.target.value)}
            required
            className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary h-12 rounded-lg"
            placeholder="Voornaam"
          />
        </div>
        <div>
          <Label htmlFor="achternaam" className="text-foreground text-sm font-medium mb-2 block">
            Achternaam *
          </Label>
          <Input
            id="achternaam"
            value={formData.achternaam}
            onChange={(e) => handleInputChange('achternaam', e.target.value)}
            required
            className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary h-12 rounded-lg"
            placeholder="Achternaam"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email" className="text-foreground text-sm font-medium mb-2 block">
          E-mailadres *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary h-12 rounded-lg"
          placeholder="jouw@email.com"
        />
      </div>
      
      <div>
        <Label htmlFor="telefoonnummer" className="text-foreground text-sm font-medium mb-2 block">
          Telefoonnummer *
        </Label>
        <Input
          id="telefoonnummer"
          type="tel"
          value={formData.telefoonnummer}
          onChange={(e) => handleInputChange('telefoonnummer', e.target.value)}
          required
          className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary h-12 rounded-lg"
          placeholder="+31 6 12345678"
        />
      </div>
      
      <div>
        <Label htmlFor="bericht" className="text-foreground text-sm font-medium mb-2 block">
          Waarmee kunnen we helpen?
        </Label>
        <Textarea
          id="bericht"
          value={formData.bericht}
          onChange={(e) => handleInputChange('bericht', e.target.value)}
          placeholder="Vertel ons waar je hulp bij nodig hebt..."
          rows={4}
          className="bg-input border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary rounded-lg resize-none"
        />
      </div>
      
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 text-lg font-bold gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Versturen...
          </>
        ) : (
          <>
            <Phone className="h-6 w-6" />
            Bel mij terug
          </>
        )}
      </Button>
    </form>
  );
};
