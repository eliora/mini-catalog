/**
 * Settings Management API Routes
 * 
 * Handles company settings and configuration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Retrieve company settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch company settings
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Return default settings if none exist
    const defaultSettings = {
      company_name: 'Your Company',
      tagline: '',
      description: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Israel'
      },
      logo_url: null,
      primary_color: '#1976d2',
      secondary_color: '#dc004e',
      tax_rate: 17,
      currency: 'ILS',
      timezone: 'Asia/Jerusalem',
      enable_reviews: true,
      enable_wishlist: true,
      enable_notifications: true,
      maintenance_mode: false,
      debug_mode: false
    };

    return NextResponse.json({
      settings: settings || defaultSettings
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update company settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication and admin permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      company_name,
      tagline,
      description,
      email,
      phone,
      address,
      logo_url,
      primary_color,
      secondary_color,
      tax_rate,
      currency,
      timezone,
      enable_reviews,
      enable_wishlist,
      enable_notifications,
      maintenance_mode,
      debug_mode
    } = body;

    // Validate required fields
    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Upsert settings (insert or update)
    const { data: settings, error } = await supabase
      .from('company_settings')
      .upsert({
        id: 1, // Single settings record
        company_name,
        tagline,
        description,
        email,
        phone,
        address,
        logo_url,
        primary_color,
        secondary_color,
        tax_rate,
        currency,
        timezone,
        enable_reviews,
        enable_wishlist,
        enable_notifications,
        maintenance_mode,
        debug_mode,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Settings update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
