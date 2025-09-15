// Simple test to verify Supabase connection
// Run with: node test-supabase-connection.js

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('- REACT_APP_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('- REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('📡 Supabase URL:', supabaseUrl);
console.log('🔑 API Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔗 Testing basic connection...');

    // Test 1: Check if we can connect
    const { data: healthCheck, error: healthError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      return;
    }

    console.log('✅ Connection successful!');

    // Test 2: Get table info
    console.log('\n📊 Checking database tables...');

    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Table query failed:', countError.message);
      console.log('\n💡 This usually means the "products" table doesn\'t exist.');
      console.log('   Run the SQL script in Supabase SQL Editor to create the tables.');
      return;
    }

    console.log('✅ Products table exists!');
    console.log('📈 Current product count:', count || 0);

    // Test 3: Try to insert a test product
    console.log('\n📝 Testing insert permissions...');

    const testProduct = {
      'ref no': 'TEST001',
      hebrew_name: 'מוצר בדיקה',
      'Product Name': 'Test Product',
      'Size': 'Test Size',
      unit_price: 9.99
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert([testProduct]);

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.log('\n💡 This might be a permissions issue. Check RLS policies.');
    } else {
      console.log('✅ Insert successful!');
      console.log('🆔 Inserted product ID:', insertResult?.[0]?.id);

      // Clean up test product
      if (insertResult?.[0]?.id) {
        await supabase
          .from('products')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🗑️  Cleaned up test product');
      }
    }

    console.log('\n🎉 All tests passed! CSV import should work now.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection();
