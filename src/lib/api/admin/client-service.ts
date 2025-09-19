/**
 * @file Client Management Service
 * @description This service layer encapsulates all direct database interactions
 * for the `users` table. It's used by the client management API route to handle
 * the business logic of CRUD operations.
 */

import { transformClient } from './query-helpers';

/**
 * Checks if an email address already exists in the `users` table.
 * Can optionally exclude a specific user ID from the check (for updates).
 * @param supabase A Supabase client instance.
 * @param email The email to check for.
 * @param excludeId An optional user ID to exclude from the search.
 * @returns `true` if the email exists, `false` otherwise.
 */
export async function checkEmailExists(supabase: any, email: string, excludeId?: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let query = supabase
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase());

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.single();
  
  // If error is PGRST116, it means no record found, which is what we want
  if (error && error.code === 'PGRST116') {
    return false;
  }
  
  // If other error, throw it
  if (error) {
    throw error;
  }
  
  return !!data;
}

/**
 * Creates a new user record in both auth.users and public.users tables.
 * @param supabase A Supabase service role client instance.
 * @param clientData The validated and sanitized data for the new user (includes password).
 * @returns The newly created client object, transformed for the API response.
 */
export async function createClient(supabase: any, clientData: Record<string, unknown>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { password, ...profileData } = clientData;

  // First, create the user in Supabase Auth
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: clientData.email,
    password: password,
    email_confirm: true, // Auto-confirm email for admin-created users
  });

  if (authError) {
    throw authError;
  }

  if (!authUser.user) {
    throw new Error('Failed to create auth user');
  }

  // Then, create/update the profile record in public.users
  // The user record might already exist due to triggers, so we upsert
  const { data: client, error } = await supabase
    .from('users')
    .upsert({
      id: authUser.user.id,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select(`
      id, email, full_name, user_role,
      business_name, phone_number, address, status,
      created_at, updated_at, last_login
    `)
    .single();

  if (error) {
    // If profile creation fails, we should clean up the auth user
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw error;
  }

  return transformClient(client);
}

/**
 * Updates an existing user record in the database.
 * Performs a check to ensure the user exists before attempting to update.
 * @param supabase A Supabase client instance.
 * @param id The UUID of the user to update.
 * @param updateData The validated and sanitized data to update.
 * @returns The updated client object, transformed for the API response.
 * @throws An error if the client with the specified ID is not found.
 */
export async function updateClient(supabase: any, id: string, updateData: Record<string, unknown>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  // First, check if the client exists to provide a clearer error
  const { data: existingClient, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      // No record found
      const notFoundError = new Error(`Client with ID ${id} not found.`);
      (notFoundError as Error & { code: string }).code = 'PGRST116';
      throw notFoundError;
    }
    // Other database error
    throw checkError;
  }

  if (!existingClient) {
    // This shouldn't happen if no error, but just in case
    const notFoundError = new Error(`Client with ID ${id} not found.`);
    (notFoundError as Error & { code: string }).code = 'PGRST116';
    throw notFoundError;
  }

  const { data: client, error } = await supabase
    .from('users')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id, email, full_name, user_role,
      business_name, phone_number, address, status,
      created_at, updated_at, last_login
    `)
    .single();

  if (error) {
    throw error;
  }

  return transformClient(client);
}

/**
 * Deactivates (soft delete) or permanently deletes (hard delete) a user.
 * @param supabase A Supabase client instance.
 * @param id The UUID of the user to delete.
 * @param hardDelete If `true`, the user is permanently removed. Otherwise, their status is set to 'inactive'.
 * @returns An object confirming the operation and the affected client data.
 * @throws An error if the client with the specified ID is not found.
 */
export async function deleteClient(supabase: any, id: string, hardDelete = false) { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Check if client exists first
  const { data: existingClient, error: checkError } = await supabase
    .from('users')
    .select('id, full_name, email, status')
    .eq('id', id)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      throw new Error('Client not found');
    }
    throw checkError;
  }

  if (!existingClient) {
    throw new Error('Client not found');
  }

  let result;
  let operation;

  if (hardDelete) {
    // Hard delete (permanent removal)
    result = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();
    operation = 'deleted permanently';
  } else {
    // Soft delete (set status to inactive)
    result = await supabase
      .from('users')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    operation = 'deactivated';
  }

  if (result.error) {
    throw result.error;
  }

  return {
    client: hardDelete ? existingClient : transformClient(result.data),
    operation: hardDelete ? 'hard_delete' : 'soft_delete',
    message: `Client ${operation} successfully`
  };
}
