"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  Typography
} from "@mui/material";
import {
  Search,
  Add,
  FilterList,
  ViewColumn,
  FileDownload,
  Refresh,
  MoreVert
} from "@mui/icons-material";
import { H5, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import ProductsDataTable from "../products-data-table";
import ProductFormDialog from "../product-form-dialog";
import BulkActionsToolbar from "../bulk-actions-toolbar";

// Product interface matching database schema
interface Product {
  id: string;
  ref: string;
  hebrew_name?: string;
  english_name?: string;
  french_name?: string;
  product_line?: string;
  product_type?: string;
  type?: string;
  size?: string;
  qty: number;
  unit_price?: number;
  description?: string;
  description_he?: string;
  main_pic?: string;
  pics?: any;
  created_at: string;
  updated_at: string;
  // Computed fields
  display_name?: string;
  formatted_price?: string;
  stock_status?: string;
  stock_status_color?: string;
  parsed_images?: any;
}

interface ApiResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    totalProducts: number;
    inStockCount: number;
    outOfStockCount: number;
    lowStockCount: number;
    productLinesCount: number;
    avgPrice: number;
  };
  filters?: {
    available_product_lines: string[];
    available_product_types: string[];
    available_stock_statuses: string[];
  };
}

interface ProductsManagementViewProps {
  // Props can be added here when needed
}

export default function ProductsManagementView(_props: ProductsManagementViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productLineFilter, setProductLineFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState<any>({});
  const [availableFilters, setAvailableFilters] = useState<any>({});

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    ref: true,
    name: true,
    category: true,
    price: true,
    stock: true,
    status: true,
    actions: true
  });

  // Fetch products from API
  const fetchProducts = useCallback(async (page = 1, limit = 10, filters: any = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        include_stats: 'true',
        include_filters: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(productLineFilter !== 'all' && { product_line: productLineFilter }),
        ...(stockStatusFilter !== 'all' && { stock_status: stockStatusFilter }),
        ...filters
      });

      const response = await fetch(`/api/admin/products?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }

      const data: ApiResponse = await response.json();
      
      setProducts(data.products);
      setPagination(data.pagination);
      
      if (data.stats) {
        setStats(data.stats);
      }
      
      if (data.filters) {
        setAvailableFilters(data.filters);
      }

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, productLineFilter, stockStatusFilter]);

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts(pagination.page, pagination.limit);
  }, [fetchProducts, pagination.page, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductSave = async (productData: any) => {
    try {
      setLoading(true);
      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const requestData = {
        ...(editingProduct && { id: editingProduct.id }),
        ...productData,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingProduct ? 'update' : 'create'} product`);
      }

      await fetchProducts(pagination.page, pagination.limit);
      setSnackbar({ 
        open: true, 
        message: editingProduct ? "המוצר עודכן בהצלחה" : "המוצר נוסף בהצלחה", 
        severity: "success" 
      });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'שגיאה בשמירת המוצר', severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      await fetchProducts(pagination.page, pagination.limit);
      setSnackbar({ open: true, message: "המוצר נמחק בהצלחה", severity: "success" });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'שגיאה במחיקת המוצר', severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = () => {
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
    setSnackbar({ open: true, message: `${selectedProducts.length} מוצרים נמחקו בהצלחה`, severity: "success" });
  };

  const handleExport = () => {
    // Export products to CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "מק\"ט,שם עברי,שם אנגלי,קו מוצרים,סוג,מחיר,מלאי\n" +
      products.map(p => `${p.ref},"${p.hebrew_name || ''}","${p.english_name || ''}","${p.product_line || ''}","${p.product_type || ''}",${p.unit_price || 0},${p.qty}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({ open: true, message: "הקובץ יוצא בהצלחה", severity: "success" });
  };

  const productLines = availableFilters.available_product_lines || [];
  const stockStatuses = [
    { value: "in_stock", label: "במלאי" },
    { value: "low_stock", label: "מלאי נמוך" },
    { value: "out_of_stock", label: "אזל מהמלאי" }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>ניהול מוצרים</H5>
        <Paragraph color="grey.600">
          נהל את קטלוג המוצרים, מחירים, מלאי וקטגוריות
        </Paragraph>
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <Box sx={{ p: 3 }}>
          <FlexBetween mb={2}>
            <FlexBox gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="חיפוש מוצרים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>קו מוצרים</InputLabel>
                <Select
                  value={productLineFilter}
                  label="קו מוצרים"
                  onChange={(e) => setProductLineFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">הכל</MenuItem>
                  {productLines.map((line: string) => (
                    <MenuItem key={line} value={line}>{line}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>מלאי</InputLabel>
                <Select
                  value={stockStatusFilter}
                  label="מלאי"
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">הכל</MenuItem>
                  {stockStatuses.map(status => (
                    <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FlexBox>

            <FlexBox gap={1}>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ bgcolor: "grey.100" }}
              >
                <ViewColumn />
              </IconButton>
              
              <Button
                variant="outlined"
                startIcon={<FileDownload />}
                onClick={handleExport}
                sx={{ borderRadius: 2 }}
              >
                ייצא
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ borderRadius: 2 }}
              >
                רענן
              </Button>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductDialogOpen(true);
                }}
                sx={{ borderRadius: 2 }}
              >
                הוסף מוצר
              </Button>
            </FlexBox>
          </FlexBetween>

          {/* Active Filters */}
          {(searchTerm || productLineFilter !== "all" || stockStatusFilter !== "all") && (
            <FlexBox gap={1} flexWrap="wrap">
              {searchTerm && (
                <Chip
                  label={`חיפוש: ${searchTerm}`}
                  onDelete={() => setSearchTerm("")}
                  size="small"
                />
              )}
              {productLineFilter !== "all" && (
                <Chip
                  label={`קו מוצרים: ${productLineFilter}`}
                  onDelete={() => setProductLineFilter("all")}
                  size="small"
                />
              )}
              {stockStatusFilter !== "all" && (
                <Chip
                  label={`מלאי: ${stockStatuses.find(s => s.value === stockStatusFilter)?.label}`}
                  onDelete={() => setStockStatusFilter("all")}
                  size="small"
                />
              )}
            </FlexBox>
          )}
        </Box>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedProducts.length}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedProducts([])}
        />
      )}

      {/* Products Table */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography>טוען מוצרים...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <ProductsDataTable
            products={products}
            onEdit={(product) => {
              setEditingProduct(product);
              setIsProductDialogOpen(true);
            }}
            onDelete={handleProductDelete}
          />
        )}
      </Card>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Object.entries(visibleColumns).map(([column, visible]) => (
          <MenuItem key={column}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visible}
                  onChange={(e) => setVisibleColumns(prev => ({
                    ...prev,
                    [column]: e.target.checked
                  }))}
                />
              }
              label={column}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}