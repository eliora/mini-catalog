"use client";

import { useState, useEffect } from "react";
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
  Snackbar
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

// Mock products data
const mockProducts = [
  {
    id: "1",
    ref: "SER001",
    name: "סרום ויטמין C",
    name_en: "Vitamin C Serum",
    description: "סרום מתקדם עם ויטמין C טהור לחידוש העור",
    category: "סרומים",
    price: 189,
    cost_price: 95,
    stock: 45,
    low_stock_threshold: 10,
    status: "active",
    images: ["/api/placeholder/200/200"],
    created_at: "2024-01-15",
    updated_at: "2024-01-20"
  },
  {
    id: "2", 
    ref: "CRM002",
    name: "קרם לחות יום",
    name_en: "Day Moisturizer",
    description: "קרם לחות עשיר לעור יבש",
    category: "קרמים",
    price: 145,
    cost_price: 72,
    stock: 23,
    low_stock_threshold: 15,
    status: "active",
    images: ["/api/placeholder/200/200"],
    created_at: "2024-01-10",
    updated_at: "2024-01-18"
  },
  {
    id: "3",
    ref: "MSK003", 
    name: "מסכת זהב",
    name_en: "Gold Face Mask",
    description: "מסכה יוקרתית עם חלקיקי זהב",
    category: "מסכות",
    price: 299,
    cost_price: 150,
    stock: 0,
    low_stock_threshold: 5,
    status: "out_of_stock",
    images: ["/api/placeholder/200/200"],
    created_at: "2024-01-05",
    updated_at: "2024-01-22"
  },
  {
    id: "4",
    ref: "OIL004",
    name: "שמן ארגן",
    name_en: "Argan Oil", 
    description: "שמן ארגן טהור למזון ולחות העור",
    category: "שמנים",
    price: 89,
    cost_price: 45,
    stock: 67,
    low_stock_threshold: 20,
    status: "active",
    images: ["/api/placeholder/200/200"],
    created_at: "2024-01-12",
    updated_at: "2024-01-19"
  }
];

interface ProductsManagementViewProps {}

export default function ProductsManagementView({}: ProductsManagementViewProps) {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

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

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleProductSave = (productData: any) => {
    if (editingProduct) {
      // Update existing product
      setProducts(prev => prev.map(p => p.id === productData.id ? { ...p, ...productData } : p));
      setSnackbar({ open: true, message: "המוצר עודכן בהצלחה", severity: "success" });
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        id: Date.now().toString(),
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };
      setProducts(prev => [...prev, newProduct]);
      setSnackbar({ open: true, message: "המוצר נוסף בהצלחה", severity: "success" });
    }
    setIsProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleProductDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setSnackbar({ open: true, message: "המוצר נמחק בהצלחה", severity: "success" });
  };

  const handleBulkDelete = () => {
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
    setSnackbar({ open: true, message: `${selectedProducts.length} מוצרים נמחקו בהצלחה`, severity: "success" });
  };

  const handleExport = () => {
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "מק\"ט,שם מוצר,קטגוריה,מחיר,מלאי,סטטוס\n" +
      filteredProducts.map(p => `${p.ref},${p.name},${p.category},${p.price},${p.stock},${p.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({ open: true, message: "הקובץ יוצא בהצלחה", severity: "success" });
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const statuses = [
    { value: "active", label: "פעיל" },
    { value: "draft", label: "טיוטה" },
    { value: "out_of_stock", label: "אזל מהמלאי" },
    { value: "discontinued", label: "הופסק" }
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
                <InputLabel>קטגוריה</InputLabel>
                <Select
                  value={categoryFilter}
                  label="קטגוריה"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">הכל</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>סטטוס</InputLabel>
                <Select
                  value={statusFilter}
                  label="סטטוס"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">הכל</MenuItem>
                  {statuses.map(status => (
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
          {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
            <FlexBox gap={1} flexWrap="wrap">
              {searchTerm && (
                <Chip
                  label={`חיפוש: ${searchTerm}`}
                  onDelete={() => setSearchTerm("")}
                  size="small"
                />
              )}
              {categoryFilter !== "all" && (
                <Chip
                  label={`קטגוריה: ${categoryFilter}`}
                  onDelete={() => setCategoryFilter("all")}
                  size="small"
                />
              )}
              {statusFilter !== "all" && (
                <Chip
                  label={`סטטוס: ${statuses.find(s => s.value === statusFilter)?.label}`}
                  onDelete={() => setStatusFilter("all")}
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
        <ProductsDataTable
          products={filteredProducts}
          onEdit={(product) => {
            setEditingProduct(product as any);
            setIsProductDialogOpen(true);
          }}
          onDelete={handleProductDelete}
        />
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