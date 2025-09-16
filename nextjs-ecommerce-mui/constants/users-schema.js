// ============================================================================
// USERS TABLE SCHEMA - Database Constants
// ============================================================================
// Complete schema definition for the users table
// ============================================================================

export const USERS_TABLE = {
  name: 'users',
  schema: 'public',
  
  // Column definitions
  columns: {
    id: {
      type: 'uuid',
      nullable: false,
      primary: true,
      references: 'auth.users(id)',
      onDelete: 'CASCADE'
    },
    email: {
      type: 'text',
      nullable: false,
      unique: true
    },
    role: {
      type: 'text',
      nullable: false,
      default: 'user',
      enum: ['user', 'admin']
    },
    full_name: {
      type: 'text',
      nullable: true
    },
    created_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    },
    updated_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    },
    user_role: {
      type: 'text',
      nullable: true,
      default: 'standard',
      enum: ['standard', 'verified_members', 'customer', 'admin']
    },
    business_name: {
      type: 'text',
      nullable: true
    },
    phone_number: {
      type: 'varchar(50)',
      nullable: true
    },
    address: {
      type: 'jsonb',
      nullable: true
    },
    status: {
      type: 'varchar(20)',
      nullable: true,
      default: 'active',
      enum: ['active', 'inactive', 'suspended']
    },
    last_login: {
      type: 'timestamp with time zone',
      nullable: true
    }
  },

  // Constraints
  constraints: {
    primary: 'users_pkey',
    unique: ['users_email_key'],
    foreign: ['users_id_fkey'],
    check: [
      'users_role_check',
      'users_status_check', 
      'users_user_role_check'
    ]
  },

  // Indexes
  indexes: [
    'idx_users_email',
    'idx_users_role',
    'idx_users_user_role',
    'idx_users_status',
    'idx_users_business_name',
    'idx_users_phone_number'
  ],

  // Triggers
  triggers: [
    'update_users_updated_at',
    'sync_user_metadata_trigger'
  ],

  // Enums for validation
  enums: {
    ROLES: {
      USER: 'user',
      ADMIN: 'admin'
    },
    USER_ROLES: {
      STANDARD: 'standard',
      VERIFIED_MEMBERS: 'verified_members',
      CUSTOMER: 'customer',
      ADMIN: 'admin'
    },
    STATUS: {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      SUSPENDED: 'suspended'
    }
  },

  // RLS Policies
  policies: [
    'Users can view their own profile',
    'Users can update their own profile',
    'Admins can view all users',
    'Admins can manage all users',
    'Allow user registration',
    'Verified members can see other verified members'
  ]
};

// Helper functions for working with users
export const USERS_HELPERS = {
  // Check if user is admin
  isAdmin: (user) => user?.role === USERS_TABLE.enums.ROLES.ADMIN,
  
  // Check if user is verified member
  isVerifiedMember: (user) => user?.user_role === USERS_TABLE.enums.USER_ROLES.VERIFIED_MEMBERS,
  
  // Check if user is active
  isActive: (user) => user?.status === USERS_TABLE.enums.STATUS.ACTIVE,
  
  // Get display name
  getDisplayName: (user) => user?.full_name || user?.email?.split('@')[0] || 'User',
  
  // Format address from JSONB
  formatAddress: (address) => {
    if (!address) return '';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postal_code) parts.push(address.postal_code);
    if (address.country) parts.push(address.country);
    return parts.join(', ');
  }
};

// SQL queries for common operations
export const USERS_QUERIES = {
  // Select user by ID
  SELECT_BY_ID: `
    SELECT * FROM public.users WHERE id = $1
  `,
  
  // Select user by email
  SELECT_BY_EMAIL: `
    SELECT * FROM public.users WHERE email = $1
  `,
  
  // Update user profile
  UPDATE_PROFILE: `
    UPDATE public.users 
    SET full_name = $2, business_name = $3, phone_number = $4, address = $5
    WHERE id = $1
    RETURNING *
  `,
  
  // Update last login
  UPDATE_LAST_LOGIN: `
    UPDATE public.users 
    SET last_login = NOW()
    WHERE id = $1
  `,
  
  // Get all active users (admin only)
  SELECT_ACTIVE_USERS: `
    SELECT * FROM public.users 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `,
  
  // Get verified members
  SELECT_VERIFIED_MEMBERS: `
    SELECT * FROM public.users 
    WHERE user_role = 'verified_members' AND status = 'active'
    ORDER BY business_name, full_name
  `
};

export default USERS_TABLE;

