
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Globe, Sparkles, RefreshCw } from 'lucide-react';

interface CompanySectionProps {
  data: {
    company_name: string;
    company_website: string;
    company_industry: string;
    target_audience: string;
    target_region: string;
    product_pitch: string;
    usps: string;
    value_proposition: string;
    ai_generated_summary: string;
    website_scrape_results: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
  onWebsiteScrape: () => void;
  isScraping: boolean;
  title?: string;
}

export const CompanySection: React.FC<CompanySectionProps> = ({
  data,
  isEditing,
  onChange,
  onWebsiteScrape,
  isScraping,
  title = "Werkt voor"
}) => {
  const industries = [
    'Technology & Software',
    'Marketing & Advertising',
    'E-commerce & Retail',
    'Financiële diensten',
    'Gezondheidszorg',
    'Onderwijs',
    'Vastgoed',
    'Consultancy',
    'Manufacturing',
    'Other'
  ];

  const regions = [
    'Nederland',
    'België',
    'Europa',
    'Noord-Amerika',
    'Wereldwijd',
    'DACH (Duitsland, Oostenrijk, Zwitserland)',
    'Scandinavië',
    'Other'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Subsection 1: Bedrijfsinformatie */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Bedrijfsinformatie</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Bedrijfsnaam</Label>
              <Input
                id="company-name"
                value={data.company_name}
                onChange={(e) => onChange('company_name', e.target.value)}
                disabled={!isEditing}
                placeholder="Bijv. TechCorp BV"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="company-website">Website</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="company-website"
                  value={data.company_website}
                  onChange={(e) => onChange('company_website', e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://www.bedrijf.nl"
                  className="flex-1"
                />
                {isEditing && (
                  <Button
                    onClick={onWebsiteScrape}
                    disabled={isScraping || !data.company_website}
                    variant="outline"
                    size="icon"
                    title="Herlaad scrape"
                  >
                    <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-industry">Branche / niche</Label>
              <Select
                value={data.company_industry}
                onValueChange={(value) => onChange('company_industry', value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecteer branche" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target-region">Regio of land</Label>
              <Select
                value={data.target_region}
                onValueChange={(value) => onChange('target_region', value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecteer regio" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="target-audience">Doelgroep</Label>
            <Input
              id="target-audience"
              value={data.target_audience}
              onChange={(e) => onChange('target_audience', e.target.value)}
              disabled={!isEditing}
              placeholder="Bijv. MKB ondernemers, IT professionals, marketing managers"
              className="mt-1"
            />
          </div>
        </div>

        {/* Subsection 2: Propositie & AI-context */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">Propositie & AI-context</h4>
          <div>
            <Label htmlFor="product-pitch">Korte pitch</Label>
            <Textarea
              id="product-pitch"
              value={data.product_pitch}
              onChange={(e) => onChange('product_pitch', e.target.value)}
              disabled={!isEditing}
              placeholder="Beschrijf in 2-3 zinnen wat jullie product/dienst doet en waarom klanten ervoor kiezen..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="usps">Unique Selling Points</Label>
            <Textarea
              id="usps"
              value={data.usps}
              onChange={(e) => onChange('usps', e.target.value)}
              disabled={!isEditing}
              placeholder="Voeg een unieke eigenschap toe per regel, bijv:&#10;- 24/7 ondersteuning&#10;- Geen setup kosten&#10;- 30 dagen geld terug garantie"
              rows={4}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="value-proposition">Belangrijkste voordelen voor de klant</Label>
            <Textarea
              id="value-proposition"
              value={data.value_proposition}
              onChange={(e) => onChange('value_proposition', e.target.value)}
              disabled={!isEditing}
              placeholder="Beschrijf de concrete voordelen die klanten ervaren..."
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        {/* Subsection 3: AI Output (readonly) */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Output
          </h4>
          <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Laatste AI-samenvatting</Label>
              <div className="mt-1 p-3 bg-background rounded border text-sm">
                {data.ai_generated_summary || 'Nog geen AI-samenvatting gegenereerd'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Website scrape resultaten</Label>
              <div className="mt-1 p-3 bg-background rounded border text-sm max-h-32 overflow-y-auto">
                {data.website_scrape_results || 'Nog geen website data beschikbaar'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
