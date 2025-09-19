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
  business_name: '',
  registration_number: '',
  tax_id: '',
  tagline: '',
  company_logo: '',
  logo_url: '',
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
  contact_email: '',
  contact_phone: '',
  address: '',
  website: '',
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
  const updateSettings = useCallback(async (updates: Partial<CompanySettings>): Promise<{ error?: string }> => {
    setIsLoading(true);
    setError(undefined);

    try {
      console.log('🔄 Updating company settings:', updates);
      console.log('🔄 Current settings ID:', settings?.id);
      console.log('🔄 Settings object:', settings);

      // Prepare the data to be sent
      const settingsData = {
        id: settings?.id || '1', // Use existing ID or default to '1'
        company_name: updates.company_name ?? DEFAULT_SETTINGS.company_name,
        company_description: updates.company_description ?? DEFAULT_SETTINGS.company_description,
        company_email: updates.company_email ?? DEFAULT_SETTINGS.company_email,
        company_phone: updates.company_phone ?? DEFAULT_SETTINGS.company_phone,
        company_address: updates.company_address ?? DEFAULT_SETTINGS.company_address,
        company_logo: updates.company_logo ?? DEFAULT_SETTINGS.company_logo,
        tagline: updates.tagline ?? DEFAULT_SETTINGS.tagline,
        logo_url: updates.logo_url ?? DEFAULT_SETTINGS.logo_url,
        primary_color: updates.primary_color ?? DEFAULT_SETTINGS.primary_color,
        secondary_color: updates.secondary_color ?? DEFAULT_SETTINGS.secondary_color,
        timezone: updates.timezone ?? DEFAULT_SETTINGS.timezone,
        business_name: updates.business_name ?? DEFAULT_SETTINGS.business_name,
        registration_number: updates.registration_number ?? DEFAULT_SETTINGS.registration_number,
        tax_id: updates.tax_id ?? DEFAULT_SETTINGS.tax_id,
        is_vat_registered: updates.is_vat_registered ?? DEFAULT_SETTINGS.is_vat_registered,
        currency: updates.currency ?? DEFAULT_SETTINGS.currency,
        tax_rate: updates.tax_rate ?? DEFAULT_SETTINGS.tax_rate,
        prices_include_tax: updates.prices_include_tax ?? DEFAULT_SETTINGS.prices_include_tax,
        show_prices_with_tax: updates.show_prices_with_tax ?? DEFAULT_SETTINGS.show_prices_with_tax,
        enable_tax_exempt: updates.enable_tax_exempt ?? DEFAULT_SETTINGS.enable_tax_exempt,
        invoice_footer_text: updates.invoice_footer_text ?? DEFAULT_SETTINGS.invoice_footer_text,
        free_shipping_threshold: updates.free_shipping_threshold ?? DEFAULT_SETTINGS.free_shipping_threshold,
        standard_shipping_cost: updates.standard_shipping_cost ?? DEFAULT_SETTINGS.standard_shipping_cost,
        express_shipping_cost: updates.express_shipping_cost ?? DEFAULT_SETTINGS.express_shipping_cost,
        enable_local_delivery: updates.enable_local_delivery ?? DEFAULT_SETTINGS.enable_local_delivery,
        notification_settings: updates.notification_settings ?? DEFAULT_SETTINGS.notification_settings,
        maintenance_mode: updates.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode,
        debug_mode: updates.debug_mode ?? DEFAULT_SETTINGS.debug_mode,
        enable_reviews: updates.enable_reviews ?? DEFAULT_SETTINGS.enable_reviews,
        enable_wishlist: updates.enable_wishlist ?? DEFAULT_SETTINGS.enable_wishlist,
        enable_notifications: updates.enable_notifications ?? DEFAULT_SETTINGS.enable_notifications,
        session_timeout: updates.session_timeout ?? DEFAULT_SETTINGS.session_timeout,
        max_login_attempts: updates.max_login_attempts ?? DEFAULT_SETTINGS.max_login_attempts,
        backup_frequency: updates.backup_frequency ?? DEFAULT_SETTINGS.backup_frequency,
        cache_duration: updates.cache_duration ?? DEFAULT_SETTINGS.cache_duration,
        updated_at: new Date().toISOString(),
      };

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
      
      setSettings(data as CompanySettings);
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
      email: settings?.company_email || settings?.contact_email || '',
      phone: settings?.company_phone || settings?.contact_phone || '',
      address: settings?.company_address || settings?.address || '',
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
