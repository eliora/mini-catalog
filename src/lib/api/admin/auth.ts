/**
 * @file Admin Authentication & Authorization Utilities
 * @description Centralizes the logic for verifying admin access in API routes.
 * This ensures a consistent and secure method for protecting admin-only endpoints.
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
