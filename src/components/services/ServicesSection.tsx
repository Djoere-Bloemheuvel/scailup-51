
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Zap, TrendingUp, Users } from "lucide-react";

const moduleIcons = {
  lead_engine: Users,
  marketing_engine: TrendingUp, 
  sales_engine: Zap,
};

const moduleNames = {
  lead_engine: "Lead Engine",
  marketing_engine: "Marketing Engine",
  sales_engine: "Sales Engine",
};

export const ServicesSection = () => {
  const { data: tiers, isLoading } = useQuery({
    queryKey: ['module-tiers-with-credits'],
    queryFn: async () => {
      // First get the tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('module_tiers')
        .select('*')
        .eq('is_active', true)
        .order('module', { ascending: true });

      if (tiersError) throw tiersError;

      // Then get the credits for each tier
      const tiersWithCredits = await Promise.all(
        (tiersData || []).map(async (tier) => {
          const { data: credits, error: creditsError } = await supabase
            .from('module_tier_credits')
            .select('*')
            .eq('module_tier_id', tier.id);

          if (creditsError) {
            console.error('Error fetching credits for tier:', tier.id, creditsError);
            return { ...tier, credits: [] };
          }

          return { ...tier, credits: credits || [] };
        })
      );

      return tiersWithCredits;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 bg-gray-100 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 animate-pulse rounded" />
                <div className="h-4 bg-gray-100 animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Group tiers by module
  const tiersByModule = tiers?.reduce((acc, tier) => {
    if (!acc[tier.module]) {
      acc[tier.module] = [];
    }
    acc[tier.module].push(tier);
    return acc;
  }, {} as Record<string, typeof tiers>) || {};

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Our Services</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from our comprehensive suite of tools to accelerate your business growth
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(tiersByModule).map(([module, moduleTiers]) => {
          const Icon = moduleIcons[module as keyof typeof moduleIcons];
          const moduleName = moduleNames[module as keyof typeof moduleNames];

          return (
            <Card key={module} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {moduleName}
                </CardTitle>
                <CardDescription>
                  Professional tools for {moduleName.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {moduleTiers?.map((tier) => (
                  <div key={tier.tier} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{tier.tier} Plan</span>
                      <Badge variant="secondary">{tier.name}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tier.credits && tier.credits.length > 0 && (
                        <div className="space-y-1">
                          {tier.credits.map((credit: any) => (
                            <div key={credit.id}>
                              <p>{credit.credit_type}: {credit.amount} per {credit.reset_interval}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {tier.description && (
                        <p className="mt-1">{tier.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
