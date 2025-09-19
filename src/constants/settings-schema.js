// ============================================================================
// SETTINGS SCHEMA CONSTANTS - Database Field Mappings
// ============================================================================
// Complete field definitions for the settings table based on the actual database schema
// ============================================================================

export const SETTINGS_TABLE = {
  name: 'settings',
  schema: 'public',
  
  // Field definitions with types, defaults, and constraints
  fields: {
    // Primary Key
    id: {
      type: 'uuid',
      nullable: false,
      defaultValue: 'extensions.uuid_generate_v4()',
      isPrimaryKey: true
    },

    // Basic Company Information
    company_name: {
      type: 'character varying(255)',
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
      type: 'character varying(255)',
      nullable: true,
      label: 'אימייל החברה',
      placeholder: 'company@example.com',
      maxLength: 255,
      validation: 'email'
    },
    company_phone: {
      type: 'character varying(50)',
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
    company_logo: {
      type: 'character varying(500)',
      nullable: true,
      label: 'לוגו החברה',
      placeholder: 'URL של הלוגו',
      maxLength: 500,
      validation: 'url'
    },
    tagline: {
      type: 'character varying(255)',
      nullable: true,
      label: 'סלוגן',
      placeholder: 'סלוגן החברה',
      maxLength: 255
    },
    logo_url: {
      type: 'character varying(500)',
      nullable: true,
      label: 'URL לוגו',
      placeholder: 'https://example.com/logo.png',
      maxLength: 500,
      validation: 'url'
    },

    // Branding Settings
    primary_color: {
      type: 'character varying(7)',
      nullable: true,
      defaultValue: '#1976d2',
      label: 'צבע ראשי',
      placeholder: '#1976d2',
      maxLength: 7,
      validation: 'hexColor'
    },
    secondary_color: {
      type: 'character varying(7)',
      nullable: true,
      defaultValue: '#dc004e',
      label: 'צבע משני',
      placeholder: '#dc004e',
      maxLength: 7,
      validation: 'hexColor'
    },
    timezone: {
      type: 'character varying(50)',
      nullable: true,
      defaultValue: 'Asia/Jerusalem',
      label: 'אזור זמן',
      placeholder: 'Asia/Jerusalem',
      maxLength: 50
    },

    // Business Information
    business_name: {
      type: 'character varying(255)',
      nullable: true,
      label: 'שם העסק',
      placeholder: 'שם העסק הרשמי',
      maxLength: 255
    },
    registration_number: {
      type: 'character varying(100)',
      nullable: true,
      label: 'מספר רישום',
      placeholder: 'מספר רישום העסק',
      maxLength: 100
    },
    tax_id: {
      type: 'character varying(100)',
      nullable: true,
      label: 'מספר עוסק מורשה',
      placeholder: 'מספר עוסק מורשה',
      maxLength: 100
    },
    is_vat_registered: {
      type: 'boolean',
      nullable: true,
      defaultValue: true,
      label: 'עוסק מורשה',
      description: 'האם החברה רשומה כעוסק מורשה'
    },
    currency: {
      type: 'character varying(3)',
      nullable: true,
      defaultValue: 'ILS',
      label: 'מטבע',
      placeholder: 'ILS',
      maxLength: 3,
      validation: 'currency'
    },

    // Tax Settings
    tax_rate: {
      type: 'numeric(5,4)',
      nullable: true,
      defaultValue: 0.18,
      label: 'שיעור מע״מ',
      placeholder: '0.18',
      validation: 'decimal',
      min: 0,
      max: 1
    },
    prices_include_tax: {
      type: 'boolean',
      nullable: true,
      defaultValue: true,
      label: 'המחירים כוללים מע״מ',
      description: 'האם המחירים כוללים מע״מ'
    },
    show_prices_with_tax: {
      type: 'boolean',
      nullable: true,
      defaultValue: true,
      label: 'הצג מחירים עם מע״מ',
      description: 'האם להציג מחירים עם מע״מ'
    },
    enable_tax_exempt: {
      type: 'boolean',
      nullable: true,
      defaultValue: false,
      label: 'אפשר פטור ממע״מ',
      description: 'האם לאפשר פטור ממע״מ'
    },
    invoice_footer_text: {
      type: 'text',
      nullable: true,
      label: 'טקסט תחתון בחשבונית',
      placeholder: 'תודה שבחרתם בנו!',
      multiline: true,
      rows: 3
    },

    // Shipping Settings
    free_shipping_threshold: {
      type: 'numeric(10,2)',
      nullable: true,
      defaultValue: 0.00,
      label: 'סכום משלוח חינם',
      placeholder: '0.00',
      validation: 'decimal',
      min: 0
    },
    standard_shipping_cost: {
      type: 'numeric(10,2)',
      nullable: true,
      defaultValue: 0.00,
      label: 'עלות משלוח רגיל',
      placeholder: '0.00',
      validation: 'decimal',
      min: 0
    },
    express_shipping_cost: {
      type: 'numeric(10,2)',
      nullable: true,
      defaultValue: 0.00,
      label: 'עלות משלוח מהיר',
      placeholder: '0.00',
      validation: 'decimal',
      min: 0
    },
    enable_local_delivery: {
      type: 'boolean',
      nullable: true,
      defaultValue: true,
      label: 'אפשר משלוח מקומי',
      description: 'האם לאפשר משלוח מקומי'
    },

    // Notification Settings
    notification_settings: {
      type: 'jsonb',
      nullable: true,
      defaultValue: '{"categories": {"orders": {"sms": false, "push": true, "email": true, "inApp": true}, "system": {"sms": false, "push": true, "email": true, "inApp": true}, "customers": {"sms": false, "push": false, "email": false, "inApp": true}, "inventory": {"sms": false, "push": false, "email": true, "inApp": true}}}',
      label: 'הגדרות התראות',
      description: 'הגדרות התראות לפי קטגוריות'
    },

    // System Settings
    maintenance_mode: {
      type: 'boolean',
      nullable: true,
      defaultValue: false,
      label: 'מצב תחזוקה',
      description: 'האם האתר במצב תחזוקה'
    },
    debug_mode: {
      type: 'boolean',
      nullable: true,
      defaultValue: false,
      label: 'מצב דיבוג',
      description: 'האם להציג מידע דיבוג'
    },
    enable_reviews: {
      type: 'boolean',
      nullable: true,
      defaultValue: true,
      label: 'אפשר ביקורות',
      description: 'האם לאפשר ביקורות על מוצרים'
    },
    enable_wishlist: {
      type: 'boolean',
      nullable: true,
      defaultValue: true,
      label: 'אפשר רשימת משאלות',
      description: 'האם לאפשר רשימת משאלות'
    },
    enable_notifications: {
      type: 'boolean',
      nullable: true,
      defaultValue: true,
      label: 'אפשר התראות',
      description: 'האם לאפשר התראות'
    },

    // Security Settings
    session_timeout: {
      type: 'integer',
      nullable: true,
      defaultValue: 3600,
      label: 'זמן פג תוקף הפעלה (שניות)',
      placeholder: '3600',
      validation: 'integer',
      min: 300
    },
    max_login_attempts: {
      type: 'integer',
      nullable: true,
      defaultValue: 5,
      label: 'מספר ניסיונות התחברות מקסימלי',
      placeholder: '5',
      validation: 'integer',
      min: 1,
      max: 20
    },

    // Performance Settings
    backup_frequency: {
      type: 'character varying(20)',
      nullable: true,
      defaultValue: 'daily',
      label: 'תדירות גיבוי',
      placeholder: 'daily',
      maxLength: 20,
      options: ['hourly', 'daily', 'weekly', 'monthly']
    },
    cache_duration: {
      type: 'integer',
      nullable: true,
      defaultValue: 300,
      label: 'זמן שמירה במטמון (שניות)',
      placeholder: '300',
      validation: 'integer',
      min: 60,
      max: 3600
    },

    // Timestamps
    created_at: {
      type: 'timestamp with time zone',
      nullable: true,
      defaultValue: 'now()',
      label: 'נוצר ב',
      isTimestamp: true
    },
    updated_at: {
      type: 'timestamp with time zone',
      nullable: true,
      defaultValue: 'now()',
      label: 'עודכן ב',
      isTimestamp: true
    }
  },

  // Field groups for form organization
  groups: {
    company: {
      title: 'פרטי החברה',
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
      title: 'מיתוג ועיצוב',
      fields: [
        'company_logo',
        'logo_url',
        'primary_color',
        'secondary_color',
        'timezone'
      ]
    },
    tax: {
      title: 'מיסוי ומשלוח',
      fields: [
        'is_vat_registered',
        'currency',
        'tax_rate',
        'prices_include_tax',
        'show_prices_with_tax',
        'enable_tax_exempt',
        'invoice_footer_text',
        'free_shipping_threshold',
        'standard_shipping_cost',
        'express_shipping_cost',
        'enable_local_delivery'
      ]
    },
    notifications: {
      title: 'התראות',
      fields: [
        'notification_settings'
      ]
    },
    system: {
      title: 'הגדרות מערכת',
      fields: [
        'maintenance_mode',
        'debug_mode',
        'enable_reviews',
        'enable_wishlist',
        'enable_notifications',
        'session_timeout',
        'max_login_attempts',
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

  // Default values
  defaults: {
    company_name: 'Jean Darcel',
    company_description: 'מערכת ניהול הזמנות',
    company_email: '',
    company_phone: '',
    company_address: '',
    company_logo: '',
    tagline: '',
    logo_url: '',
    primary_color: '#1976d2',
    secondary_color: '#dc004e',
    timezone: 'Asia/Jerusalem',
    business_name: '',
    registration_number: '',
    tax_id: '',
    is_vat_registered: true,
    currency: 'ILS',
    tax_rate: 0.18,
    prices_include_tax: true,
    show_prices_with_tax: true,
    enable_tax_exempt: false,
    invoice_footer_text: '',
    free_shipping_threshold: 0.00,
    standard_shipping_cost: 0.00,
    express_shipping_cost: 0.00,
    enable_local_delivery: true,
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
  },

  // Constraints
  constraints: {
    chk_settings_primary_color: {
      check: "((primary_color)::text ~ '^#[0-9A-Fa-f]{6}$'::text)"
    },
    chk_settings_secondary_color: {
      check: "((secondary_color)::text ~ '^#[0-9A-Fa-f]{6}$'::text)"
    },
    chk_settings_currency: {
      check: "((currency)::text ~ '^[A-Z]{3}$'::text)"
    },
    chk_settings_shipping_costs: {
      check: "((free_shipping_threshold >= (0)::numeric) AND (standard_shipping_cost >= (0)::numeric) AND (express_shipping_cost >= (0)::numeric))"
    },
    chk_settings_tax_rate: {
      check: "((tax_rate >= (0)::numeric) AND (tax_rate <= (1)::numeric))"
    },
    chk_settings_session_timeout: {
      check: "(session_timeout >= 300)"
    },
    chk_settings_max_login_attempts: {
      check: "((max_login_attempts > 0) AND (max_login_attempts <= 20))"
    }
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
    'trigger_update_settings_updated_at',
    'settings_audit_trigger'
  ]
};

// Helper functions
export const getFieldDefinition = (fieldName) => {
  return SETTINGS_TABLE.fields[fieldName];
};

export const getFieldGroup = (fieldName) => {
  for (const [groupName, group] of Object.entries(SETTINGS_TABLE.groups)) {
    if (group.fields.includes(fieldName)) {
      return groupName;
    }
  }
  return null;
};

export const getFieldLabel = (fieldName) => {
  const field = getFieldDefinition(fieldName);
  return field ? field.label : fieldName;
};

export const getFieldType = (fieldName) => {
  const field = getFieldDefinition(fieldName);
  return field ? field.type : 'text';
};

export const getFieldValidation = (fieldName) => {
  const field = getFieldDefinition(fieldName);
  return field ? field.validation : null;
};

export const getDefaultValue = (fieldName) => {
  return SETTINGS_TABLE.defaults[fieldName];
};

export const validateField = (fieldName, value) => {
  const field = getFieldDefinition(fieldName);
  if (!field || !field.validation) return true;
  
  const validationRule = SETTINGS_TABLE.validation[field.validation];
  if (!validationRule) return true;
  
  return validationRule.test(value);
};

export const getAllFields = () => {
  return Object.keys(SETTINGS_TABLE.fields);
};

export const getFieldsByGroup = (groupName) => {
  const group = SETTINGS_TABLE.groups[groupName];
  return group ? group.fields : [];
};

export const getGroupTitle = (groupName) => {
  const group = SETTINGS_TABLE.groups[groupName];
  return group ? group.title : groupName;
};