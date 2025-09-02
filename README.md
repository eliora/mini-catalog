# Mini Catalog with SQLite Database

A complete catalog management system with SQLite database, CSV import/export, admin backend, and simplified checkout.

## Features

### 🛍️ **Customer Features**
- **Product Catalog**: Browse products with search and filtering
- **Search by Reference**: Find products by reference number
- **Filter by Line**: Filter products by category/line
- **Product Details**: View detailed product information with images
- **Shopping Cart**: Add products to cart with quantity selection
- **Simplified Checkout**: Quick checkout with just customer name

### 🔧 **Admin Features**
- **Product Management**: Add, edit, and delete products
- **CSV Import/Export**: Bulk import products from CSV, export to CSV
- **Order Management**: View all orders with details
- **Database Management**: Full SQLite database integration

### 💾 **Database Features**
- **SQLite Database**: Lightweight, file-based database
- **Automatic Setup**: Database and tables created automatically
- **Data Persistence**: All data saved to local database file
- **Order History**: Complete order tracking

## Technology Stack

- **Frontend**: React 18, Material-UI (MUI)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **File Upload**: Multer
- **CSV Processing**: csv-parser

## Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend (port 3000).

## Usage

### Starting the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run server  # Backend only (port 5000)
npm start       # Frontend only (port 3000)
```

### Importing Your CSV Data

1. **Go to Admin Panel** (third tab)
2. **Click "Import/Export" tab**
3. **Select your CSV file** (should match the format of your Hebrew data)
4. **Click "Import"**

The system will automatically:
- Clear existing products
- Import all products from your CSV
- Generate placeholder images
- Parse Hebrew descriptions and ingredients

### CSV Format

Your CSV should have these columns (or similar):
- `ref no` or `ref` - Product reference number
- `hebrew_name` or `productName` - Product name in Hebrew
- `Product Name2` - Secondary product name
- `line` - Product category/line
- `short_description_he` or `notice` - Short description
- `Size` - Product size
- `description_he` - Full description
- `WirkungInhaltsstoffe_he` - Active ingredients
- `Anwendung_he` - Usage instructions

### Managing Products

1. **Add Product**: Click "Add Product" in Admin panel
2. **Edit Product**: Click edit icon next to any product
3. **Delete Product**: Click delete icon (with confirmation)
4. **Export Data**: Click "Export CSV" to download all products

### Processing Orders

1. **Browse Catalog**: Add products to cart
2. **Checkout**: Enter customer name only
3. **Order Saved**: Order automatically saved to database
4. **View Orders**: Check Admin panel "Orders" tab

## Database Structure

### Products Table
- `id` - Auto-increment primary key
- `ref` - Product reference number (unique)
- `productName` - Product name in Hebrew
- `productName2` - Secondary product name
- `line` - Product category
- `notice` - Short description
- `size` - Product size
- `unitPrice` - Price
- `productType` - Type of product
- `mainPic` - Main product image URL
- `pics` - Additional images (JSON array)
- `description` - Full description
- `activeIngredients` - Active ingredients
- `usageInstructions` - Usage instructions
- `highlights` - Product highlights (JSON array)
- `created_at` - Creation timestamp

### Orders Table
- `id` - Auto-increment primary key
- `customerName` - Customer name
- `total` - Order total
- `items` - Order items (JSON array)
- `created_at` - Order timestamp

## File Structure

```
mini-catalog/
├── server.js              # Express backend server
├── catalog.db             # SQLite database (auto-created)
├── uploads/               # File upload directory
├── src/
│   ├── components/
│   │   ├── Catalog.js     # Product catalog component
│   │   ├── OrderForm.js   # Order form component
│   │   └── Admin.js       # Admin panel component
│   ├── data/
│   │   └── hebrewData.js  # Sample Hebrew data
│   └── App.js             # Main application component
├── ready_to_import_jda_heb.csv  # Your Hebrew product data
└── package.json
```

## API Endpoints

### Products
- `GET /api/products` - Get all products (with search/filter)
- `GET /api/product-lines` - Get unique product lines
- `POST /api/products` - Add/update product
- `DELETE /api/products/:ref` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order

### Import/Export
- `POST /api/import-csv` - Import products from CSV
- `GET /api/export-csv` - Export products to CSV

## Customization

### Adding New Fields
1. Update the database schema in `server.js`
2. Modify the Admin component form
3. Update the Catalog component display
4. Adjust CSV import/export logic

### Styling
- Modify the theme in `App.js`
- Update Material-UI components styling
- Customize colors, fonts, and layout

### Database
- The SQLite database file (`catalog.db`) is created automatically
- Backup this file to preserve your data
- Can be opened with any SQLite browser

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Kill existing processes
   taskkill /f /im node.exe
   # Then restart
   npm run dev
   ```

2. **Database errors**:
   - Delete `catalog.db` file
   - Restart server (database will be recreated)

3. **CSV import issues**:
   - Check CSV format matches expected columns
   - Ensure CSV is UTF-8 encoded
   - Check file size (should be reasonable)

4. **Image loading**:
   - Images are placeholder URLs by default
   - Replace with actual image URLs in Admin panel

### Development

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: `./catalog.db`

## Production Deployment

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Deploy server.js** with the build folder
3. **Ensure uploads directory** has write permissions
4. **Backup catalog.db** regularly

## License

This project is open source and available under the MIT License.
