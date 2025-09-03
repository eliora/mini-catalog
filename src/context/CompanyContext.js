import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCompanySettings } from '../api/settings';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    companyName: 'קטלוג מוצרים',
    companyDescription: 'מערכת ניהול הזמנות',
    companyTagline: 'אתר מקצועי למוצרי יופי',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    invoiceFooter: 'מסמך זה הופק באופן אוטומטי על ידי מערכת ניהול ההזמנות'
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getCompanySettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading company settings:', error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    settings,
    loading,
    refreshSettings
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};
