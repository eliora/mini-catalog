import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * GET /api/prices/check-access - Check if user has pricing access
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Try to fetch a single price to test permissions
    const { data, error } = await supabase
      .from('prices')
      .select('product_ref')
      .limit(1);

    if (error) {
      // Permission denied means user cannot view prices
      if (error.code === 'PGRST301' || error.message.includes('policy')) {
        return NextResponse.json({
          canViewPrices: false,
          role: 'unauthorized',
          message: 'User does not have permission to view prices'
        });
      }
      
      // Other errors might be temporary, assume no access for safety
      console.error('Price access check error:', error);
      return NextResponse.json({
        canViewPrices: false,
        role: 'error',
        message: 'Error checking price access'
      });
    }

    // Get user info for additional context
    const { data: { user } } = await supabase.auth.getUser();

    return NextResponse.json({
      canViewPrices: true,
      role: user?.role || 'authenticated',
      userId: user?.id,
      message: 'User has pricing access'
    });

  } catch (error) {
    console.error('Price access check server error:', error);
    return NextResponse.json({
      canViewPrices: false,
      role: 'error',
      message: 'Server error checking price access'
    });
  }
}
