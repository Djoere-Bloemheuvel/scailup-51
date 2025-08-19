
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, ExternalLink } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useServices } from '@/hooks/useServices';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  title: string;
  description: string;
  target_roles: string;
  target_companies: string;
  problem_solved: string;
  unique_value: string;
  use_cases: string;
}

export const ProductsSection = () => {
  const { services, loading, canAddMore } = useServices();
  const navigate = useNavigate();
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  // Convert services to products format for compatibility
  const products: Product[] = services.map(service => ({
    id: service.id,
    title: service.title,
    description: service.description || '',
    target_roles: Array.isArray(service.target_roles) ? service.target_roles.join(', ') : '',
    target_companies: service.target_companies || '',
    problem_solved: service.problem_solved || '',
    unique_value: service.unique_value || '',
    use_cases: service.use_cases || '',
  }));

  const toggleProduct = (id: string) => {
    setOpenProductId(openProductId === id ? null : id);
  };

  const handleGoToServices = () => {
    navigate('/diensten');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Producten en Diensten
            </h2>
            <p className="text-muted-foreground mt-1">
              Configureer je producten om gerichte campagnes te kunnen maken
            </p>
          </div>
        </div>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Producten en Diensten
          </h2>
          <p className="text-muted-foreground mt-1">
            Configureer je producten om gerichte campagnes te kunnen maken
          </p>
        </div>
        <Button 
          onClick={handleGoToServices}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Beheer diensten
        </Button>
      </div>

      {/* Progress indicator */}
      {products.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {products.length} van 5 producten toegevoegd
        </div>
      )}
      
      {/* Products or empty state */}
      {products.length === 0 ? (
        <Card className="bg-card border border-border rounded-xl shadow-sm">
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-foreground">Nog geen producten toegevoegd</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Voeg je eerste product of dienst toe om campagnes te kunnen personaliseren.
            </p>
            <Button onClick={handleGoToServices} className="gap-2">
              <Plus className="h-4 w-4" />
              Eerste product toevoegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isOpen={openProductId === product.id}
              onToggle={() => toggleProduct(product.id)}
              onDelete={() => {}} // Read-only in this view
              onUpdate={() => {}} // Read-only in this view
              readOnly={true}
            />
          ))}
          {products.length > 3 && (
            <Card className="bg-muted/30 border border-border rounded-xl">
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  En nog {products.length - 3} meer...
                </p>
                <Button onClick={handleGoToServices} variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Bekijk alle diensten
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
