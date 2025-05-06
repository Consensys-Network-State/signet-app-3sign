import * as React from 'react';
import { useForm } from 'react-hook-form';

export const FormContext = React.createContext<ReturnType<typeof useForm> | undefined>(undefined);

export const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormContext.Provider');
  }
  return context;
}; 