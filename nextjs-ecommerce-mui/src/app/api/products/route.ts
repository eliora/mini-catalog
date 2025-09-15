import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { ProductRow, ProductInsert, ProductUpdate } from '@/types/product';
import { ApiResponse, PaginatedResponse } from '@/types/api';

interface ProductFilter {
  search?: string;
  line?: string;
  productType?: string;
  skinType?: string;
  type?: string;
}

interface ProductsResponse {
  products: ProductRow[];
  pagination: {
    page: number;
    pageSize: number;
    hasMore: boolean;
    total: number;
  };
}

interface FilterOptions {
  lines: string[];
  productTypes: string[];
  skinTypes: string[];
  types: string[];
}

// Request deduplication cache to prevent duplicate API calls
const requestCache = new Map<string, { promise: Promise<any>; timestamp: number }>();
const REQUEST_CACHE_TTL = 30000; // 30 seconds

// Helper function to add timeout to any promise
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 10000, operation = 'Operation'): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Request deduplication helper
const getCacheKey = (operation: string, params: any): string => {
  return `${operation}:${JSON.stringify(params)}`;
};

const getCachedRequest = <T>(cacheKey: string): Promise<T> | null => {
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < REQUEST_CACHE_TTL) {
    return cached.promise as Promise<T>;
  }
  return null;
};

const setCachedRequest = <T>(cacheKey: string, promise: Promise<T>): Promise<T> => {
  requestCache.set(cacheKey, {
    promise,
    timestamp: Date.now()
  });
  
  // Clean up cache periodically
  if (requestCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > REQUEST_CACHE_TTL) {
        requestCache.delete(key);
      }
    }
  }
  
  return promise;
};

// Helper function to retry operations
const retryOperation = async <T>(
  operation: () => Promise<T>, 
  maxRetries = 2, 
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }
  
  throw lastError!;
};

// Helper function to process image URLs (simplified version)
const processImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;
  // Add your image processing logic here
  return imageUrl;
};

// GET /api/products - Get products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const line = searchParams.get('line') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const productType = searchParams.get('productType') || '';
    const skinType = searchParams.get('skinType') || '';
    const type = searchParams.get('type') || '';
    const getDetails = searchParams.get('details') === 'true';
    const getFilters = searchParams.get('filters') === 'true';
    
    const supabase = await createSupabaseServerClient();
    
    // If requesting filter options
    if (getFilters) {
      return await handleGetFilterOptions(supabase);
    }
    
    // If requesting product details
    if (getDetails) {
      const productRef = searchParams.get('ref');
      if (!productRef) {
        return NextResponse.json(
          { success: false, error: 'Missing required parameter: ref' } as ApiResponse<null>,
          { status: 400 }
        );
      }
      return await handleGetProductDetails(supabase, productRef);
    }
    
    // Build filters object
    const filters: ProductFilter = {
      search,
      line,
      productType,
      skinType,
      type,
    };
    
    // Check for cached request first
    const cacheKey = getCacheKey('getProducts', { search, line, page, pageSize, filters });
    const cachedRequest = getCachedRequest<ProductsResponse>(cacheKey);
    if (cachedRequest) {
      const result = await cachedRequest;
      return NextResponse.json(
        { success: true, data: result } as ApiResponse<ProductsResponse>,
        { status: 200 }
      );
    }
    
    const requestPromise = getProductsInternal(supabase, search, line, page, pageSize, filters);
    const result = await setCachedRequest(cacheKey, requestPromise);
    
    return NextResponse.json(
      { success: true, data: result } as ApiResponse<ProductsResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// Internal function to get products
async function getProductsInternal(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  search = '',
  line = '',
  page = 1,
  pageSize = 50,
  filters: ProductFilter = {}
): Promise<ProductsResponse> {
  // Select ONLY essential fields for initial catalog display
  let query = supabase.from('products').select(`
    ref,
    hebrew_name,
    english_name,
    short_description_he,
    main_pic,
    size,
    product_line,
    type,
    product_type,
    skin_type_he,
    qty,
    unit_price
  `);
  
  // Apply server-side filtering for maximum performance
  if (search) {
    query = query.or(`ref.ilike.%${search}%,hebrew_name.ilike.%${search}%,english_name.ilike.%${search}%`);
  }
  
  if (line) {
    query = query.or(`product_line.ilike.%${line}%,skin_type_he.ilike.%${line}%`);
  }
  
  // Apply additional filters at database level
  const { productType, skinType, type } = filters;
  
  if (productType) {
    query = query.or(`product_type.ilike.%${productType}%`);
  }
  
  if (skinType) {
    query = query.ilike('skin_type_he', `%${skinType}%`);
  }
  
  if (type) {
    query = query.ilike('type', `%${type}%`);
  }
  
  // Add pagination for lazy loading
  const offset = (page - 1) * pageSize;
  query = query.order('ref').range(offset, offset + pageSize - 1);
  
  // Execute query with timeout and retry protection
  const result = await retryOperation(
    async () => {
      const queryResult = await query;
      return queryResult;
    },
    2,
    800
  ) as { data: any[] | null; error: any };
  
  const { data, error } = result;
  
  if (error) throw error;
  
  console.log(`Raw products from DB: ${data?.length || 0} (page ${page}, pageSize ${pageSize})`);
  
  // More permissive filtering - only exclude products explicitly marked as unavailable
  const filteredData = (data || []).filter((product: any) => {
    const qty = product.qty;
    // Allow products with qty 0 or positive numbers, exclude only null/undefined/empty string
    if (qty === null || qty === undefined) return false;
    if (typeof qty === 'string' && qty.trim() === '') return false;
    return true;
  });
  
  console.log(`Products after filtering: ${filteredData.length} out of ${data?.length || 0}`);
  
  // Get product refs for price lookup
  const productRefs = filteredData.map((product: any) => product.ref);
  
  // Fetch prices separately (only if user has permission) with timeout protection
  let prices: Record<string, any> = {};
  try {
    // Call internal prices API
    const pricesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/prices?refs=${productRefs.join(',')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (pricesResponse.ok) {
      const pricesData = await pricesResponse.json();
      prices = pricesData.data || {};
    }
    
    console.log(`✅ Prices loaded for ${Object.keys(prices).length} products`);
  } catch (priceError) {
    console.warn('⚠️ Failed to load prices, continuing without them:', (priceError as Error).message);
    // Continue without prices - better to show products without prices than fail completely
  }
  
  // Transform database structure to component expected structure
  const products = filteredData.map((product: any) => ({
    ...product,
    // Map database fields to component expected fields
    productName: product.hebrew_name,
    productName2: product.english_name,
    mainPic: processImageUrl(product.main_pic),
    unitPrice: prices[product.ref]?.unitPrice || product.unit_price || 0,
    line: product.product_line || product.skin_type_he,
    productLine: product.product_line,
    productType: product.product_type || product.type,
    // Keep original database fields too
    unit_price: prices[product.ref]?.unitPrice || 0,
    price_data: prices[product.ref] || null,
    // Accordion data will be loaded separately when needed
    accordionDataLoaded: false
  }));

  // Return pagination info along with products
  return {
    products,
    pagination: {
      page,
      pageSize,
      hasMore: (data?.length || 0) === pageSize,
      total: filteredData.length
    }
  };
}

// Handle get product details
async function handleGetProductDetails(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  productRef: string
) {
  try {
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
      .eq('ref', productRef)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Product not found' } as ApiResponse<null>,
          { status: 404 }
        );
      }
      throw error;
    }

    const productDetails = {
      ref: data.ref,
      description: data.description_he,
      description_he: data.description_he,
      activeIngredients: data.active_ingredients_he,
      active_ingredients_he: data.active_ingredients_he,
      usageInstructions: data.usage_instructions_he,
      usage_instructions_he: data.usage_instructions_he,
      ingredients: data.ingredients,
      header: data.header,
      frenchName: data.french_name,
      french_name: data.french_name,
      pics: data.pics ? (Array.isArray(data.pics) ? data.pics : []) : [],
      accordionDataLoaded: true
    };

    return NextResponse.json(
      { success: true, data: productDetails } as ApiResponse<typeof productDetails>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// Handle get filter options
async function handleGetFilterOptions(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  try {
    console.log('🔍 Loading filter options...');
    
    // Use manual query for filter options
    const { data: products, error: fallbackError } = await supabase
        .from('products')
        .select('product_line, product_type, skin_type_he, type')
        .not('product_line', 'is', null)
        .not('product_type', 'is', null);
        
      if (fallbackError) throw fallbackError;
      
      // Process manually
      const lines = [...new Set(
        products.flatMap(p => (p.product_line || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      const productTypes = [...new Set(
        products.flatMap(p => (p.product_type || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      const skinTypes = [...new Set(
        products.flatMap(p => (p.skin_type_he || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      const types = [...new Set(
        products.flatMap(p => (p.type || '').split(',').map(item => item.trim())).filter(Boolean)
      )];
      
      const data: FilterOptions = {
        lines: lines.sort(),
        productTypes: productTypes.sort(),
        skinTypes: skinTypes.sort(),
        types: types.sort()
      };
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<FilterOptions>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error loading filter options:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.ref) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: ref' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }
    
    // Map component fields to database structure
    const productData: ProductInsert = {
      ref: body.ref,
      hebrew_name: body.productName || body.hebrew_name,
      english_name: body.productName2 || body.english_name,
      description_he: body.description || body.description_he,
      active_ingredients_he: body.activeIngredients || body.active_ingredients_he,
      usage_instructions_he: body.usageInstructions || body.usage_instructions_he,
      main_pic: body.mainPic || body.main_pic,
      pics: Array.isArray(body.pics) 
        ? body.pics 
        : (typeof body.pics === 'string' ? body.pics.split(' | ').filter(Boolean) : []),
      size: body.size,
      notice: body.notice,
      product_type: body.productType || body.product_type || 'Product',
      short_description_he: body.short_description_he,
      skin_type_he: body.skin_type_he || body.line,
      header: body.header,
      ingredients: body.ingredients,
      french_name: body.frenchName || body.french_name,
      product_line: body.productLine || body.product_line || body.line,
      type: body.type || body.productType,
      qty: body.stockQuantity || body.qty || null,
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<ProductRow>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// PUT /api/products - Update product (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.ref) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: ref' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }
    
    // Map component fields back to database structure
    const updateData: ProductUpdate = {
      hebrew_name: body.productName || body.hebrew_name,
      english_name: body.productName2 || body.english_name,
      description_he: body.description || body.description_he,
      active_ingredients_he: body.activeIngredients || body.active_ingredients_he,
      usage_instructions_he: body.usageInstructions || body.usage_instructions_he,
      main_pic: body.mainPic || body.main_pic,
      pics: Array.isArray(body.pics) 
        ? body.pics 
        : (typeof body.pics === 'string' ? body.pics.split(' | ').filter(Boolean) : undefined),
      size: body.size,
      notice: body.notice,
      product_type: body.productType || body.product_type,
      short_description_he: body.short_description_he,
      skin_type_he: body.skin_type_he || body.line,
      header: body.header,
      ingredients: body.ingredients,
      french_name: body.frenchName || body.french_name,
      product_line: body.productLine || body.product_line || body.line,
      type: body.type || body.productType,
      qty: body.stockQuantity !== undefined ? body.stockQuantity : (body.qty !== undefined ? body.qty : undefined),
      updated_at: new Date().toISOString(),
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof ProductUpdate] === undefined) {
        delete updateData[key as keyof ProductUpdate];
      }
    });
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('ref', body.ref)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Product not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<ProductRow>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in PUT /api/products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// DELETE /api/products - Delete product (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const productRef = searchParams.get('ref');
    
    if (!productRef) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: ref' 
        } as ApiResponse<null>,
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('ref', productRef)
      .select()
      .single();
    
    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse<null>,
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Product not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data } as ApiResponse<ProductRow>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
