import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { CompanySettings, CompanyFormData } from '@/types/company';
import { ApiResponse } from '@/types/api';

// Helper function to add timeout to any promise
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 8000, operation = 'Operation'): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Default company settings
const DEFAULT_SETTINGS: CompanySettings = {
  id: '1',
  company_name: 'Jean Darcel',
  company_description: 'מערכת ניהול הזמנות',
  contact_email: '',
  contact_phone: '',
  address: '',
  website: '',
  logo_url: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// GET /api/settings - Get company settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        // Return defaults if no settings exist
        return NextResponse.json(
          { success: true, data: DEFAULT_SETTINGS } as ApiResponse<CompanySettings>,
          { status: 200 }
        );
      }
      
      console.error('Error fetching company settings:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // If no settings exist, return defaults
    if (!data) {
      return NextResponse.json(
        { success: true, data: DEFAULT_SETTINGS } as ApiResponse<CompanySettings>,
        { status: 200 }
      );
    }

    // Map database fields to application structure
    const settings: CompanySettings = {
      id: data.id,
      company_name: data.company_name || DEFAULT_SETTINGS.company_name,
      company_description: data.company_description || DEFAULT_SETTINGS.company_description,
      contact_email: data.company_email || DEFAULT_SETTINGS.contact_email,
      contact_phone: data.company_phone || DEFAULT_SETTINGS.contact_phone,
      address: data.company_address || DEFAULT_SETTINGS.address,
      website: DEFAULT_SETTINGS.website, // No website field in database
      logo_url: data.company_logo || DEFAULT_SETTINGS.logo_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json(
      { success: true, data: settings } as ApiResponse<CompanySettings>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/settings:', error);
    // Return defaults on error so app continues to work
    return NextResponse.json(
      { success: true, data: DEFAULT_SETTINGS } as ApiResponse<CompanySettings>,
      { status: 200 }
    );
  }
}

// POST /api/settings - Create or update company settings (Admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body: CompanyFormData = await request.json();
    
    // Validate required fields
    if (!body.company_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: company_name' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }
    
    // First, try to get existing settings
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .single();

    let result;
    
    if (existing) {
      // Update existing settings
      result = await supabase
        .from('settings')
        .update({
          company_name: body.company_name,
          company_description: body.company_description,
          company_email: body.contact_email,
          company_phone: body.contact_phone,
          company_address: body.address,
          // company_website: body.website, // Field doesn't exist in database
          company_logo: body.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new settings
      result = await supabase
        .from('settings')
        .insert({
          company_name: body.company_name,
          company_description: body.company_description,
          company_email: body.contact_email,
          company_phone: body.contact_phone,
          company_address: body.address,
          // company_website: body.website, // Field doesn't exist in database
          company_logo: body.logo_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving company settings:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Map database response to application structure
    const settings: CompanySettings = {
      id: result.data.id,
      company_name: result.data.company_name || DEFAULT_SETTINGS.company_name,
      company_description: result.data.company_description || undefined,
      contact_email: result.data.company_email || undefined,
      contact_phone: result.data.company_phone || undefined,
      address: result.data.company_address || undefined,
      website: DEFAULT_SETTINGS.website, // Field doesn't exist in database
      logo_url: result.data.company_logo || undefined,
      created_at: result.data.created_at,
      updated_at: result.data.updated_at,
    };

    return NextResponse.json(
      { success: true, data: settings } as ApiResponse<CompanySettings>,
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update company settings (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body: Partial<CompanyFormData> = await request.json();
    
    // Get existing settings first
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'No settings found to update. Use POST to create settings.' } as ApiResponse<null>,
          { status: 404 }
        );
      }
      
      console.error('Error fetching existing settings:', fetchError);
      return NextResponse.json(
        { success: false, error: fetchError.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    // Only include provided fields (map API fields to database fields)
    if (body.company_name !== undefined) updateData.company_name = body.company_name;
    if (body.company_description !== undefined) updateData.company_description = body.company_description;
    if (body.contact_email !== undefined) updateData.company_email = body.contact_email;
    if (body.contact_phone !== undefined) updateData.company_phone = body.contact_phone;
    if (body.address !== undefined) updateData.company_address = body.address;
    // if (body.website !== undefined) updateData.company_website = body.website; // Field doesn't exist in database
    if (body.logo_url !== undefined) updateData.company_logo = body.logo_url;
    
    const { data, error } = await supabase
      .from('settings')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company settings:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Map database response to application structure
    const settings: CompanySettings = {
      id: data.id,
      company_name: data.company_name || DEFAULT_SETTINGS.company_name,
      company_description: data.company_description || undefined,
      contact_email: data.company_email || undefined,
      contact_phone: data.company_phone || undefined,
      address: data.company_address || undefined,
      website: DEFAULT_SETTINGS.website, // Field doesn't exist in database
      logo_url: data.company_logo || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return NextResponse.json(
      { success: true, data: settings } as ApiResponse<CompanySettings>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in PUT /api/settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// DELETE /api/settings - Delete company settings (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('settings')
      .delete()
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'No settings found to delete' } as ApiResponse<null>,
          { status: 404 }
        );
      }
      
      console.error('Error deleting company settings:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: { deleted: true } } as ApiResponse<{ deleted: boolean }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
