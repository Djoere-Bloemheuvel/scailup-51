import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Users, 
  Building, 
  Target, 
  Star, 
  FileText, 
  AlertCircle,
  Loader2,
  Plus,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Productnaam is verplicht').min(2, 'Productnaam moet minimaal 2 karakters zijn'),
  description: z.string().min(1, 'Beschrijving is verplicht').min(10, 'Beschrijving moet minimaal 10 karakters zijn'),
  targetRoles: z.array(z.string()).min(1, 'Selecteer minimaal 1 doelgroep'),
  targetIndustries: z.array(z.string()).min(1, 'Selecteer minimaal 1 industrie'),
  targetCompanySizes: z.array(z.string()).min(1, 'Selecteer minimaal 1 bedrijfsgrootte'),
  problemSolved: z.string().min(1, 'Beschrijf welk probleem dit oplost').min(10, 'Beschrijving moet minimaal 10 karakters zijn'),
  uniqueValue: z.string().min(1, 'Beschrijf de unieke waarde').min(10, 'Beschrijving moet minimaal 10 karakters zijn'),
  useCases: z.array(z.string()).min(1, 'Voeg minimaal 1 use case toe')
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Partial<ProductFormData>;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEditing = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUseCase, setNewUseCase] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      targetRoles: initialData?.targetRoles || [],
      targetIndustries: initialData?.targetIndustries || [],
      targetCompanySizes: initialData?.targetCompanySizes || [],
      problemSolved: initialData?.problemSolved || '',
      uniqueValue: initialData?.uniqueValue || '',
      useCases: initialData?.useCases || []
    }
  });

  const watchedUseCases = watch('useCases');

  const targetRoles = [
    'CEO', 'CTO', 'CFO', 'COO', 'VP Sales', 'VP Marketing', 'VP Engineering',
    'Sales Manager', 'Marketing Manager', 'Product Manager', 'HR Manager',
    'IT Manager', 'Operations Manager', 'Business Development Manager'
  ];

  const targetIndustries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Real Estate', 'Consulting', 'Legal', 'Media & Entertainment',
    'Transportation', 'Energy', 'Non-profit', 'Government', 'Other'
  ];

  const targetCompanySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees',
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ];

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het opslaan van het product.');
    } finally {
      setIsLoading(false);
    }
  };

  const addUseCase = () => {
    if (newUseCase.trim() && !watchedUseCases.includes(newUseCase.trim())) {
      setValue('useCases', [...watchedUseCases, newUseCase.trim()]);
      setNewUseCase('');
    }
  };

  const removeUseCase = (index: number) => {
    setValue('useCases', watchedUseCases.filter((_, i) => i !== index));
  };

  const toggleArrayValue = (field: keyof Pick<ProductFormData, 'targetRoles' | 'targetIndustries' | 'targetCompanySizes'>, value: string) => {
    const currentValues = watch(field);
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {isEditing ? 'Product Bewerken' : 'Nieuw Product/Dienst Toevoegen'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basis Informatie
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Product/Dienst Naam</Label>
              <Input
                id="name"
                placeholder="Bijv. AI Lead Generation Platform"
                disabled={isLoading}
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                placeholder="Beschrijf wat je product/dienst doet..."
                disabled={isLoading}
                {...register('description')}
                className={errors.description ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Doelgroep
            </h3>
            
            <div className="space-y-2">
              <Label>Functies (Wie heeft hier baat bij?)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {targetRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleArrayValue('targetRoles', role)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      watch('targetRoles').includes(role)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                    disabled={isLoading}
                  >
                    {role}
                  </button>
                ))}
              </div>
              {errors.targetRoles && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.targetRoles.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Industrieën</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {targetIndustries.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleArrayValue('targetIndustries', industry)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      watch('targetIndustries').includes(industry)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                    disabled={isLoading}
                  >
                    {industry}
                  </button>
                ))}
              </div>
              {errors.targetIndustries && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.targetIndustries.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bedrijfsgrootte</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {targetCompanySizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleArrayValue('targetCompanySizes', size)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      watch('targetCompanySizes').includes(size)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                    disabled={isLoading}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {errors.targetCompanySizes && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.targetCompanySizes.message}
                </p>
              )}
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Waarde Propositie
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="problemSolved">Welk probleem lost dit op?</Label>
              <Textarea
                id="problemSolved"
                placeholder="Beschrijf het probleem dat je product/dienst oplost..."
                disabled={isLoading}
                {...register('problemSolved')}
                className={errors.problemSolved ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.problemSolved && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.problemSolved.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="uniqueValue">Wat onderscheidt jullie van de concurrentie?</Label>
              <Textarea
                id="uniqueValue"
                placeholder="Beschrijf je unieke waarde..."
                disabled={isLoading}
                {...register('uniqueValue')}
                className={errors.uniqueValue ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.uniqueValue && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.uniqueValue.message}
                </p>
              )}
            </div>
          </div>

          {/* Use Cases */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Use Cases
            </h3>
            
            <div className="space-y-2">
              <Label>Praktische situaties waar dit gebruikt wordt</Label>
              <div className="flex gap-2">
                <Input
                  value={newUseCase}
                  onChange={(e) => setNewUseCase(e.target.value)}
                  placeholder="Voeg een use case toe..."
                  disabled={isLoading}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUseCase())}
                />
                <Button
                  type="button"
                  onClick={addUseCase}
                  disabled={isLoading || !newUseCase.trim()}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {watchedUseCases.map((useCase, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <span className="flex-1 text-sm">{useCase}</span>
                    <Button
                      type="button"
                      onClick={() => removeUseCase(index)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {errors.useCases && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.useCases.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isEditing ? 'Bijwerken...' : 'Product Toevoegen...'}
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                {isEditing ? 'Product Bijwerken' : 'Product Toevoegen'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm; 