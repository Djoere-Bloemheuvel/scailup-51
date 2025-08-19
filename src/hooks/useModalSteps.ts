
import { useState, useCallback } from 'react';

export type ModalStep = 'initial' | 'packages' | 'contact';

export const useModalSteps = () => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('initial');
  const [previousStep, setPreviousStep] = useState<ModalStep | null>(null);

  const goToStep = useCallback((step: ModalStep) => {
    setPreviousStep(currentStep);
    setCurrentStep(step);
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (previousStep) {
      setCurrentStep(previousStep);
      setPreviousStep(null);
    } else {
      setCurrentStep('initial');
    }
  }, [previousStep]);

  const reset = useCallback(() => {
    setCurrentStep('initial');
    setPreviousStep(null);
  }, []);

  return {
    currentStep,
    goToStep,
    goBack,
    reset,
    canGoBack: currentStep !== 'initial'
  };
};
