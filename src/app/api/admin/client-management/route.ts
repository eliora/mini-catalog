/**
 * Client Management API Routes - FIXED VERSION
 * 
 * Handles CRUD operations for client management using proper database schema.
 * Integrates with constants and uses correct table/field names.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { USERS_TABLE, USERS_HELPERS, USERS_QUERIES } from '@/constants/users-schema.js';

// Type definitions matching database schema
interface Client {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name?: string;
  phone_number?: string;
  address?: any;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Helper function to check admin permissions
async function checkAdminPermissions(supabase: any, session: any) {
  if (!session?.user?.email) {
    return { isAdmin: false, error: 'No session found' };
  }

  try {
    // Check if user is admin using constants
    const { data: user, error } = await supabase
      .from(USERS_TABLE.name)
      .select('role, user_role, status')
      .eq('email', session.user.email)
      .single();

    if (error || !user) {
      return { isAdmin: false, error: 'User not found' };
    }

    const isAdmin = USERS_HELPERS.isAdmin(user);
    const isActive = USERS_HELPERS.isActive(user);

    if (!isActive) {
      return { isAdmin: false, error: 'User account is not active' };
    }

    return { isAdmin, user };
  } catch (error) {
    return { isAdmin: false, error: 'Permission check failed' };
  }
}

// GET - List clients with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin, error: permError } = await checkAdminPermissions(supabase, session);
    if (!isAdmin) {
      return NextResponse.json({ error: permError || 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const user_role = searchParams.get('user_role') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    // Build query using correct table and field names
    let query = supabase
      .from(USERS_TABLE.name)  // Use 'users' table, not 'profiles'
      .select(`
        id,
        email,
        role,
        full_name,
        user_role,
        business_name,
        phone_number,
        address,
        status,
        created_at,
        updated_at,
        last_login
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,business_name.ilike.%${search}%`);
    }

    if (role && USERS_TABLE.enums.ROLES[role.toUpperCase()]) {
      query = query.eq('role', role);
    }

    if (user_role && USERS_TABLE.enums.USER_ROLES[user_role.toUpperCase()]) {
      query = query.eq('user_role', user_role);
    }

    if (status && USERS_TABLE.enums.STATUS[status.toUpperCase()]) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: clients, error: queryError, count } = await query;

    if (queryError) {
      console.error('Error fetching clients:', queryError);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    // Transform data using helpers
    const transformedClients = clients?.map(client => ({
      ...client,
      display_name: USERS_HELPERS.getDisplayName(client),
      formatted_address: USERS_HELPERS.formatAddress(client.address),
      is_admin: USERS_HELPERS.isAdmin(client),
      is_verified: USERS_HELPERS.isVerifiedMember(client),
      is_active: USERS_HELPERS.isActive(client)
    })) || [];

    return NextResponse.json({
      clients: transformedClients,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        available_roles: Object.values(USERS_TABLE.enums.ROLES),
        available_user_roles: Object.values(USERS_TABLE.enums.USER_ROLES),
        available_statuses: Object.values(USERS_TABLE.enums.STATUS)
      }
    });

  } catch (error) {
    console.error('Client management API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new client
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin, error: permError } = await checkAdminPermissions(supabase, session);
    if (!isAdmin) {
      return NextResponse.json({ error: permError || 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      full_name,  // Use correct field name
      role = 'user',
      user_role = 'standard',
      business_name,
      phone_number,
      address,
      status = 'active'
    } = body;

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 });
    }

    // Validate enum values using constants
    if (!Object.values(USERS_TABLE.enums.ROLES).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (!Object.values(USERS_TABLE.enums.USER_ROLES).includes(user_role)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    if (!Object.values(USERS_TABLE.enums.STATUS).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from(USERS_TABLE.name)
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Create client using correct table and field names
    const { data: client, error } = await supabase
      .from(USERS_TABLE.name)  // Use 'users' table
      .insert({
        email,
        full_name,      // Use correct field name
        role,
        user_role,
        business_name,
        phone_number,
        address,
        status
      })
      .select(`
        id,
        email,
        role,
        full_name,
        user_role,
        business_name,
        phone_number,
        address,
        status,
        created_at,
        updated_at,
        last_login
      `)
      .single();

    if (error) {
      console.error('Error creating client:', error);
      
      // Handle specific database errors
      if (error.code === '23505') {  // Unique constraint violation
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      
      return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }

    // Transform response using helpers
    const transformedClient = {
      ...client,
      display_name: USERS_HELPERS.getDisplayName(client),
      formatted_address: USERS_HELPERS.formatAddress(client.address),
      is_admin: USERS_HELPERS.isAdmin(client),
      is_verified: USERS_HELPERS.isVerifiedMember(client),
      is_active: USERS_HELPERS.isActive(client)
    };

    return NextResponse.json({ client: transformedClient }, { status: 201 });

  } catch (error) {
    console.error('Client creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing client
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT request received');
    const supabase = await createClient();
    
    // For admin operations, we might need service role
    // Let's first try with regular client and add debugging
    
    // Check authentication and admin permissions
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session check:', !!session, session?.user?.email);
    
    if (!session) {
      console.log('No session found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin, error: permError } = await checkAdminPermissions(supabase, session);
    console.log('Admin check:', isAdmin, permError);
    
    if (!isAdmin) {
      console.log('Not admin, returning 403:', permError);
      return NextResponse.json({ error: permError || 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { id, ...updateData } = body;
    console.log('Update data:', updateData);
    console.log('Client ID:', id);

    if (!id) {
      console.log('No client ID provided');
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Validate enum values if provided
    if (updateData.role && !Object.values(USERS_TABLE.enums.ROLES).includes(updateData.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (updateData.user_role && !Object.values(USERS_TABLE.enums.USER_ROLES).includes(updateData.user_role)) {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    if (updateData.status && !Object.values(USERS_TABLE.enums.STATUS).includes(updateData.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update client
    console.log('Updating client with data:', updateData);
    
    // Convert empty strings to null for database consistency, but preserve non-empty values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).map(([key, value]) => [
        key,
        (value === '' || value === undefined) ? null : value
      ])
    );
    
    console.log('Cleaned update data:', cleanUpdateData);
    console.log('Phone number specifically:', {
      original: updateData.phone_number,
      cleaned: cleanUpdateData.phone_number,
      type: typeof cleanUpdateData.phone_number
    });
    
    // Use service-role client for admin updates to bypass RLS safely
    const serviceSupabase = createServiceClient();

    // Test: Try updating just phone number first (service client)
    const { error: phoneUpdateError, count: phoneCount } = await serviceSupabase
      .from(USERS_TABLE.name)
      .update({
        phone_number: cleanUpdateData.phone_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    console.log('Phone-only update result:', { phoneUpdateError, phoneCount });

    // Then, full update (service client)
    const { error: updateError, count } = await serviceSupabase
      .from(USERS_TABLE.name)
      .update({
        ...cleanUpdateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    console.log('Full update operation result:', { updateError, count });

    console.log('Supabase update error:', updateError);

    if (updateError) {
      console.error('Error updating client:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update client', 
        details: updateError.message,
        code: updateError.code 
      }, { status: 500 });
    }

    // Finally, fetch the updated client (service client to ensure consistency)
    const { data: client, error: selectError } = await serviceSupabase
      .from(USERS_TABLE.name)
      .select(`
        id,
        email,
        role,
        full_name,
        user_role,
        business_name,
        phone_number,
        address,
        status,
        created_at,
        updated_at,
        last_login
      `)
      .eq('id', id)
      .single();

    console.log('Supabase select result:', { client, selectError });

    if (selectError) {
      console.error('Error fetching updated client:', selectError);
      return NextResponse.json({ 
        error: 'Failed to fetch updated client', 
        details: selectError.message,
        code: selectError.code 
      }, { status: 500 });
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found after update' }, { status: 404 });
    }

    // Transform response using helpers
    const transformedClient = {
      ...client,
      display_name: USERS_HELPERS.getDisplayName(client),
      formatted_address: USERS_HELPERS.formatAddress(client.address),
      is_admin: USERS_HELPERS.isAdmin(client),
      is_verified: USERS_HELPERS.isVerifiedMember(client),
      is_active: USERS_HELPERS.isActive(client)
    };

    return NextResponse.json({ client: transformedClient });

  } catch (error) {
    console.error('Client update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove client (soft delete by setting status to inactive)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isAdmin, error: permError } = await checkAdminPermissions(supabase, session);
    if (!isAdmin) {
      return NextResponse.json({ error: permError || 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Soft delete by setting status to inactive (recommended)
    // Hard delete is commented out for safety
    const serviceSupabase = createServiceClient();

    const { data: client, error } = await serviceSupabase
      .from(USERS_TABLE.name)
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        email,
        role,
        full_name,
        user_role,
        business_name,
        phone_number,
        address,
        status,
        created_at,
        updated_at,
        last_login
      `)
      .single();

    // Hard delete option (uncomment if needed):
    // const { data: client, error } = await supabase
    //   .from(USERS_TABLE.name)
    //   .delete()
    //   .eq('id', id)
    //   .select()
    //   .single();

    if (error) {
      console.error('Error deleting client:', error);
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Client deactivated successfully',
      client 
    });

  } catch (error) {
    console.error('Client deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
