import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CompanyProvider } from '../context/CompanyContext';

export default function AppProviders({ children }) {
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


