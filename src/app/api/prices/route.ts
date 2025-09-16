import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * GET /api/prices - Fetch prices for products with RLS
 * Query params:
 * - refs: Comma-separated list of product refs (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const refsParam = searchParams.get('refs');

    let query = supabase
      .from('prices')
      .select(`
        product_ref,
        unit_price,
        currency,
        discount_price,
        price_tier,
        updated_at
      `);

    // Filter by specific product refs if provided
    if (refsParam) {
      const refs = refsParam.split(',').map(ref => ref.trim()).filter(Boolean);
      if (refs.length > 0) {
        query = query.in('product_ref', refs);
      }
    }

    const { data, error } = await query;

    if (error) {
      // Handle RLS permission errors gracefully
      if (error.code === 'PGRST301' || error.message.includes('policy')) {
        return NextResponse.json(
          { 
            prices: {}, 
            canViewPrices: false,
            message: 'Insufficient permissions to view prices' 
          },
          { status: 200 }
        );
      }
      
      console.error('Prices API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prices' },
        { status: 500 }
      );
    }

    // Convert array to object keyed by product_ref for easy lookup
    const pricesMap: Record<string, any> = {};
    if (data) {
      data.forEach(price => {
        pricesMap[price.product_ref] = {
          unitPrice: price.unit_price,
          currency: price.currency || 'ILS',
          discountPrice: price.discount_price,
          priceTier: price.price_tier || 'standard',
          updatedAt: price.updated_at
        };
      });
    }

    return NextResponse.json({
      prices: pricesMap,
      canViewPrices: true,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Prices API server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prices - Update or create product price (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    const { productRef, unitPrice, currency = 'ILS', discountPrice, priceTier = 'standard' } = body;

    if (!productRef || !unitPrice) {
      return NextResponse.json(
        { error: 'Product ref and unit price are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('prices')
      .upsert({
        product_ref: productRef,
        unit_price: unitPrice,
        currency,
        discount_price: discountPrice,
        price_tier: priceTier,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('policy')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update prices' },
          { status: 403 }
        );
      }
      
      console.error('Price update error:', error);
      return NextResponse.json(
        { error: 'Failed to update price' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      price: {
        productRef: data.product_ref,
        unitPrice: data.unit_price,
        currency: data.currency,
        discountPrice: data.discount_price,
        priceTier: data.price_tier,
        updatedAt: data.updated_at
      }
    });

  } catch (error) {
    console.error('Price update server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}