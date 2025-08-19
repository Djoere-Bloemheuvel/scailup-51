
import React from 'react';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  icon, 
  maxWidth = 'md',
  showBackground = true
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 relative overflow-hidden">
      {showBackground && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      )}
      
      <div className={`w-full ${
        maxWidth === 'sm' ? 'max-w-sm' : 
        maxWidth === 'md' ? 'max-w-md' : 
        'max-w-lg'
      } shadow-2xl border-0 bg-card/95 backdrop-blur-sm relative z-10 animate-fade-in rounded-xl`}>
        <div className="space-y-4 pb-6 pt-6 px-6">
          <div className="flex flex-col items-center space-y-3">
            {icon && (
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
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
        </div>
        
        <div className="pb-6 px-6">
          {children}
        </div>
      </div>
    </div>
  );
};
