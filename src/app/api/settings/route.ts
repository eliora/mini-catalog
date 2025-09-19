import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { CompanySettings, CompanyFormData } from '@/types/company';
import { ApiResponse } from '@/types/api';


// Default company settings
const DEFAULT_SETTINGS: CompanySettings = {
  id: '1',
  company_name: null,
  company_description: null,
  company_email: null,
  company_phone: null,
  company_address: null,
  company_website: null,
  tagline: '',
  logo_url: '',
  logo_url_extended: '',
  company_logo_extended: '',
  logo_url_compact: '',
  primary_color: '#1976d2',
  secondary_color: '#dc004e',
  timezone: 'Asia/Jerusalem',
  currency: 'ILS',
  is_vat_registered: true,
  tax_rate: 0.18,
  prices_include_tax: true,
  show_prices_with_tax: true,
  enable_tax_exempt: false,
  free_shipping_threshold: 0,
  standard_shipping_cost: 0,
  express_shipping_cost: 0,
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
  cache_duration: 300,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// GET /api/settings - Get company settings
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      // Handle RLS permission errors gracefully (like prices API)
      if (error.code === 'PGRST301' || error.message.includes('policy')) {
        console.log('RLS permission denied for settings, returning defaults');
        return NextResponse.json(
          { success: true, data: DEFAULT_SETTINGS } as ApiResponse<CompanySettings>,
          { status: 200 }
        );
      }
      
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

    // Cast data to our CompanySettings type to avoid TypeScript errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbData = data as any;
    
    // Map database fields to application structure
    const settings: CompanySettings = {
      id: dbData.id,
      company_name: dbData.company_name || DEFAULT_SETTINGS.company_name,
      company_description: dbData.company_description || DEFAULT_SETTINGS.company_description,
      company_email: dbData.company_email || DEFAULT_SETTINGS.company_email,
      company_phone: dbData.company_phone || DEFAULT_SETTINGS.company_phone,
      company_address: dbData.company_address || DEFAULT_SETTINGS.company_address,
      company_website: dbData.company_website || DEFAULT_SETTINGS.company_website,
      tagline: dbData.tagline || DEFAULT_SETTINGS.tagline,
      logo_url_compact: dbData.logo_url_compact || DEFAULT_SETTINGS.logo_url_compact,
      logo_url: dbData.logo_url || DEFAULT_SETTINGS.logo_url,
      logo_url_extended: dbData.logo_url_extended || DEFAULT_SETTINGS.logo_url_extended,
      company_logo_extended: dbData.company_logo_extended || DEFAULT_SETTINGS.company_logo_extended,
      primary_color: dbData.primary_color || DEFAULT_SETTINGS.primary_color,
      secondary_color: dbData.secondary_color || DEFAULT_SETTINGS.secondary_color,
      timezone: dbData.timezone || DEFAULT_SETTINGS.timezone,
      currency: dbData.currency || DEFAULT_SETTINGS.currency,
      is_vat_registered: dbData.is_vat_registered ?? DEFAULT_SETTINGS.is_vat_registered,
      tax_rate: dbData.tax_rate || DEFAULT_SETTINGS.tax_rate,
      prices_include_tax: dbData.prices_include_tax ?? DEFAULT_SETTINGS.prices_include_tax,
      show_prices_with_tax: dbData.show_prices_with_tax ?? DEFAULT_SETTINGS.show_prices_with_tax,
      enable_tax_exempt: dbData.enable_tax_exempt ?? DEFAULT_SETTINGS.enable_tax_exempt,
      free_shipping_threshold: dbData.free_shipping_threshold || DEFAULT_SETTINGS.free_shipping_threshold,
      standard_shipping_cost: dbData.standard_shipping_cost || DEFAULT_SETTINGS.standard_shipping_cost,
      express_shipping_cost: dbData.express_shipping_cost || DEFAULT_SETTINGS.express_shipping_cost,
      enable_local_delivery: dbData.enable_local_delivery ?? DEFAULT_SETTINGS.enable_local_delivery,
      invoice_footer_text: dbData.invoice_footer_text || DEFAULT_SETTINGS.invoice_footer_text,
      notification_settings: dbData.notification_settings || DEFAULT_SETTINGS.notification_settings,
      maintenance_mode: dbData.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode,
      debug_mode: dbData.debug_mode ?? DEFAULT_SETTINGS.debug_mode,
      enable_reviews: dbData.enable_reviews ?? DEFAULT_SETTINGS.enable_reviews,
      enable_wishlist: dbData.enable_wishlist ?? DEFAULT_SETTINGS.enable_wishlist,
      enable_notifications: dbData.enable_notifications ?? DEFAULT_SETTINGS.enable_notifications,
      session_timeout: dbData.session_timeout || DEFAULT_SETTINGS.session_timeout,
      max_login_attempts: dbData.max_login_attempts || DEFAULT_SETTINGS.max_login_attempts,
      backup_frequency: dbData.backup_frequency || DEFAULT_SETTINGS.backup_frequency,
      cache_duration: dbData.cache_duration || DEFAULT_SETTINGS.cache_duration,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at,
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
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body: CompanyFormData = await _request.json();
    
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
          company_email: body.company_email,
          company_phone: body.company_phone,
          company_address: body.address,
          // company_website: body.website, // Field doesn't exist in database
          logo_url: body.logo_url,
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
          company_email: body.company_email,
          company_phone: body.company_phone,
          company_address: body.address,
          // company_website: body.website, // Field doesn't exist in database
          logo_url: body.logo_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      // Handle RLS permission errors gracefully (like prices API)
      if (result.error.code === 'PGRST301' || result.error.message.includes('policy')) {
        console.log('RLS permission denied for settings update');
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to update settings' } as ApiResponse<null>,
          { status: 403 }
        );
      }
      
      console.error('Error saving company settings:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Cast data to our CompanySettings type to avoid TypeScript errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbData = result.data as any;
    
    // Map database response to application structure
    const settings: CompanySettings = {
      id: dbData.id,
      company_name: dbData.company_name || DEFAULT_SETTINGS.company_name,
      company_description: dbData.company_description || DEFAULT_SETTINGS.company_description,
      company_email: dbData.company_email || DEFAULT_SETTINGS.company_email,
      company_phone: dbData.company_phone || DEFAULT_SETTINGS.company_phone,
      company_address: dbData.company_address || DEFAULT_SETTINGS.company_address,
      company_website: dbData.company_website || DEFAULT_SETTINGS.company_website,
      tagline: dbData.tagline || DEFAULT_SETTINGS.tagline,
      logo_url_compact: dbData.logo_url_compact || DEFAULT_SETTINGS.logo_url_compact,
      logo_url: dbData.logo_url || DEFAULT_SETTINGS.logo_url,
      logo_url_extended: dbData.logo_url_extended || DEFAULT_SETTINGS.logo_url_extended,
      company_logo_extended: dbData.company_logo_extended || DEFAULT_SETTINGS.company_logo_extended,
      primary_color: dbData.primary_color || DEFAULT_SETTINGS.primary_color,
      secondary_color: dbData.secondary_color || DEFAULT_SETTINGS.secondary_color,
      timezone: dbData.timezone || DEFAULT_SETTINGS.timezone,
      is_vat_registered: dbData.is_vat_registered ?? DEFAULT_SETTINGS.is_vat_registered,
      currency: dbData.currency || DEFAULT_SETTINGS.currency,
      tax_rate: dbData.tax_rate || DEFAULT_SETTINGS.tax_rate,
      prices_include_tax: dbData.prices_include_tax ?? DEFAULT_SETTINGS.prices_include_tax,
      show_prices_with_tax: dbData.show_prices_with_tax ?? DEFAULT_SETTINGS.show_prices_with_tax,
      enable_tax_exempt: dbData.enable_tax_exempt ?? DEFAULT_SETTINGS.enable_tax_exempt,
      invoice_footer_text: dbData.invoice_footer_text || DEFAULT_SETTINGS.invoice_footer_text,
      free_shipping_threshold: dbData.free_shipping_threshold || DEFAULT_SETTINGS.free_shipping_threshold,
      standard_shipping_cost: dbData.standard_shipping_cost || DEFAULT_SETTINGS.standard_shipping_cost,
      express_shipping_cost: dbData.express_shipping_cost || DEFAULT_SETTINGS.express_shipping_cost,
      enable_local_delivery: dbData.enable_local_delivery ?? DEFAULT_SETTINGS.enable_local_delivery,
      notification_settings: dbData.notification_settings || DEFAULT_SETTINGS.notification_settings,
      maintenance_mode: dbData.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode,
      debug_mode: dbData.debug_mode ?? DEFAULT_SETTINGS.debug_mode,
      enable_reviews: dbData.enable_reviews ?? DEFAULT_SETTINGS.enable_reviews,
      enable_wishlist: dbData.enable_wishlist ?? DEFAULT_SETTINGS.enable_wishlist,
      enable_notifications: dbData.enable_notifications ?? DEFAULT_SETTINGS.enable_notifications,
      session_timeout: dbData.session_timeout || DEFAULT_SETTINGS.session_timeout,
      max_login_attempts: dbData.max_login_attempts || DEFAULT_SETTINGS.max_login_attempts,
      backup_frequency: dbData.backup_frequency || DEFAULT_SETTINGS.backup_frequency,
      cache_duration: dbData.cache_duration || DEFAULT_SETTINGS.cache_duration,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at,
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
export async function PUT(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body: Partial<CompanyFormData> = await _request.json();
    
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
    const updateData: {
      updated_at: string;
      company_name?: string;
      company_description?: string;
      company_email?: string;
      company_phone?: string;
      company_address?: string;
      logo_url?: string;
      primary_color?: string;
      secondary_color?: string;
      tax_rate?: number;
      currency?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      smtp_host?: string;
      smtp_port?: number;
      smtp_user?: string;
      smtp_pass?: string;
      smtp_secure?: boolean;
      email_from?: string;
      notifications_enabled?: boolean;
      maintenance_mode?: boolean;
      timezone?: string;
    } = {
      updated_at: new Date().toISOString(),
    };
    
    // Only include provided fields (map API fields to database fields)
    if (body.company_name !== undefined) updateData.company_name = body.company_name;
    if (body.company_description !== undefined) updateData.company_description = body.company_description;
    if (body.company_email !== undefined) updateData.company_email = body.company_email;
    if (body.company_phone !== undefined) updateData.company_phone = body.company_phone;
    if (body.address !== undefined) updateData.company_address = body.address;
    // if (body.website !== undefined) updateData.company_website = body.website; // Field doesn't exist in database
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    
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

    // Cast data to our CompanySettings type to avoid TypeScript errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbData = data as any;
    
    // Map database response to application structure
    const settings: CompanySettings = {
      id: dbData.id,
      company_name: dbData.company_name || DEFAULT_SETTINGS.company_name,
      company_description: dbData.company_description || DEFAULT_SETTINGS.company_description,
      company_email: dbData.company_email || DEFAULT_SETTINGS.company_email,
      company_phone: dbData.company_phone || DEFAULT_SETTINGS.company_phone,
      company_address: dbData.company_address || DEFAULT_SETTINGS.company_address,
      company_website: dbData.company_website || DEFAULT_SETTINGS.company_website,
      tagline: dbData.tagline || DEFAULT_SETTINGS.tagline,
      logo_url_compact: dbData.logo_url_compact || DEFAULT_SETTINGS.logo_url_compact,
      logo_url: dbData.logo_url || DEFAULT_SETTINGS.logo_url,
      logo_url_extended: dbData.logo_url_extended || DEFAULT_SETTINGS.logo_url_extended,
      company_logo_extended: dbData.company_logo_extended || DEFAULT_SETTINGS.company_logo_extended,
      primary_color: dbData.primary_color || DEFAULT_SETTINGS.primary_color,
      secondary_color: dbData.secondary_color || DEFAULT_SETTINGS.secondary_color,
      timezone: dbData.timezone || DEFAULT_SETTINGS.timezone,
      is_vat_registered: dbData.is_vat_registered ?? DEFAULT_SETTINGS.is_vat_registered,
      currency: dbData.currency || DEFAULT_SETTINGS.currency,
      tax_rate: dbData.tax_rate || DEFAULT_SETTINGS.tax_rate,
      prices_include_tax: dbData.prices_include_tax ?? DEFAULT_SETTINGS.prices_include_tax,
      show_prices_with_tax: dbData.show_prices_with_tax ?? DEFAULT_SETTINGS.show_prices_with_tax,
      enable_tax_exempt: dbData.enable_tax_exempt ?? DEFAULT_SETTINGS.enable_tax_exempt,
      invoice_footer_text: dbData.invoice_footer_text || DEFAULT_SETTINGS.invoice_footer_text,
      free_shipping_threshold: dbData.free_shipping_threshold || DEFAULT_SETTINGS.free_shipping_threshold,
      standard_shipping_cost: dbData.standard_shipping_cost || DEFAULT_SETTINGS.standard_shipping_cost,
      express_shipping_cost: dbData.express_shipping_cost || DEFAULT_SETTINGS.express_shipping_cost,
      enable_local_delivery: dbData.enable_local_delivery ?? DEFAULT_SETTINGS.enable_local_delivery,
      notification_settings: dbData.notification_settings || DEFAULT_SETTINGS.notification_settings,
      maintenance_mode: dbData.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode,
      debug_mode: dbData.debug_mode ?? DEFAULT_SETTINGS.debug_mode,
      enable_reviews: dbData.enable_reviews ?? DEFAULT_SETTINGS.enable_reviews,
      enable_wishlist: dbData.enable_wishlist ?? DEFAULT_SETTINGS.enable_wishlist,
      enable_notifications: dbData.enable_notifications ?? DEFAULT_SETTINGS.enable_notifications,
      session_timeout: dbData.session_timeout || DEFAULT_SETTINGS.session_timeout,
      max_login_attempts: dbData.max_login_attempts || DEFAULT_SETTINGS.max_login_attempts,
      backup_frequency: dbData.backup_frequency || DEFAULT_SETTINGS.backup_frequency,
      cache_duration: dbData.cache_duration || DEFAULT_SETTINGS.cache_duration,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at,
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
export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase
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
