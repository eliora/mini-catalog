/**
 * ADMIN AUTHENTICATION & AUTHORIZATION UTILITIES
 * ==============================================
 * 
 * This file centralizes the logic for verifying admin access in API routes.
 * It provides a secure and consistent method for protecting admin-only endpoints
 * and ensures proper authentication and authorization checks.
 * 
 * ⚠️  SECURITY WARNING:
 * This file handles sensitive authentication logic and service role client creation.
 * The createAuthedAdminClient function provides FULL DATABASE ACCESS and should
 * only be used after proper authentication and authorization verification.
 * 
 * KEY FEATURES:
 * - Centralized admin authentication logic
 * - Service role client creation with proper verification
 * - Custom AuthError class for specific error handling
 * - Multi-step authentication verification process
 * - Database role verification
 * - Secure error handling without information leakage
 * 
 * ARCHITECTURE:
 * - Two-step authentication process (session + role verification)
 * - Service role client creation only after verification
 * - Custom error handling with status codes
 * - Integration with Supabase SSR and service clients
 * 
 * SECURITY FEATURES:
 * - Session verification before role checking
 * - Database role verification from users table
 * - Service role client only after full verification
 * - Custom error handling with appropriate status codes
 * - No sensitive information exposure in error messages
 * 
 * AUTHENTICATION FLOW:
 * 1. Extract user session from request cookies
 * 2. Verify user is authenticated
 * 3. Create service role client for database access
 * 4. Verify user role from database
 * 5. Return service client if admin, throw error if not
 * 
 * USAGE:
 * - Import createAuthedAdminClient in admin API routes
 * - Use AuthError for proper error handling
 * - Always wrap in try-catch blocks
 * - Return appropriate HTTP status codes
 * 
 * ERROR HANDLING:
 * - AuthError with status codes (401 for auth, 403 for authorization)
 * - Proper error logging without sensitive data exposure
 * - Graceful fallback for missing user profiles
 * 
 * @file src/lib/api/admin/auth.ts
 * @author Authentication System
 * @version 1.0.0
 */
import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * A custom error class to distinguish authentication/authorization failures
 * from other unexpected server errors. This allows for specific error handling
 * in the API routes.
 */
export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Creates a Supabase Service Role Client but *only after* verifying the request
 * comes from a logged-in user with an 'admin' role in the database.
 * This is the single, secure entry point for all admin API routes to obtain a
 * privileged Supabase client for performing admin-level operations.
 *
 * @param request The `NextRequest` object from the API route handler.
 * @returns A Supabase client instance with `service_role` privileges.
 * @throws {AuthError} If the user is not authenticated or is not an admin,
 * allowing the calling API route to return a 401 or 403 response.
 */
export async function createAuthedAdminClient(request: NextRequest) {
  // 1. Create a standard client from the request cookies to check the user's session.
  const { supabase: supabaseUserClient } = createClientForApi(request);

  // 2. Get the authenticated user from the session.
  const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();

  if (userError || !user) {
    throw new AuthError('Authentication required', 401);
  }

  // 3. Now that we have an authenticated user, create the powerful service client
  //    to check their role from the database, bypassing any RLS.
  const supabaseService = createServiceClient();

  // 4. Fetch the user's profile from the database to verify their role.
  const { data: profile, error: profileError } = await supabaseService
    .from('users')
    .select('user_role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile for admin check:', profileError);
    // This could happen if the user exists in auth but not in the public.users table.
    throw new AuthError('Permission Denied: Could not verify user profile.');
  }

  // 5. Explicitly check if the user has the 'admin' role.
  if (profile.user_role !== 'admin') {
    throw new AuthError('Permission Denied: User is not an admin.');
  }

  // 6. Success! Return the service client for the API route to use.
  return supabaseService;
}
