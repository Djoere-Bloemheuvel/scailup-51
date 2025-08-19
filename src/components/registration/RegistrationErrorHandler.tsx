
import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface RegistrationErrorHandlerProps {
  error: any;
  onRetry?: () => void;
  onLogin?: () => void;
}

export const RegistrationErrorHandler: React.FC<RegistrationErrorHandlerProps> = ({
  error,
  onRetry,
  onLogin
}) => {
  const getErrorDetails = (error: any) => {
    if (!error) return null;
    
    const errorMessage = error.message || error.error_description || '';
    
    // User already exists
    if (errorMessage.includes('User already registered')) {
      return {
        type: 'info' as const,
        title: 'Account bestaat al',
        message: 'Er bestaat al een account met dit e-mailadres.',
        action: 'login',
        actionText: 'Log in'
      };
    }
    
    // Database/trigger errors
    if (errorMessage.includes('Database error') || 
        errorMessage.includes('schema "net" does not exist') ||
        errorMessage.includes('current transaction is aborted') ||
        errorMessage.includes('unexpected_failure')) {
      return {
        type: 'error' as const,
        title: 'Technisch probleem',
        message: 'Er is een technisch probleem opgetreden. Je account is mogelijk wel aangemaakt.',
        action: 'login',
        actionText: 'Probeer in te loggen'
      };
    }
    
    // Domain already exists
    if (errorMessage.includes('domain') || errorMessage.includes('company_domain')) {
      return {
        type: 'error' as const,
        title: 'Domein al geregistreerd',
        message: 'Er bestaat al een account voor dit e-maildomein.',
        action: 'contact',
        actionText: 'Neem contact op'
      };
    }
    
    // Rate limit
    if (errorMessage.includes('rate limit')) {
      return {
        type: 'error' as const,
        title: 'Te veel pogingen',
        message: 'Te veel registratiepogingen. Probeer het later opnieuw.',
        action: 'retry',
        actionText: 'Probeer later opnieuw'
      };
    }
    
    // Generic error
    return {
      type: 'error' as const,
      title: 'Registratie mislukt',
      message: 'Er is een fout opgetreden bij het registreren.',
      action: 'retry',
      actionText: 'Probeer opnieuw'
    };
  };

  const errorDetails = getErrorDetails(error);
  
  if (!errorDetails) return null;

  const IconComponent = errorDetails.type === 'error' ? AlertCircle : 
                      errorDetails.type === 'info' ? Info : CheckCircle;

  return (
    <div className={`rounded-xl backdrop-blur-sm p-6 shadow-sm ${
      errorDetails.type === 'error' 
        ? 'bg-destructive/5 border border-destructive/20' 
        : errorDetails.type === 'info'
        ? 'bg-blue-500/5 border border-blue-500/20'
        : 'bg-primary/5 border border-primary/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          errorDetails.type === 'error' 
            ? 'bg-destructive/10' 
            : errorDetails.type === 'info'
            ? 'bg-blue-500/10'
            : 'bg-primary/10'
        }`}>
          <IconComponent className={`h-5 w-5 ${
            errorDetails.type === 'error' 
              ? 'text-destructive' 
              : errorDetails.type === 'info'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-primary'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${
            errorDetails.type === 'error' 
              ? 'text-destructive' 
              : errorDetails.type === 'info'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-foreground'
          }`}>
            {errorDetails.title}
          </h4>
          <p className={`text-sm mt-1 ${
            errorDetails.type === 'error' 
              ? 'text-destructive/80' 
              : errorDetails.type === 'info'
              ? 'text-blue-600/80 dark:text-blue-400/80'
              : 'text-muted-foreground'
          }`}>
            {errorDetails.message}
          </p>
          
          {errorDetails.action && (
            <div className="mt-3 flex gap-2">
              {errorDetails.action === 'login' && onLogin && (
                <button
                  onClick={onLogin}
                  className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
                >
                  {errorDetails.actionText}
                </button>
              )}
              {errorDetails.action === 'retry' && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
                >
                  {errorDetails.actionText}
                </button>
              )}
              {errorDetails.action === 'contact' && (
                <a
                  href="mailto:support@scailup.io"
                  className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
                >
                  {errorDetails.actionText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
