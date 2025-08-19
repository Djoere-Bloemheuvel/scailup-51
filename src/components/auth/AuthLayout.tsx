
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AnimatedBackground from '@/components/AnimatedBackground';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
}

export const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  icon, 
  maxWidth = 'md',
  showBackground = true
}: AuthLayoutProps) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }[maxWidth];

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-hidden">
      {showBackground && (
        <div className="fixed inset-0 w-full h-screen h-[100dvh] z-0">
          <AnimatedBackground />
        </div>
      )}
      
      <Card className={`w-full ${maxWidthClass} shadow-2xl border-0 bg-card/95 backdrop-blur-sm relative z-10 animate-fade-in`}>
        <CardHeader className="space-y-4 pb-6 pt-6">
          <div className="flex flex-col items-center space-y-3">
            {icon && (
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 animate-pulse-glow">
                {icon}
              </div>
            )}
            
            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground max-w-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
