'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { getGlobalRealtimeManager, createCompanySettingsSubscription } from '@/lib/realtime';
import { CompanyState, CompanySettings, ContactInfo, CompanyFormData } from '@/types/company';
import { RealtimeEvent } from '@/types/api';

const CompanyContext = createContext<CompanyState | null>(null);

// Default company settings
const DEFAULT_SETTINGS: CompanySettings = {
  id: '1',
  company_name: 'Jean Darcel',
  company_description: 'מערכת ניהול הזמנות',
  contact_email: '',
  contact_phone: '',
  address: '',
  website: '',
  logo_url: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();

  // Load company settings from database
  const loadSettings = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(undefined);

    try {
      console.log('🏢 Loading company settings...');
      
      const { data, error } = await supabaseBrowserClient
        .from('settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No company settings found, use defaults
          console.log('📝 No company settings found, using defaults');
          setSettings(DEFAULT_SETTINGS);
        } else {
          throw error;
        }
      } else {
        console.log('✅ Company settings loaded:', data);
        setSettings(data as CompanySettings);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error loading company settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load company settings');
      // Fallback to default settings
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update company settings
  const updateSettings = useCallback(async (updates: Partial<CompanyFormData>): Promise<{ error?: string }> => {
    setIsLoading(true);
    setError(undefined);

    try {
      console.log('🔄 Updating company settings:', updates);

      // First, try to update existing settings
      const { data, error } = await supabaseBrowserClient
        .from('settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id || '1')
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existing settings, create new ones
          const { data: newData, error: insertError } = await supabaseBrowserClient
            .from('settings')
            .insert({
              ...DEFAULT_SETTINGS,
              ...updates,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) throw insertError;
          
          setSettings(newData as CompanySettings);
          console.log('✅ Company settings created');
        } else {
          throw error;
        }
      } else {
        setSettings(data as CompanySettings);
        console.log('✅ Company settings updated');
      }

      setLastUpdated(new Date());
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update company settings';
      console.error('❌ Error updating company settings:', error);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [settings?.id]);

  // Refresh settings
  const refreshSettings = useCallback(async (): Promise<void> => {
    await loadSettings();
  }, [loadSettings]);

  // Get specific setting value
  const getSetting = useCallback(<K extends keyof CompanySettings>(key: K): CompanySettings[K] | undefined => {
    return settings?.[key];
  }, [settings]);

  // Get display name
  const getDisplayName = useCallback((): string => {
    return settings?.company_name || DEFAULT_SETTINGS.company_name;
  }, [settings]);

  // Get contact information
  const getContactInfo = useCallback((): ContactInfo => {
    return {
      name: settings?.company_name || DEFAULT_SETTINGS.company_name,
      email: settings?.contact_email || '',
      phone: settings?.contact_phone || '',
      address: settings?.address || '',
      website: settings?.website || '',
    };
  }, [settings]);

  // Initialize and set up real-time subscription
  useEffect(() => {
    // Load initial settings
    loadSettings();

    // Set up real-time subscription for company settings changes
    const realtimeManager = getGlobalRealtimeManager(supabaseBrowserClient);
    
    const subscriptionId = createCompanySettingsSubscription(
      supabaseBrowserClient,
      (event: RealtimeEvent) => {
        console.log('🔄 Company settings real-time update:', event.eventType);
        
        if (event.eventType === 'UPDATE' && event.new) {
          setSettings(event.new as CompanySettings);
          setLastUpdated(new Date());
          console.log('✅ Company settings updated via real-time');
        }
      }
    );

    return () => {
      // Cleanup subscription
      realtimeManager.unsubscribe(subscriptionId);
    };
  }, [loadSettings]);

  const value = useMemo((): CompanyState => ({
    // State
    settings,
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    updateSettings,
    refreshSettings,
    
    // Utilities
    getSetting,
    getDisplayName,
    getContactInfo,
  }), [
    settings,
    isLoading,
    error,
    lastUpdated,
    updateSettings,
    refreshSettings,
    getSetting,
    getDisplayName,
    getContactInfo,
  ]);

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyState => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
