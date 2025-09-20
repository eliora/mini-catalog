/**
 * AUTHENTICATION TYPE DEFINITIONS
 * ================================
 * 
 * This file contains all TypeScript type definitions for the authentication system.
 * It provides comprehensive type safety for user authentication, authorization,
 * and profile management throughout the application.
 * 
 * KEY FEATURES:
 * - Comprehensive authentication type definitions
 * - User profile interfaces with database integration
 * - Form data interfaces for authentication forms
 * - Role-based access control types
 * - Error handling interfaces
 * - Supabase database type integration
 * 
 * ARCHITECTURE:
 * - Extends Supabase generated types
 * - Provides fallback types for missing database tables
 * - Application-specific interfaces for business logic
 * - Form validation interfaces
 * - Role and permission definitions
 * 
 * TYPE CATEGORIES:
 * - Database Types: ProfileRow, ProfileInsert, ProfileUpdate
 * - User Types: AuthUser, UserProfile
 * - State Types: AuthState
 * - Form Types: SignInFormData, SignUpFormData, etc.
 * - Error Types: AuthError, AuthResponse
 * - Role Types: UserRole, RolePermissions
 * 
 * SECURITY FEATURES:
 * - Type-safe authentication state management
 * - Role-based access control types
 * - Secure form data interfaces
 * - Error handling without sensitive data exposure
 * 
 * DATABASE INTEGRATION:
 * - Supabase generated type integration
 * - Fallback types for missing tables
 * - Type-safe database operations
 * - Profile management interfaces
 * 
 * USAGE:
 * - Import types in authentication components
 * - Use for form validation and state management
 * - Provides type safety for API responses
 * - Enables proper TypeScript intellisense
 * 
 * EXTENSIBILITY:
 * - Easy to extend with new user fields
 * - Modular type definitions
 * - Support for additional roles and permissions
 * - Flexible form data interfaces
 * 
 * @file src/types/auth.ts
 * @author Authentication System
 * @version 1.0.0
 */

import { User, Session } from '@supabase/supabase-js';
import { Database } from './supabase';

// Supabase generated types for profiles (fallback if table doesn't exist)
export type ProfileRow = Database['public']['Tables'] extends { profiles: unknown } 
  ? Database['public']['Tables']['profiles']['Row'] 
  : {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      user_role: string;
      created_at: string;
      updated_at: string;
    };

export type ProfileInsert = Database['public']['Tables'] extends { profiles: unknown }
  ? Database['public']['Tables']['profiles']['Insert']
  : Partial<ProfileRow>;

export type ProfileUpdate = Database['public']['Tables'] extends { profiles: unknown }
  ? Database['public']['Tables']['profiles']['Update']
  : Partial<ProfileRow>;

// Application-specific Auth interfaces
export interface AuthUser extends User {
  profile?: UserProfile;
}

export interface UserProfile {
  // Core fields from ProfileRow
  id: string;
  email: string;
  name: string;
  business_name: string | null;
  phone_number: string | null;
  address: unknown;
  user_roles: string[];
  status: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  // Add any computed fields here
  displayName?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  // Legacy compatibility fields
  first_name?: string;
  last_name?: string;
  user_role?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitializing: boolean;
  error?: string;
  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  // Utilities
  isAuthenticated: () => boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
}

export interface SignInFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdateProfileFormData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthResponse<T = unknown> {
  data?: T;
  error?: AuthError;
  success: boolean;
}

// Role-based access control
export type UserRole = 'user' | 'admin' | 'moderator' | 'verified_member';

export interface RolePermissions {
  canViewPrices: boolean;
  canPlaceOrders: boolean;
  canAccessAdmin: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
}

export interface AuthConfig {
  redirectTo?: string;
  shouldCreateProfile?: boolean;
  defaultRole?: UserRole;
}
