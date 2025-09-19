import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    
    if (!ref) {
      return NextResponse.json(
        { error: 'Product reference is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Fetch detailed product data from Supabase
    const { data, error } = await supabase
      .from('products')
      .select(`
        ref,
        description_he,
        active_ingredients_he,
        usage_instructions_he,
        ingredients,
        header,
        french_name,
        pics
      `)
      .eq('ref', ref)
      .single();

    if (error) {
      console.error('Error fetching product details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product details' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Process image URLs (split by ' | ' if it's a string)
    let processedPics: string[] = [];
    if (data.pics) {
      if (Array.isArray(data.pics)) {
        processedPics = data.pics as string[];
      } else if (typeof data.pics === 'string') {
        processedPics = data.pics.split(' | ').filter(Boolean);
      }
    }

    // Return formatted data matching the original React structure
    const result = {
      ref: data.ref,
      // Descriptions
      description: data.description_he,
      description_he: data.description_he,
      // Active ingredients (camelCase mapping)
      activeIngredients: data.active_ingredients_he,
      active_ingredients_he: data.active_ingredients_he,
      wirkunginhaltsstoffe_he: data.active_ingredients_he, // Legacy alias
      // Usage instructions (camelCase mapping)
      usageInstructions: data.usage_instructions_he,
      usage_instructions_he: data.usage_instructions_he,
      anwendung_he: data.usage_instructions_he, // Legacy alias
      // Other fields
      ingredients: data.ingredients,
      header: data.header,
      frenchName: data.french_name,
      french_name: data.french_name,
      pics: processedPics,
      accordionDataLoaded: true
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error in product details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
