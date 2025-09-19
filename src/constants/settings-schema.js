// ============================================================================
// SETTINGS SCHEMA CONSTANTS - Database Field Mappings
// ============================================================================
// Complete field definitions for the settings table based on the database schema
// ============================================================================

export const SETTINGS_TABLE = {
  name: 'settings',
  schema: 'public',
  
  // Field definitions with types, defaults, and constraints
  fields: {
    // Basic Company Information
    company_name: {
      type: 'varchar(255)',
      nullable: true,
      label: 'שם החברה',
      placeholder: 'הזן את שם החברה',
      maxLength: 255
    },
    company_description: {
      type: 'text',
      nullable: true,
      label: 'תיאור החברה',
      placeholder: 'תיאור קצר על החברה',
      multiline: true,
      rows: 3
    },
    company_email: {
      type: 'varchar(255)',
      nullable: true,
      label: 'אימייל החברה',
      placeholder: 'company@example.com',
      maxLength: 255,
      validation: 'email'
    },
    company_phone: {
      type: 'varchar(50)',
      nullable: true,
      label: 'טלפון החברה',
      placeholder: '050-1234567',
      maxLength: 50,
      validation: 'phone'
    },
    company_address: {
      type: 'text',
      nullable: true,
      label: 'כתובת החברה',
      placeholder: 'כתובת מלאה של החברה',
      multiline: true,
      rows: 2
    },
    business_name: {
      type: 'varchar(255)',
      nullable: true,
      label: 'שם העסק',
      placeholder: 'שם העסק הרשום',
      maxLength: 255
    },
    registration_number: {
      type: 'varchar(100)',
      nullable: true,
      label: 'מספר רישום',
      placeholder: '123456789',
      maxLength: 100
    },
    tax_id: {
      type: 'varchar(100)',
      nullable: true,
      label: 'ח.פ/ע.מ',
      placeholder: '123456789',
      maxLength: 100
    },
    tagline: {
      type: 'varchar(255)',
      nullable: true,
      label: 'סלוגן',
      placeholder: 'הסלוגן של החברה',
      maxLength: 255
    },

    // Logo and Branding
    company_logo: {
      type: 'varchar(500)',
      nullable: true,
      label: 'לוגו החברה',
      placeholder: 'URL ללוגו',
      maxLength: 500,
      validation: 'url'
    },
    logo_url: {
      type: 'varchar(500)',
      nullable: true,
      label: 'כתובת לוגו',
      placeholder: 'https://example.com/logo.png',
      maxLength: 500,
      validation: 'url'
    },
    primary_color: {
      type: 'varchar(7)',
      nullable: true,
      default: '#1976d2',
      label: 'צבע ראשי',
      placeholder: '#1976d2',
      validation: 'hexColor',
      constraint: '^#[0-9A-Fa-f]{6}$'
    },
    secondary_color: {
      type: 'varchar(7)',
      nullable: true,
      default: '#dc004e',
      label: 'צבע משני',
      placeholder: '#dc004e',
      validation: 'hexColor',
      constraint: '^#[0-9A-Fa-f]{6}$'
    },

    // Regional Settings
    timezone: {
      type: 'varchar(50)',
      nullable: true,
      default: 'Asia/Jerusalem',
      label: 'אזור זמן',
      placeholder: 'Asia/Jerusalem',
      maxLength: 50,
      options: [
        'Asia/Jerusalem',
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo'
      ]
    },
    currency: {
      type: 'varchar(3)',
      nullable: true,
      default: 'ILS',
      label: 'מטבע',
      placeholder: 'ILS',
      validation: 'currency',
      constraint: '^[A-Z]{3}$',
      options: ['ILS', 'USD', 'EUR', 'GBP']
    },

    // Tax Settings
    is_vat_registered: {
      type: 'boolean',
      nullable: true,
      default: true,
      label: 'רשום למע"מ'
    },
    tax_rate: {
      type: 'numeric(5,4)',
      nullable: true,
      default: 0.18,
      label: 'שיעור מע"מ',
      placeholder: '0.18',
      min: 0,
      max: 1,
      step: 0.01,
      validation: 'decimal'
    },
    prices_include_tax: {
      type: 'boolean',
      nullable: true,
      default: true,
      label: 'מחירים כוללים מע"מ'
    },
    show_prices_with_tax: {
      type: 'boolean',
      nullable: true,
      default: true,
      label: 'הצג מחירים עם מע"מ'
    },
    enable_tax_exempt: {
      type: 'boolean',
      nullable: true,
      default: false,
      label: 'אפשר פטור ממע"מ'
    },

    // Shipping Settings
    free_shipping_threshold: {
      type: 'numeric(10,2)',
      nullable: true,
      default: 0.00,
      label: 'סף משלוח חינם',
      placeholder: '0.00',
      min: 0,
      step: 0.01,
      validation: 'decimal'
    },
    standard_shipping_cost: {
      type: 'numeric(10,2)',
      nullable: true,
      default: 0.00,
      label: 'עלות משלוח רגיל',
      placeholder: '0.00',
      min: 0,
      step: 0.01,
      validation: 'decimal'
    },
    express_shipping_cost: {
      type: 'numeric(10,2)',
      nullable: true,
      default: 0.00,
      label: 'עלות משלוח מהיר',
      placeholder: '0.00',
      min: 0,
      step: 0.01,
      validation: 'decimal'
    },
    enable_local_delivery: {
      type: 'boolean',
      nullable: true,
      default: true,
      label: 'אפשר משלוח מקומי'
    },

    // Invoice Settings
    invoice_footer_text: {
      type: 'text',
      nullable: true,
      label: 'טקסט תחתון בחשבונית',
      placeholder: 'תודה על הקנייה!',
      multiline: true,
      rows: 3
    },

    // Notification Settings (JSONB)
    notification_settings: {
      type: 'jsonb',
      nullable: true,
      default: {
        categories: {
          orders: { sms: false, push: true, email: true, inApp: true },
          system: { sms: false, push: true, email: true, inApp: true },
          customers: { sms: false, push: false, email: false, inApp: true },
          inventory: { sms: false, push: false, email: true, inApp: true }
        }
      },
      label: 'הגדרות התראות',
      isComplex: true
    },

    // System Settings
    maintenance_mode: {
      type: 'boolean',
      nullable: true,
      default: false,
      label: 'מצב תחזוקה'
    },
    debug_mode: {
      type: 'boolean',
      nullable: true,
      default: false,
      label: 'מצב דיבוג'
    },
    enable_reviews: {
      type: 'boolean',
      nullable: true,
      default: true,
      label: 'אפשר ביקורות'
    },
    enable_wishlist: {
      type: 'boolean',
      nullable: true,
      default: true,
      label: 'אפשר רשימת משאלות'
    },
    enable_notifications: {
      type: 'boolean',
      nullable: true,
      default: true,
      label: 'אפשר התראות'
    },

    // Security Settings
    session_timeout: {
      type: 'integer',
      nullable: true,
      default: 3600,
      label: 'פסק זמן הפעלה (שניות)',
      placeholder: '3600',
      min: 300,
      max: 86400,
      step: 60,
      validation: 'integer'
    },
    max_login_attempts: {
      type: 'integer',
      nullable: true,
      default: 5,
      label: 'מקסימום ניסיונות התחברות',
      placeholder: '5',
      min: 1,
      max: 20,
      validation: 'integer'
    },

    // Performance Settings
    backup_frequency: {
      type: 'varchar(20)',
      nullable: true,
      default: 'daily',
      label: 'תדירות גיבוי',
      placeholder: 'daily',
      options: ['hourly', 'daily', 'weekly', 'monthly']
    },
    cache_duration: {
      type: 'integer',
      nullable: true,
      default: 300,
      label: 'משך זמן מטמון (שניות)',
      placeholder: '300',
      min: 60,
      max: 3600,
      step: 60,
      validation: 'integer'
    }
  },

  // Field groups for form organization
  fieldGroups: {
    company: {
      label: 'מידע על החברה',
      fields: [
        'company_name',
        'company_description',
        'company_email',
        'company_phone',
        'company_address',
        'business_name',
        'registration_number',
        'tax_id',
        'tagline'
      ]
    },
    branding: {
      label: 'מיתוג וצבעים',
      fields: [
        'company_logo',
        'logo_url',
        'primary_color',
        'secondary_color'
      ]
    },
    regional: {
      label: 'הגדרות אזוריות',
      fields: [
        'timezone',
        'currency'
      ]
    },
    tax: {
      label: 'הגדרות מע"מ',
      fields: [
        'is_vat_registered',
        'tax_rate',
        'prices_include_tax',
        'show_prices_with_tax',
        'enable_tax_exempt'
      ]
    },
    shipping: {
      label: 'הגדרות משלוח',
      fields: [
        'free_shipping_threshold',
        'standard_shipping_cost',
        'express_shipping_cost',
        'enable_local_delivery'
      ]
    },
    invoice: {
      label: 'הגדרות חשבונית',
      fields: [
        'invoice_footer_text'
      ]
    },
    notifications: {
      label: 'הגדרות התראות',
      fields: [
        'notification_settings',
        'enable_notifications'
      ]
    },
    system: {
      label: 'הגדרות מערכת',
      fields: [
        'maintenance_mode',
        'debug_mode',
        'enable_reviews',
        'enable_wishlist'
      ]
    },
    security: {
      label: 'הגדרות אבטחה',
      fields: [
        'session_timeout',
        'max_login_attempts'
      ]
    },
    performance: {
      label: 'הגדרות ביצועים',
      fields: [
        'backup_frequency',
        'cache_duration'
      ]
    }
  },

  // Validation rules
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\-\+\(\)\s]+$/,
    url: /^https?:\/\/.+/,
    hexColor: /^#[0-9A-Fa-f]{6}$/,
    currency: /^[A-Z]{3}$/,
    decimal: /^\d+(\.\d+)?$/,
    integer: /^\d+$/
  },

  // Default values for new settings
  defaults: {
    company_name: '',
    company_description: '',
    company_email: '',
    company_phone: '',
    company_address: '',
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
    free_shipping_threshold: 0.00,
    standard_shipping_cost: 0.00,
    express_shipping_cost: 0.00,
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
    cache_duration: 300
  }
};

// Helper functions for working with settings
export const SETTINGS_HELPERS = {
  // Get field configuration by name
  getFieldConfig: (fieldName) => {
    return SETTINGS_TABLE.fields[fieldName] || null;
  },

  // Get all fields in a group
  getGroupFields: (groupName) => {
    const group = SETTINGS_TABLE.fieldGroups[groupName];
    return group ? group.fields : [];
  },

  // Validate field value
  validateField: (fieldName, value) => {
    const field = SETTINGS_TABLE.fields[fieldName];
    if (!field) return { isValid: true, error: null };

    // Required field validation
    if (!field.nullable && (value === null || value === undefined || value === '')) {
      return { isValid: false, error: `${field.label} הוא שדה חובה` };
    }

    // Type-specific validation
    if (value && field.validation) {
      const regex = SETTINGS_TABLE.validation[field.validation];
      if (regex && !regex.test(value)) {
        return { isValid: false, error: `${field.label} אינו תקין` };
      }
    }

    // Range validation
    if (value && field.min !== undefined && value < field.min) {
      return { isValid: false, error: `${field.label} חייב להיות לפחות ${field.min}` };
    }
    if (value && field.max !== undefined && value > field.max) {
      return { isValid: false, error: `${field.label} חייב להיות לכל היותר ${field.max}` };
    }

    // Length validation
    if (value && field.maxLength && value.length > field.maxLength) {
      return { isValid: false, error: `${field.label} חייב להיות לכל היותר ${field.maxLength} תווים` };
    }

    return { isValid: true, error: null };
  },

  // Get default value for field
  getDefaultValue: (fieldName) => {
    const field = SETTINGS_TABLE.fields[fieldName];
    return field ? field.default : null;
  },

  // Format field value for display
  formatValue: (fieldName, value) => {
    const field = SETTINGS_TABLE.fields[fieldName];
    if (!field || value === null || value === undefined) return '-';

    switch (field.type) {
      case 'boolean':
        return value ? 'כן' : 'לא';
      case 'numeric(5,4)':
        return `${(value * 100).toFixed(2)}%`;
      case 'numeric(10,2)':
        return `₪${value.toFixed(2)}`;
      case 'integer':
        return value.toString();
      default:
        return value.toString();
    }
  },

  // Get field options for select fields
  getFieldOptions: (fieldName) => {
    const field = SETTINGS_TABLE.fields[fieldName];
    return field ? field.options : [];
  }
};

export default SETTINGS_TABLE;
