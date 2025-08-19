
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Package,
  Lock
} from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (field: keyof Omit<Product, 'id'>, value: string) => void;
  readOnly?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOpen,
  onToggle,
  onDelete,
  onUpdate,
  readOnly = false,
}) => {
  const [localValues, setLocalValues] = useState({
    title: product.title,
    description: product.description,
    target_roles: product.target_roles,
    target_companies: product.target_companies,
    problem_solved: product.problem_solved,
    unique_value: product.unique_value,
    use_cases: product.use_cases,
  });

  const handleInputChange = (field: keyof typeof localValues, value: string) => {
    if (readOnly) return;
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (field: keyof typeof localValues) => {
    if (readOnly) return;
    onUpdate(field, localValues[field]);
  };

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {product.title || 'Nieuw product'}
                </h3>
                {readOnly && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Alleen lezen
                  </Badge>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Basis informatie</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Product/Dienst naam *
              </label>
              <Input
                value={localValues.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onBlur={() => handleInputBlur('title')}
                placeholder="Bijvoorbeeld: Marketing Automation"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Probleem dat wordt opgelost
              </label>
              <Textarea
                value={localValues.problem_solved}
                onChange={(e) => handleInputChange('problem_solved', e.target.value)}
                onBlur={() => handleInputBlur('problem_solved')}
                placeholder="Beschrijf het hoofdprobleem dat je product oplost..."
                rows={3}
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Target Market */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Target markt</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Doelrollen
              </label>
              <Input
                value={localValues.target_roles}
                onChange={(e) => handleInputChange('target_roles', e.target.value)}
                onBlur={() => handleInputBlur('target_roles')}
                placeholder="Bijvoorbeeld: Marketing Manager, CMO, Digital Marketer"
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Doelbedrijven
              </label>
              <Input
                value={localValues.target_companies}
                onChange={(e) => handleInputChange('target_companies', e.target.value)}
                onBlur={() => handleInputBlur('target_companies')}
                placeholder="Bijvoorbeeld: SaaS bedrijven, E-commerce, Tech startups"
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Waardepropositie</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Unieke waarde
              </label>
              <Textarea
                value={localValues.unique_value}
                onChange={(e) => handleInputChange('unique_value', e.target.value)}
                onBlur={() => handleInputBlur('unique_value')}
                placeholder="Wat maakt jouw product uniek?"
                rows={3}
                readOnly={readOnly}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Use cases
              </label>
              <Textarea
                value={localValues.use_cases}
                onChange={(e) => handleInputChange('use_cases', e.target.value)}
                onBlur={() => handleInputBlur('use_cases')}
                placeholder="Concrete voorbeelden van gebruik..."
                rows={3}
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
