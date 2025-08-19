
declare global {
  interface Window {
    Cal: {
      (command: string, options?: any): void;
    };
  }
}

export {};
