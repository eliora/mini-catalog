const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const httpMod = require('http');
const httpsMod = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'qprffo';

// Simple session storage (in production, use proper session management)
let adminSessionToken = null;

// Middleware
app.use(cors());
app.use(express.json());
// Serve React build only if it exists (production). In dev, API only.
const buildPath = path.join(__dirname, 'build');
const hasBuild = fs.existsSync(path.join(buildPath, 'index.html'));
if (hasBuild) {
  app.use(express.static(buildPath));
  console.log('Serving static build from', buildPath);
} else {
  console.log('No build found; running API-only (dev).');
}

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize SQLite database
const db = new sqlite3.Database('./catalog.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref TEXT UNIQUE,
    productName TEXT,
    productName2 TEXT,
    line TEXT,
    notice TEXT,
    size TEXT,
    unitPrice REAL,
    productType TEXT,
    mainPic TEXT,
    pics TEXT,
    description TEXT,
    activeIngredients TEXT,
    usageInstructions TEXT,
    highlights TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT NOT NULL,
    total REAL NOT NULL,
    items TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('Database tables initialized');
}

// Authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader === `Bearer ${adminSessionToken}`) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

// API Routes

// Admin login
app.post('/api/admin/login', (req, res) => {
  console.log('[LOGIN] POST /api/admin/login body:', req.body);
  const { username, password } = req.body || {};
  if (!username || !password) {
    console.log('[LOGIN] Missing username or password');
    return res.status(400).json({ error: 'Missing username or password' });
  }
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    adminSessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    console.log('[LOGIN] Success. Token:', adminSessionToken);
    return res.json({ success: true, message: 'Login successful', token: adminSessionToken });
  }
  console.log('[LOGIN] Invalid credentials for user:', username);
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Get all products
app.get('/api/products', (req, res) => {
  const { search, line } = req.query;
  console.log('[PRODUCTS] GET /api/products query:', req.query);
  let query = 'SELECT * FROM products';
  let params = [];

  if (search || line) {
    query += ' WHERE';
    if (search) {
      query += ' (ref LIKE ? OR productName LIKE ? OR productName2 LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (line) {
      if (search) query += ' AND';
      query += ' line = ?';
      params.push(line);
    }
  }

  query += ' ORDER BY ref';

  console.log('[PRODUCTS] SQL:', query, 'params:', params);
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('[PRODUCTS] DB error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('[PRODUCTS] rows:', Array.isArray(rows) ? rows.length : rows);
    res.json(rows);
  });
});

// Get product lines for filtering
app.get('/api/product-lines', (req, res) => {
  console.log('[PRODUCT-LINES] GET /api/product-lines');
  db.all('SELECT DISTINCT line FROM products ORDER BY line', (err, rows) => {
    if (err) {
      console.error('[PRODUCT-LINES] DB error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('[PRODUCT-LINES] rows:', rows);
    res.json(rows.map(row => row.line));
  });
});

// Create order
app.post('/api/orders', (req, res) => {
  console.log('[ORDERS] POST /api/orders body:', req.body);
  const { customerName, total, items } = req.body;
  
  // Check each field individually and provide specific error messages
  if (!customerName) {
    res.status(400).json({ error: 'שם לקוח הוא שדה חובה' });
    return;
  }
  
  if (total === undefined || total === null) {
    res.status(400).json({ error: 'סכום כולל הוא שדה חובה' });
    return;
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'רשימת מוצרים היא שדה חובה' });
    return;
  }

  const itemsJson = JSON.stringify(items);
  
  db.run('INSERT INTO orders (customerName, total, items) VALUES (?, ?, ?)', 
    [customerName, total, itemsJson], function(err) {
    if (err) {
      console.error('[ORDERS] DB insert error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('[ORDERS] Created id:', this.lastID);
    res.json({ id: this.lastID, message: 'Order created successfully' });
  });
});

// Get all orders (admin) - requires authentication
app.get('/api/orders', authenticateAdmin, (req, res) => {
  console.log('[ORDERS] GET /api/orders');
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('[ORDERS] DB error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('[ORDERS] rows:', rows && rows.length);
    res.json(rows);
  });
});

// Update an order (admin)
app.put('/api/orders/:id', authenticateAdmin, (req, res) => {
  const orderId = req.params.id;
  const { customerName, total, items } = req.body || {};

  if (!customerName || !Array.isArray(items) || total === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const itemsJson = JSON.stringify(items);
  db.run(
    'UPDATE orders SET customerName = ?, total = ?, items = ? WHERE id = ?',
    [customerName, total, itemsJson, orderId],
    function (err) {
      if (err) {
        console.error('[ORDERS] Update error:', err);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ success: true });
    }
  );
});

// Import products from CSV with column mapping
app.post('/api/import-csv', upload.single('csvFile'), (req, res) => {
  console.log('[IMPORT] POST /api/import-csv file:', req.file && req.file.originalname, 'mapping:', req.body && req.body.columnMapping);
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const defaultColumnMapping = {
    ref: 'ref no',
    productName: 'hebrew_name',
    productName2: 'Product Name2',
    line: 'skin_type_he',
    notice: 'short_description_he',
    size: 'Size',
    unitPrice: 'unitPrice',
    productType: 'productType',
    description: 'description_he',
    activeIngredients: 'WirkungInhaltsstoffe_he',
    usageInstructions: 'Anwendung_he',
    mainPic: 'pic',
    pics: 'all_pics'
  };
  let columnMapping = defaultColumnMapping;
  if (req.body && req.body.columnMapping) {
    try {
      columnMapping = JSON.parse(req.body.columnMapping);
    } catch (e) {
      console.warn('[IMPORT] Failed to parse columnMapping, using defaults. Error:', e && e.message);
      columnMapping = defaultColumnMapping;
    }
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      const normalized = {};
      Object.keys(data || {}).forEach((key) => {
        const nk = String(key || '').trim();
        normalized[nk] = data[key];
      });
      results.push(normalized);
    })
    .on('end', () => {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // Clear existing products
      db.run('DELETE FROM products', (err) => {
        if (err) {
          console.error('[IMPORT] Clear products error:', err);
          res.status(500).json({ error: err.message });
          return;
        }

        // Insert new products
        const stmt = db.prepare(`INSERT INTO products 
          (ref, productName, productName2, line, notice, size, unitPrice, productType, 
           mainPic, pics, description, activeIngredients, usageInstructions, highlights) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        let inserted = 0;
        let errors = 0;
        let processedCount = 0;
        const failed = [];
        const processedRefs = new Set();

        const maybeFinish = () => {
          if (processedCount === results.length) {
            stmt.finalize();
            res.json({
              message: `Import completed. ${inserted} products imported, ${errors} errors.`,
              imported: inserted,
              errors,
              failed
            });
          }
        };

        const cleanUrl = (u) => {
          const s = String(u || '').trim();
          return s.startsWith('@') ? s.slice(1) : s;
        };
        const toHttpUrlOrEmpty = (u) => {
          const s = cleanUrl(u);
          return /^https?:\/\//i.test(s) ? s : '';
        };

        results.forEach((row, index) => {
          try {
            // Use column mapping to get values
            const ref = row[columnMapping.ref] || row['ref no'] || row.ref || '';
            const productName = (row[columnMapping.productName] || row.hebrew_name || row['Product Name'] || row.productName || '').toString().trim();
            const productName2 = row[columnMapping.productName2] || row['Product Name2'] || row.productName2 || '';
            const line = row[columnMapping.line] || row.line || row.Line || '';
            const notice = row[columnMapping.notice] || row.short_description_he || row.notice || '';
            const size = row[columnMapping.size] || row.Size || row.size || '';
            const unitPrice = parseFloat(row[columnMapping.unitPrice] || row.unitPrice || row.price || 0);
            const productType = row[columnMapping.productType] || row.productType || row.ProductType || 'Product';
            const description = row[columnMapping.description] || row.description_he || row.description || '';
            const activeIngredients = row[columnMapping.activeIngredients] || row.WirkungInhaltsstoffe_he || row.activeIngredients || '';
            const usageInstructions = row[columnMapping.usageInstructions] || row.Anwendung_he || row.usageInstructions || '';
            
            // Images from CSV (fallback to placeholder if missing)
            const rawMainPic = row[columnMapping.mainPic] || row.pic || row.mainPic || '';

            const rawPics = row[columnMapping.pics] || row.all_pics || row.pics || '';
            let picsArray = [];
            if (Array.isArray(rawPics)) {
              picsArray = rawPics;
            } else if (typeof rawPics === 'string' && rawPics.trim()) {
              picsArray = rawPics
                .split(/\s*\|\s*|,|;|\n/)
                .map(p => p.trim())
                .filter(Boolean);
            }
            // Sanitize URLs (remove leading '@', trim)
            picsArray = picsArray.map(cleanUrl).filter(Boolean);
            // Choose mainPic strictly from provided URLs (no placeholder)
            let mainPic = toHttpUrlOrEmpty(rawMainPic);
            if (!mainPic && picsArray.length) {
              const firstPic = toHttpUrlOrEmpty(picsArray[0]);
              if (firstPic) mainPic = firstPic;
            }
            const pics = JSON.stringify(picsArray);
            const highlights = row.highlights ? JSON.stringify(row.highlights.split(',').map(h => h.trim())) : '[]';
            
            // Skip if ref is empty
            if (!ref) {
              errors++;
              processedCount++;
              failed.push({ row: index + 1, ref: '', reason: 'Missing ref' });
              maybeFinish();
              return;
            }

            // Skip if duplicate within file
            if (processedRefs.has(ref)) {
              errors++;
              processedCount++;
              failed.push({ row: index + 1, ref, reason: 'Duplicate ref in file' });
              maybeFinish();
              return;
            }
            
            processedRefs.add(ref);
            
            stmt.run([
              ref,
              productName,
              productName2,
              line,
              notice,
              size,
              unitPrice,
              productType,
              mainPic,
              pics,
              description,
              activeIngredients,
              usageInstructions,
              highlights
            ], (err) => {
              if (err) {
                console.error('[IMPORT] Insert row error:', err, 'ref:', ref);
                errors++;
                failed.push({ row: index + 1, ref, reason: err.message });
              } else {
                inserted++;
              }
              processedCount++;
              maybeFinish();
            });
          } catch (error) {
            console.error('Error processing row:', error);
            errors++;
            processedCount++;
            failed.push({ row: index + 1, ref: row && (row[columnMapping.ref] || row['ref no'] || row.ref) || '', reason: error.message || 'Parsing error' });
            maybeFinish();
          }
        });
      });
    });
});

// Get CSV headers for column mapping
app.post('/api/csv-headers', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const headers = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      headers.push(...Object.keys(data));
      return false; // Stop after first row
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      res.json({ headers: [...new Set(headers)] });
    });
});

// Export products to CSV
app.get('/api/export-csv', (req, res) => {
  console.log('[EXPORT] GET /api/export-csv');
  db.all('SELECT * FROM products ORDER BY ref', (err, rows) => {
    if (err) {
      console.error('[EXPORT] DB error:', err);
      res.status(500).json({ error: err.message });
      return;
    }

    // Convert to CSV format
    const csvHeader = 'ref,productName,productName2,line,notice,size,unitPrice,productType,mainPic,pics,description,activeIngredients,usageInstructions,highlights\n';
    
    const csvData = rows.map(row => {
      const pics = row.pics ? JSON.parse(row.pics).join(';') : '';
      const highlights = row.highlights ? JSON.parse(row.highlights).join(';') : '';
      
      return `"${row.ref}","${row.productName}","${row.productName2}","${row.line}","${row.notice}","${row.size}",${row.unitPrice},"${row.productType}","${row.mainPic}","${pics}","${row.description}","${row.activeIngredients}","${row.usageInstructions}","${highlights}"`;
    }).join('\n');

    const csvContent = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products_export.csv');
    res.send(csvContent);
  });
});

// Admin utility: fix image URLs written previously with placeholders or wrong domain
app.post('/api/admin/fix-images', authenticateAdmin, (req, res) => {
  db.all('SELECT ref, mainPic, pics FROM products', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const toHttp = (u) => {
      const s = String(u || '').trim();
      if (!s) return '';
      return /^https?:\/\//i.test(s) ? s : '';
    };
    const needFix = [];
    rows.forEach((row) => {
      const current = toHttp(row.mainPic);
      let picsArr = [];
      try { picsArr = Array.isArray(row.pics) ? row.pics : JSON.parse(row.pics || '[]'); } catch (_) {}
      const firstValid = picsArr.find(p => toHttp(p));
      // Fix if no mainPic or it's placeholder domain while we have a valid pic URL
      const isPlaceholder = current.includes('via.placeholder.com');
      if ((!current && firstValid) || (isPlaceholder && firstValid)) {
        needFix.push({ ref: row.ref, newPic: firstValid });
      }
    });

    let updated = 0;
    if (needFix.length === 0) {
      return res.json({ updated, message: 'No images needed fixing' });
    }

    const stmt = db.prepare('UPDATE products SET mainPic = ? WHERE ref = ?');
    needFix.forEach(({ ref, newPic }, idx) => {
      stmt.run([newPic, ref], (e) => {
        if (!e) updated++;
        if (idx === needFix.length - 1) {
          stmt.finalize();
          res.json({ updated, attempted: needFix.length });
        }
      });
    });
  });
});

// Admin: replace mainPic from CSV pic column by ref number, without touching other fields
app.post('/api/admin/replace-pics-from-csv', authenticateAdmin, upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const defaultMapping = { ref: 'ref no', pic: 'pic' };
  let mapping = defaultMapping;
  if (req.body && req.body.columnMapping) {
    try { mapping = JSON.parse(req.body.columnMapping); } catch (_) { mapping = defaultMapping; }
  }

  const rows = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      const norm = {};
      Object.keys(data || {}).forEach((k) => { norm[String(k || '').trim()] = data[k]; });
      rows.push(norm);
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      let updated = 0;
      let missing = 0;
      const stmt = db.prepare('UPDATE products SET mainPic = ? WHERE ref = ?');
      let processed = 0;
      const maybeDone = () => {
        if (processed === rows.length) {
          stmt.finalize();
          res.json({ updated, missing });
        }
      };
      if (rows.length === 0) return res.json({ updated, missing });
      rows.forEach((r) => {
        const ref = (r[mapping.ref] || r['ref no'] || r.ref || '').toString().trim();
        const pic = (r[mapping.pic] || r.pic || '').toString();
        if (!ref || !pic) {
          missing++;
          processed++;
          return maybeDone();
        }
        stmt.run([pic, ref], (err) => {
          if (!err && this && this.changes) updated++;
          processed++;
          maybeDone();
        });
      });
    });
});

// Lightweight image proxy to avoid hotlink/CSP issues
app.get('/api/img', (req, res) => {
  const targetUrl = (req.query && req.query.u) ? String(req.query.u) : '';
  if (!targetUrl) {
    return res.status(400).send('Missing url');
  }

  const maxRedirects = 3;
  const fetchImage = (url, redirectsLeft) => {
    const client = url.startsWith('https') ? httpsMod : httpMod;
    const reqOpts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    const upstream = client.get(url, reqOpts, (upRes) => {
      // Handle redirects
      if (upRes.statusCode && upRes.statusCode >= 300 && upRes.statusCode < 400 && upRes.headers.location) {
        if (redirectsLeft > 0) {
          const nextUrl = upRes.headers.location.startsWith('http') ? upRes.headers.location : new URL(upRes.headers.location, url).toString();
          upRes.resume();
          fetchImage(nextUrl, redirectsLeft - 1);
          return;
        }
        res.status(502).send('Too many redirects');
        return;
      }

      if (upRes.statusCode !== 200) {
        res.status(upRes.statusCode || 502).send('Failed to load image');
        return;
      }

      const contentType = upRes.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      upRes.pipe(res);
    });

    upstream.on('error', (err) => {
      console.warn('[IMG PROXY] Error fetching:', url, err && err.message);
      if (!res.headersSent) {
        res.status(502).send('Image fetch error');
      } else {
        try { res.end(); } catch (_) {}
      }
    });
  };

  try {
    // Basic validation
    const parsed = new URL(targetUrl);
    if (!/^https?:$/.test(parsed.protocol)) {
      return res.status(400).send('Invalid protocol');
    }
  } catch (_) {
    return res.status(400).send('Invalid url');
  }

  fetchImage(targetUrl, maxRedirects);
});

// Add/Update product (admin) - requires authentication
app.post('/api/products', authenticateAdmin, (req, res) => {
  const product = req.body;
  
  if (!product.ref || !product.productName) {
    res.status(400).json({ error: 'Ref and productName are required' });
    return;
  }

  // Normalize pics: accept array or delimited string
  let pics = '[]';
  if (Array.isArray(product.pics)) {
    pics = JSON.stringify(product.pics);
  } else if (typeof product.pics === 'string') {
    const arr = product.pics
      .split(/\s*\|\s*|,|;|\n/)
      .map(s => s.trim())
      .filter(Boolean);
    pics = JSON.stringify(arr);
  }
  const highlights = Array.isArray(product.highlights) ? JSON.stringify(product.highlights) : product.highlights || '[]';
  // If mainPic not provided, use first pic from pics array
  const parsedPics = pics ? JSON.parse(pics) : [];
  const mainPic = (product.mainPic && String(product.mainPic).trim()) || parsedPics[0] || '';

  db.run(`INSERT OR REPLACE INTO products 
    (ref, productName, productName2, line, notice, size, unitPrice, productType, 
     mainPic, pics, description, activeIngredients, usageInstructions, highlights) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [product.ref, product.productName, product.productName2, product.line, product.notice, 
     product.size, product.unitPrice, product.productType, mainPic, pics, 
     product.description, product.activeIngredients, product.usageInstructions, highlights], 
    function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, message: 'Product saved successfully' });
  });
});

// Delete product (admin) - requires authentication
app.delete('/api/products/:ref', authenticateAdmin, (req, res) => {
  db.run('DELETE FROM products WHERE ref = ?', [req.params.ref], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Serve React app
if (hasBuild) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
