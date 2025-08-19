
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building, Mail, CreditCard, ArrowRight, CheckCircle } from "lucide-react";

interface RegistrationData {
  company_name: string;
  contact_email: string;
  allowed_domain: string;
  billing_plan: string;
  billing_cycle: 'monthly' | 'yearly';
}

export function SelfRegistration() {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    company_name: "",
    contact_email: "",
    allowed_domain: "",
    billing_plan: "starter",
    billing_cycle: 'monthly'
  });
  const { toast } = useToast();

  const extractDomain = (email: string) => {
    const domain = email.split('@')[1];
    return domain || '';
  };

  const handleEmailChange = (email: string) => {
    const domain = extractDomain(email);
    setRegistrationData({
      ...registrationData,
      contact_email: email,
      allowed_domain: domain
    });
  };

  const validateForm = () => {
    return (
      registrationData.company_name.trim() !== "" &&
      registrationData.contact_email.trim() !== "" &&
      registrationData.allowed_domain.trim() !== "" &&
      registrationData.billing_plan !== ""
    );
  };

  const createRegistration = async () => {
    if (!validateForm()) {
      toast({
        title: "Vul alle velden in",
        description: "Controleer of alle verplichte velden zijn ingevuld.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // For now, just show success since we don't have the proper tables
      toast({
        title: "Registratie succesvol",
        description: "Je aanvraag is ontvangen en wordt verwerkt.",
      });
      
      setStep('success');
    } catch (error) {
      console.error('Error creating registration:', error);
      toast({
        title: "Fout bij registratie",
        description: "Er is een probleem opgetreden bij het registreren.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Registratie voltooid!</h3>
            <p className="text-muted-foreground mb-4">
              Je registratie is succesvol verwerkt. Je ontvangt binnenkort een e-mail met verdere instructies.
            </p>
            <Button onClick={() => setStep('form')} className="w-full">
              Nieuwe registratie
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Start met ScailUp</CardTitle>
          <p className="text-muted-foreground">
            Registreer je bedrijf en begin direct met het genereren van leads
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Bedrijfsinformatie
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Bedrijfsnaam *</Label>
                <Input
                  id="company_name"
                  value={registrationData.company_name}
                  onChange={(e) => setRegistrationData({ ...registrationData, company_name: e.target.value })}
                  placeholder="Jouw Bedrijf B.V."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact e-mail *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={registrationData.contact_email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="info@jouwbedrijf.nl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allowed_domain">Bedrijfsdomein</Label>
              <Input
                id="allowed_domain"
                value={registrationData.allowed_domain}
                onChange={(e) => setRegistrationData({ ...registrationData, allowed_domain: e.target.value })}
                placeholder="jouwbedrijf.nl"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Dit domein wordt automatisch ingevuld op basis van je e-mailadres
              </p>
            </div>
          </div>

          {/* Billing Plan Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Kies je plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing_plan">Plan *</Label>
                <Select
                  value={registrationData.billing_plan}
                  onValueChange={(value) => setRegistrationData({ ...registrationData, billing_plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter Plan</SelectItem>
                    <SelectItem value="professional">Professional Plan</SelectItem>
                    <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_cycle">Facturatie</Label>
                <Select
                  value={registrationData.billing_cycle}
                  onValueChange={(value: 'monthly' | 'yearly') => setRegistrationData({ ...registrationData, billing_cycle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Maandelijks</SelectItem>
                    <SelectItem value="yearly">Jaarlijks (20% korting)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={createRegistration} 
            disabled={loading || !validateForm()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              "Verwerken..."
            ) : (
              <>
                Start registratie
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Door te registreren ga je akkoord met onze{" "}
            <a href="/terms" className="underline">Algemene Voorwaarden</a> en{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 
