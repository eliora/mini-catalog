'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CompanyProvider } from '../context/CompanyContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </CartProvider>
    </AuthProvider>
  );
}
