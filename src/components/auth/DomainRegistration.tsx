
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface DomainRegistrationProps {
  onDomainVerified: (domain: string, companyName: string) => void;
}

export const DomainRegistration: React.FC<DomainRegistrationProps> = ({ onDomainVerified }) => {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const validateDomain = async () => {
    if (!email || !companyName) {
      setError('Vul alle velden in');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const domain = email.split('@')[1];
      if (!domain) {
        setError('Ongeldig e-mailadres');
        return;
      }

      // Check if domain already exists in our clients table
      const { data: existingClient, error: clientError } = await supabase
        .from('clients')
        .select('company_domain')
        .eq('company_domain', domain)
        .single();

      if (clientError && clientError.code !== 'PGRST116') {
        console.error('Error checking domain:', clientError);
        setError('Er is een fout opgetreden bij het valideren van het domein');
        return;
      }

      if (existingClient) {
        setIsValid(true);
        onDomainVerified(domain, companyName);
      } else {
        setError('Dit domein is nog niet geregistreerd bij ScailUp. Neem contact op met de beheerder.');
      }
    } catch (error) {
      console.error('Domain validation error:', error);
      setError('Er is een fout opgetreden bij het valideren van het domein');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Domein Verificatie</CardTitle>
        <CardDescription>
          Voer uw bedrijfs-e-mailadres in om te verifiëren dat uw domein geregistreerd is.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Bedrijfsnaam</Label>
          <Input
            id="company-name"
            type="text"
            placeholder="Uw bedrijfsnaam"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isValidating}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Bedrijfs E-mailadres</Label>
          <Input
            id="email"
            type="email"
            placeholder="naam@uwbedrijf.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isValidating}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isValid && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Domein geverifieerd! U kunt doorgaan met registreren.</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={validateDomain} 
          className="w-full" 
          disabled={isValidating || !email || !companyName}
        >
          {isValidating ? 'Valideren...' : 'Verifieer Domein'}
        </Button>
      </CardContent>
    </Card>
  );
};
