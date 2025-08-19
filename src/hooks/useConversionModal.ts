
import { useState, useCallback } from 'react';

export const useConversionModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    console.log('=== OPENING MODAL ===');
    console.log('Current state before opening:', isOpen);
    console.log('About to call setIsOpen(true)');
    setIsOpen(true);
    console.log('Modal state set to true');
    console.log('=== MODAL OPENED ===');
  }, [isOpen]);

  const closeModal = useCallback(() => {
    console.log('=== CLOSING MODAL ===');
    console.log('Current state before closing:', isOpen);
    console.log('About to call setIsOpen(false)');
    setIsOpen(false);
    console.log('Modal state set to false');
    console.log('=== MODAL CLOSED ===');
  }, [isOpen]);

  console.log('useConversionModal hook - Current isOpen state:', isOpen);

  return {
    isOpen,
    openModal,
    closeModal,
  };
};
