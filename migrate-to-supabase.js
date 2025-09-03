// Migration script to export data from SQLite and import to Supabase
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const DatabaseService = require('./src/services/database-node.js');
const fs = require('fs');

async function migrateData() {
  console.log('Starting migration from SQLite to Supabase...');
  
  // Check if SQLite database exists
  if (!fs.existsSync('./catalog.db')) {
    console.log('No SQLite database found. Skipping migration.');
    return;
  }

  // Initialize SQLite connection
  const sqliteDb = new sqlite3.Database('./catalog.db');
  
  // Initialize Supabase connection
  let supabaseDb;
  try {
    supabaseDb = new DatabaseService();
    console.log('✅ Connected to Supabase');
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    console.log('Please ensure you have set the following environment variables:');
    console.log('- SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  try {
    // Export products from SQLite
    console.log('📤 Exporting products from SQLite...');
    const products = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM products ORDER BY ref', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    console.log(`Found ${products.length} products to migrate`);

    if (products.length > 0) {
      // Process products for Supabase
      console.log('🔄 Processing products for Supabase...');
      const processedProducts = products.map(product => ({
        ref: product.ref,
        productName: product.productName,
        productName2: product.productName2,
        line: product.line,
        notice: product.notice,
        size: product.size,
        unitPrice: product.unitPrice,
        productType: product.productType,
        mainPic: product.mainPic,
        pics: product.pics ? JSON.parse(product.pics) : [],
        description: product.description,
        activeIngredients: product.activeIngredients,
        usageInstructions: product.usageInstructions,
        highlights: product.highlights ? JSON.parse(product.highlights) : []
      }));

      // Clear existing products in Supabase
      console.log('🗑️ Clearing existing products in Supabase...');
      await supabaseDb.clearAllProducts();

      // Import products to Supabase
      console.log('📥 Importing products to Supabase...');
      await supabaseDb.bulkInsertProducts(processedProducts);
      console.log(`✅ Successfully migrated ${products.length} products`);
    }

    // Export orders from SQLite
    console.log('📤 Exporting orders from SQLite...');
    const orders = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });

    console.log(`Found ${orders.length} orders to migrate`);

    if (orders.length > 0) {
      // Process and import orders to Supabase
      console.log('📥 Importing orders to Supabase...');
      for (const order of orders) {
        const items = order.items ? JSON.parse(order.items) : [];
        await supabaseDb.createOrder(order.customerName, order.total, items);
      }
      console.log(`✅ Successfully migrated ${orders.length} orders`);
    }

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close SQLite connection
    sqliteDb.close();
  }
}

// Create backup of SQLite database
function createBackup() {
  if (fs.existsSync('./catalog.db')) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `./catalog-backup-${timestamp}.db`;
    fs.copyFileSync('./catalog.db', backupPath);
    console.log(`📦 SQLite database backed up to: ${backupPath}`);
  }
}

if (require.main === module) {
  console.log('🔄 Supabase Migration Script');
  console.log('============================');
  
  createBackup();
  migrateData().then(() => {
    console.log('Migration script completed.');
    process.exit(0);
  }).catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateData, createBackup };
