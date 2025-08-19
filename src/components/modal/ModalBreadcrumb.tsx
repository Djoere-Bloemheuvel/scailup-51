
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ModalStep } from '@/hooks/useModalSteps';

interface ModalBreadcrumbProps {
  currentStep: ModalStep;
}

export const ModalBreadcrumb: React.FC<ModalBreadcrumbProps> = ({ currentStep }) => {
  const getStepTitle = (step: ModalStep) => {
    switch (step) {
      case 'initial':
        return 'Kies pad';
      case 'packages':
        return 'Pakket kiezen';
      case 'contact':
        return 'Gesprek aanvragen';
      default:
        return '';
    }
  };

  const steps = [
    { key: 'initial', title: getStepTitle('initial') },
    { key: currentStep === 'packages' ? 'packages' : 'contact', title: getStepTitle(currentStep) }
  ];

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <span className="font-medium">1. {steps[0].title}</span>
      {currentStep !== 'initial' && (
        <>
          <ArrowRight className="h-4 w-4" />
          <span className="font-medium text-foreground">2. {steps[1].title}</span>
        </>
      )}
    </div>
  );
};
