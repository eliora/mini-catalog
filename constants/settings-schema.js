// ============================================================================
// SETTINGS TABLE SCHEMA - Database Constants
// ============================================================================
// Complete schema definition for the settings table
// ============================================================================

export const SETTINGS_TABLE = {
  name: 'settings',
  schema: 'public',
  
  // Column definitions
  columns: {
    id: {
      type: 'uuid',
      nullable: false,
      primary: true,
      default: 'extensions.uuid_generate_v4()'
    },
    // General company settings
    company_name: {
      type: 'varchar(255)',
      nullable: true
    },
    company_description: {
      type: 'text',
      nullable: true
    },
    company_email: {
      type: 'varchar(255)',
      nullable: true
    },
    company_phone: {
      type: 'varchar(50)',
      nullable: true
    },
    company_address: {
      type: 'text',
      nullable: true
    },
    company_logo: {
      type: 'varchar(500)',
      nullable: true
    },
    tagline: {
      type: 'varchar(255)',
      nullable: true
    },
    logo_url: {
      type: 'varchar(500)',
      nullable: true
    },
    primary_color: {
      type: 'varchar(7)',
      nullable: true,
      default: '#1976d2'
    },
    secondary_color: {
      type: 'varchar(7)',
      nullable: true,
      default: '#dc004e'
    },
    timezone: {
      type: 'varchar(50)',
      nullable: true,
      default: 'Asia/Jerusalem'
    },
    // Business settings
    business_name: {
      type: 'varchar(255)',
      nullable: true
    },
    registration_number: {
      type: 'varchar(100)',
      nullable: true
    },
    tax_id: {
      type: 'varchar(100)',
      nullable: true
    },
    is_vat_registered: {
      type: 'boolean',
      nullable: true,
      default: true
    },
    // Financial settings
    currency: {
      type: 'varchar(3)',
      nullable: false,
      default: 'ILS'
    },
    tax_rate: {
      type: 'decimal(5,4)',
      nullable: false,
      default: 0.18
    },
    prices_include_tax: {
      type: 'boolean',
      nullable: true,
      default: true
    },
    show_prices_with_tax: {
      type: 'boolean',
      nullable: true,
      default: true
    },
    enable_tax_exempt: {
      type: 'boolean',
      nullable: true,
      default: false
    },
    invoice_footer_text: {
      type: 'text',
      nullable: true
    },
    // Shipping settings
    free_shipping_threshold: {
      type: 'decimal(10,2)',
      nullable: true,
      default: 0.00
    },
    standard_shipping_cost: {
      type: 'decimal(10,2)',
      nullable: true,
      default: 0.00
    },
    express_shipping_cost: {
      type: 'decimal(10,2)',
      nullable: true,
      default: 0.00
    },
    enable_local_delivery: {
      type: 'boolean',
      nullable: true,
      default: true
    },
    // Notification settings (JSONB)
    notification_settings: {
      type: 'jsonb',
      nullable: true,
      default: {
        categories: {
          orders: { email: true, sms: false, push: true, inApp: true },
          inventory: { email: true, sms: false, push: false, inApp: true },
          customers: { email: false, sms: false, push: false, inApp: true },
          system: { email: true, sms: false, push: true, inApp: true }
        }
      }
    },
    // System settings
    maintenance_mode: {
      type: 'boolean',
      nullable: true,
      default: false
    },
    debug_mode: {
      type: 'boolean',
      nullable: true,
      default: false
    },
    enable_reviews: {
      type: 'boolean',
      nullable: true,
      default: true
    },
    enable_wishlist: {
      type: 'boolean',
      nullable: true,
      default: true
    },
    enable_notifications: {
      type: 'boolean',
      nullable: true,
      default: true
    },
    session_timeout: {
      type: 'integer',
      nullable: true,
      default: 3600
    },
    max_login_attempts: {
      type: 'integer',
      nullable: true,
      default: 5
    },
    backup_frequency: {
      type: 'varchar(20)',
      nullable: true,
      default: 'daily'
    },
    cache_duration: {
      type: 'integer',
      nullable: true,
      default: 300
    },
    // Timestamps
    created_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    },
    updated_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    }
  },

  // Constraints
  constraints: {
    primary: 'settings_pkey',
    check: [
      'chk_settings_currency',
      'chk_settings_tax_rate',
      'chk_settings_primary_color',
      'chk_settings_secondary_color',
      'chk_settings_shipping_costs',
      'chk_settings_session_timeout',
      'chk_settings_max_login_attempts'
    ]
  },

  // Indexes
  indexes: [
    'idx_settings_company_name',
    'idx_settings_currency',
    'idx_settings_created_at',
    'idx_settings_updated_at',
    'idx_settings_notification_settings'
  ],

  // Triggers
  triggers: [
    'trigger_update_settings_updated_at'
  ],

  // Setting categories
  categories: {
    GENERAL: 'general',
    COMPANY: 'company',
    FINANCIAL: 'financial',
    SHIPPING: 'shipping',
    NOTIFICATIONS: 'notifications',
    SYSTEM: 'system'
  },

  // Currency options
  currencies: {
    ILS: 'ILS', // Israeli Shekel
    USD: 'USD', // US Dollar
    EUR: 'EUR', // Euro
    GBP: 'GBP'  // British Pound
  },

  // Timezone options
  timezones: {
    JERUSALEM: 'Asia/Jerusalem',
    UTC: 'UTC',
    NEW_YORK: 'America/New_York',
    LONDON: 'Europe/London'
  },

  // Backup frequency options
  backupFrequencies: {
    HOURLY: 'hourly',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  },

  // RLS Policies
  policies: [
    'Admins can view all settings',
    'Admins can update all settings',
    'Users can view public settings'
  ]
};

// Helper functions for working with settings
export const SETTINGS_HELPERS = {
  // Get default notification settings structure
  getDefaultNotificationSettings: () => ({
    categories: {
      orders: { email: true, sms: false, push: true, inApp: true },
      inventory: { email: true, sms: false, push: false, inApp: true },
      customers: { email: false, sms: false, push: false, inApp: true },
      system: { email: true, sms: false, push: true, inApp: true }
    }
  }),

  // Validate hex color format
  isValidHexColor: (color) => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(color);
  },

  // Validate currency code (ISO 4217)
  isValidCurrency: (currency) => {
    return Object.values(SETTINGS_TABLE.currencies).includes(currency);
  },

  // Format tax rate as percentage
  formatTaxRate: (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  },

  // Calculate price with tax
  calculatePriceWithTax: (price, taxRate) => {
    return price * (1 + taxRate);
  },

  // Calculate tax amount
  calculateTaxAmount: (price, taxRate) => {
    return price * taxRate;
  },

  // Format currency amount
  formatCurrency: (amount, currency = 'ILS', locale = 'he-IL') => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  },

  // Check if free shipping applies
  qualifiesForFreeShipping: (orderTotal, freeShippingThreshold) => {
    return orderTotal >= freeShippingThreshold;
  },

  // Get shipping cost
  getShippingCost: (orderTotal, settings, shippingType = 'standard') => {
    if (SETTINGS_HELPERS.qualifiesForFreeShipping(orderTotal, settings.free_shipping_threshold)) {
      return 0;
    }
    
    switch (shippingType) {
      case 'express':
        return settings.express_shipping_cost || 0;
      case 'standard':
      default:
        return settings.standard_shipping_cost || 0;
    }
  },

  // Validate settings data
  validateSettings: (settings) => {
    const errors = [];
    
    // Validate colors
    if (settings.primary_color && !SETTINGS_HELPERS.isValidHexColor(settings.primary_color)) {
      errors.push('Invalid primary color format');
    }
    if (settings.secondary_color && !SETTINGS_HELPERS.isValidHexColor(settings.secondary_color)) {
      errors.push('Invalid secondary color format');
    }
    
    // Validate currency
    if (settings.currency && !SETTINGS_HELPERS.isValidCurrency(settings.currency)) {
      errors.push('Invalid currency code');
    }
    
    // Validate tax rate
    if (settings.tax_rate && (settings.tax_rate < 0 || settings.tax_rate > 1)) {
      errors.push('Tax rate must be between 0 and 1');
    }
    
    // Validate shipping costs
    if (settings.free_shipping_threshold && settings.free_shipping_threshold < 0) {
      errors.push('Free shipping threshold cannot be negative');
    }
    if (settings.standard_shipping_cost && settings.standard_shipping_cost < 0) {
      errors.push('Standard shipping cost cannot be negative');
    }
    if (settings.express_shipping_cost && settings.express_shipping_cost < 0) {
      errors.push('Express shipping cost cannot be negative');
    }
    
    // Validate session timeout
    if (settings.session_timeout && settings.session_timeout < 300) {
      errors.push('Session timeout must be at least 5 minutes (300 seconds)');
    }
    
    // Validate max login attempts
    if (settings.max_login_attempts && (settings.max_login_attempts < 1 || settings.max_login_attempts > 20)) {
      errors.push('Max login attempts must be between 1 and 20');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get notification setting for specific category and type
  getNotificationSetting: (notificationSettings, category, type) => {
    try {
      return notificationSettings?.categories?.[category]?.[type] || false;
    } catch {
      return false;
    }
  },

  // Update notification setting
  updateNotificationSetting: (notificationSettings, category, type, value) => {
    const settings = { ...notificationSettings };
    if (!settings.categories) settings.categories = {};
    if (!settings.categories[category]) settings.categories[category] = {};
    settings.categories[category][type] = value;
    return settings;
  },

  // Get setting by category
  getSettingsByCategory: (allSettings, category) => {
    const categoryFields = {
      general: ['company_name', 'tagline', 'company_description', 'logo_url', 'primary_color', 'secondary_color', 'timezone'],
      company: ['company_name', 'business_name', 'company_email', 'company_phone', 'company_address', 'registration_number', 'tax_id', 'is_vat_registered'],
      financial: ['currency', 'tax_rate', 'prices_include_tax', 'show_prices_with_tax', 'enable_tax_exempt', 'invoice_footer_text'],
      shipping: ['free_shipping_threshold', 'standard_shipping_cost', 'express_shipping_cost', 'enable_local_delivery'],
      notifications: ['notification_settings', 'enable_notifications'],
      system: ['maintenance_mode', 'debug_mode', 'enable_reviews', 'enable_wishlist', 'session_timeout', 'max_login_attempts', 'backup_frequency', 'cache_duration']
    };
    
    const fields = categoryFields[category] || [];
    const result = {};
    fields.forEach(field => {
      if (allSettings[field] !== undefined) {
        result[field] = allSettings[field];
      }
    });
    return result;
  }
};

// SQL queries for common operations
export const SETTINGS_QUERIES = {
  // Select all settings (should only be one record)
  SELECT_ALL: `
    SELECT * FROM public.settings LIMIT 1
  `,
  
  // Select settings by category
  SELECT_GENERAL: `
    SELECT company_name, tagline, company_description, logo_url, 
           primary_color, secondary_color, timezone
    FROM public.settings LIMIT 1
  `,
  
  SELECT_COMPANY: `
    SELECT company_name, business_name, company_email, company_phone, 
           company_address, registration_number, tax_id, is_vat_registered
    FROM public.settings LIMIT 1
  `,
  
  SELECT_FINANCIAL: `
    SELECT currency, tax_rate, prices_include_tax, show_prices_with_tax, 
           enable_tax_exempt, invoice_footer_text
    FROM public.settings LIMIT 1
  `,
  
  SELECT_SHIPPING: `
    SELECT free_shipping_threshold, standard_shipping_cost, 
           express_shipping_cost, enable_local_delivery
    FROM public.settings LIMIT 1
  `,
  
  SELECT_NOTIFICATIONS: `
    SELECT notification_settings, enable_notifications
    FROM public.settings LIMIT 1
  `,
  
  SELECT_SYSTEM: `
    SELECT maintenance_mode, debug_mode, enable_reviews, enable_wishlist,
           session_timeout, max_login_attempts, backup_frequency, cache_duration
    FROM public.settings LIMIT 1
  `,
  
  // Update specific settings categories
  UPDATE_GENERAL: `
    UPDATE public.settings 
    SET company_name = $1, tagline = $2, company_description = $3, 
        logo_url = $4, primary_color = $5, secondary_color = $6, timezone = $7
    RETURNING *
  `,
  
  UPDATE_COMPANY: `
    UPDATE public.settings 
    SET company_name = $1, business_name = $2, company_email = $3, 
        company_phone = $4, company_address = $5, registration_number = $6, 
        tax_id = $7, is_vat_registered = $8
    RETURNING *
  `,
  
  UPDATE_FINANCIAL: `
    UPDATE public.settings 
    SET currency = $1, tax_rate = $2, prices_include_tax = $3, 
        show_prices_with_tax = $4, enable_tax_exempt = $5, invoice_footer_text = $6
    RETURNING *
  `,
  
  UPDATE_SHIPPING: `
    UPDATE public.settings 
    SET free_shipping_threshold = $1, standard_shipping_cost = $2, 
        express_shipping_cost = $3, enable_local_delivery = $4
    RETURNING *
  `,
  
  UPDATE_NOTIFICATIONS: `
    UPDATE public.settings 
    SET notification_settings = $1, enable_notifications = $2
    RETURNING *
  `,
  
  UPDATE_SYSTEM: `
    UPDATE public.settings 
    SET maintenance_mode = $1, debug_mode = $2, enable_reviews = $3, 
        enable_wishlist = $4, session_timeout = $5, max_login_attempts = $6, 
        backup_frequency = $7, cache_duration = $8
    RETURNING *
  `,
  
  // Get specific setting value
  GET_SETTING: `
    SELECT $1 FROM public.settings LIMIT 1
  `,
  
  // Update specific setting
  UPDATE_SETTING: `
    UPDATE public.settings SET $1 = $2 RETURNING *
  `,
  
  // Initialize default settings
  INIT_SETTINGS: `
    INSERT INTO public.settings (
      company_name, currency, tax_rate, is_vat_registered, 
      timezone, primary_color, secondary_color
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO NOTHING
    RETURNING *
  `
};

// Settings templates for different business types
export const SETTINGS_TEMPLATES = {
  // Israeli business defaults
  ISRAELI_BUSINESS: {
    currency: 'ILS',
    tax_rate: 0.17, // Current Israeli VAT rate
    is_vat_registered: true,
    timezone: 'Asia/Jerusalem',
    enable_tax_exempt: true,
    prices_include_tax: true,
    show_prices_with_tax: true
  },
  
  // International business defaults
  INTERNATIONAL_BUSINESS: {
    currency: 'USD',
    tax_rate: 0.00,
    is_vat_registered: false,
    timezone: 'UTC',
    enable_tax_exempt: false,
    prices_include_tax: false,
    show_prices_with_tax: false
  },
  
  // Basic e-commerce defaults
  BASIC_ECOMMERCE: {
    enable_reviews: true,
    enable_wishlist: true,
    enable_notifications: true,
    free_shipping_threshold: 100.00,
    standard_shipping_cost: 15.00,
    express_shipping_cost: 30.00,
    enable_local_delivery: true
  }
};

export default SETTINGS_TABLE;
