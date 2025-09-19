'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { getGlobalRealtimeManager, createCompanySettingsSubscription } from '@/lib/realtime';
import { CompanyState, CompanySettings, ContactInfo } from '@/types/company';
import { RealtimeEvent } from '@/types/api';

const CompanyContext = createContext<CompanyState | null>(null);

// Default company settings
const DEFAULT_SETTINGS: CompanySettings = {
  id: '1',
  company_name: null,
  company_description: null,
  company_email: null,
  company_phone: null,
  company_address: null,
  company_website: null,
  tagline: '',
  logo_url: '',
  logo_url_extended: '',
  company_logo_extended: '',
  logo_url_compact: '',
  primary_color: '#1976d2',
  secondary_color: '#dc004e',
  timezone: 'Asia/Jerusalem',
  currency: 'ILS',
  is_vat_registered: true,
  tax_rate: 0.18,
  prices_include_tax: true,
  show_prices_with_tax: true,
  enable_tax_exempt: false,
  free_shipping_threshold: 0,
  standard_shipping_cost: 0,
  express_shipping_cost: 0,
  enable_local_delivery: true,
  invoice_footer_text: '',
  notification_settings: {
    categories: {
      orders: { sms: false, push: true, email: true, inApp: true },
      system: { sms: false, push: true, email: true, inApp: true },
      customers: { sms: false, push: false, email: false, inApp: true },
      inventory: { sms: false, push: false, email: true, inApp: true }
    }
  },
  maintenance_mode: false,
  debug_mode: false,
  enable_reviews: true,
  enable_wishlist: true,
  enable_notifications: true,
  session_timeout: 3600,
  max_login_attempts: 5,
  backup_frequency: 'daily',
  cache_duration: 300,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  // Legacy fields for backward compatibility
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
        .limit(1)
        .maybeSingle();

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
        setSettings(data as unknown as CompanySettings);
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
  const updateSettings = useCallback(async (updates: Partial<CompanySettings>): Promise<{ error?: string }> => {
    setIsLoading(true);
    setError(undefined);

    try {
      console.log('🔄 Updating company settings:', updates);
      console.log('🔄 Current settings ID:', settings?.id);
      console.log('🔄 Settings object:', settings);

      // Prepare the data to be sent - only include fields that are being updated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const settingsData: any = {
        id: settings?.id || '1', // Use existing ID or default to '1'
        updated_at: new Date().toISOString(),
      };

      // Only add fields that are actually provided in the updates
      Object.keys(updates).forEach(key => {
        if (key in updates && updates[key as keyof CompanySettings] !== undefined) {
          settingsData[key] = updates[key as keyof CompanySettings];
        }
      });

      console.log('📤 Sending to database:', settingsData);
      console.log('📤 SettingsData keys:', Object.keys(settingsData));
      console.log('📤 SettingsData values:', Object.values(settingsData));
      console.log('📤 SettingsData JSON:', JSON.stringify(settingsData, null, 2));

      console.log('🔗 Creating Supabase client...');
      console.log('🔗 Supabase client:', supabaseBrowserClient);
      
      console.log('📡 Starting Supabase upsert operation...');
      // Use upsert to handle both insert and update cases
      const result = await supabaseBrowserClient
        .from('settings')
        .upsert(settingsData, {
          onConflict: 'id'
        })
        .select()
        .single();
      
      console.log('🔍 Full Supabase result:', result);
      console.log('🔍 Result type:', typeof result);
      console.log('🔍 Result keys:', Object.keys(result));
      console.log('🔍 Result data:', result.data);
      console.log('🔍 Result error:', result.error);
      
      const { data, error } = result;

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Database error occurred');
      }
      
      console.log('📥 Data returned from database:', data);
      console.log('📊 Data type:', typeof data, 'Data length:', data ? Object.keys(data).length : 'null');
      console.log('📊 Data keys:', data ? Object.keys(data) : 'null');
      console.log('📊 Data values:', data ? Object.values(data) : 'null');
      console.log('📊 Data JSON:', data ? JSON.stringify(data, null, 2) : 'null');
      
      if (!data) {
        console.error('❌ No data returned from database');
        throw new Error('No data returned from database');
      }
      
      console.log('💾 Updating settings state...');
      console.log('💾 Previous settings:', settings);
      console.log('💾 New settings:', data);
      
      setSettings(data as unknown as CompanySettings);
      console.log('✅ Company settings saved successfully');
      console.log('✅ Settings state updated');

      setLastUpdated(new Date());
      return {};
    } catch (error) {
      console.error('❌ Error updating company settings:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to update company settings';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Handle Supabase error objects
        if ('message' in error) {
          errorMessage = (error as { message: string }).message;
        } else if ('error' in error) {
          errorMessage = (error as { error: string }).error;
        } else {
          // Log the full error object to understand its structure
          console.error('Full error object:', JSON.stringify(error, null, 2));
          errorMessage = 'Unknown error occurred';
        }
      }
      
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return settings?.company_name || DEFAULT_SETTINGS.company_name || '';
  }, [settings]);

  // Get contact information
  const getContactInfo = useCallback((): ContactInfo => {
    return {
      name: settings?.company_name || DEFAULT_SETTINGS.company_name || '',
      email: settings?.company_email || '',
      phone: settings?.company_phone || '',
      address: settings?.company_address || '',
      website: settings?.company_website || '',
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
