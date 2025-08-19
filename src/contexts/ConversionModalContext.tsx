
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { ConversionModalRebuilt } from '@/components/ConversionModalRebuilt';

interface ConversionModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ConversionModalContext = createContext<ConversionModalContextType | undefined>(undefined);

export const useConversionModalContext = () => {
  const context = useContext(ConversionModalContext);
  if (context === undefined) {
    throw new Error('useConversionModalContext must be used within a ConversionModalProvider');
  }
  return context;
};

interface ConversionModalProviderProps {
  children: ReactNode;
}

export const ConversionModalProvider: React.FC<ConversionModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const modalState = {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
  };

  return (
    <ConversionModalContext.Provider value={modalState}>
      {children}
      <ConversionModalRebuilt />
    </ConversionModalContext.Provider>
  );
};
