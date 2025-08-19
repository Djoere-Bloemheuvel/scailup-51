
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Package,
  TrendingUp,
  Users,
  Mail,
  Eye,
  MousePointer
} from 'lucide-react';
import { Service } from '@/hooks/useServices';

interface ServiceCardProps {
  service: Service;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (field: string, value: any) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/10 text-green-700 border-green-200';
    case 'concept': return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'paused': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    case 'archived': return 'bg-gray-500/10 text-gray-700 border-gray-200';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Actief';
    case 'concept': return 'Concept';
    case 'paused': return 'Gepauzeerd';
    case 'archived': return 'Gearchiveerd';
    default: return status;
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isOpen,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [localValues, setLocalValues] = useState({
    title: service.title,
    description: service.description || '',
    target_companies: service.target_companies || '',
    problem_solved: service.problem_solved || '',
    unique_value: service.unique_value || '',
    use_cases: service.use_cases || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (field: string) => {
    onUpdate(field, localValues[field as keyof typeof localValues]);
  };

  const handleStatusChange = (status: string) => {
    onUpdate('status', status);
  };

  return (
    <Card className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground truncate">
                  {service.title || 'Nieuwe dienst'}
                </h3>
                <Badge 
                  variant="outline" 
                  className={getStatusColor(service.status)}
                >
                  {getStatusLabel(service.status)}
                </Badge>
              </div>
              {service.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Performance metrics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Impressies</p>
              <p className="text-sm font-medium">0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Clicks</p>
              <p className="text-sm font-medium">0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Emails</p>
              <p className="text-sm font-medium">0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Conversies</p>
              <p className="text-sm font-medium">0</p>
            </div>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Basis informatie</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Dienst/Product naam *
                </label>
                <Input
                  value={localValues.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onBlur={() => handleInputBlur('title')}
                  placeholder="Bijvoorbeeld: Marketing Automation"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select value={service.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="active">Actief</SelectItem>
                    <SelectItem value="paused">Gepauzeerd</SelectItem>
                    <SelectItem value="archived">Gearchiveerd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Beschrijving
              </label>
              <Textarea
                value={localValues.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => handleInputBlur('description')}
                placeholder="Korte beschrijving van je dienst of product..."
                rows={3}
              />
            </div>
          </div>

          {/* Target Market */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Doelgroep</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Doelbedrijven
              </label>
              <Textarea
                value={localValues.target_companies}
                onChange={(e) => handleInputChange('target_companies', e.target.value)}
                onBlur={() => handleInputBlur('target_companies')}
                placeholder="Beschrijf het type bedrijven dat je target (bijv. 'Tech startups met 10-50 werknemers')"
                rows={2}
              />
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Waardepropositie</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Welk probleem los je op?
                </label>
                <Textarea
                  value={localValues.problem_solved}
                  onChange={(e) => handleInputChange('problem_solved', e.target.value)}
                  onBlur={() => handleInputBlur('problem_solved')}
                  placeholder="Beschrijf het hoofdprobleem dat je dienst oplost..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Unieke waarde
                </label>
                <Textarea
                  value={localValues.unique_value}
                  onChange={(e) => handleInputChange('unique_value', e.target.value)}
                  onBlur={() => handleInputBlur('unique_value')}
                  placeholder="Wat maakt jouw oplossing uniek ten opzichte van concurrenten?"
                  rows={3}
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
                  placeholder="Concrete voorbeelden van hoe klanten je dienst gebruiken..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
