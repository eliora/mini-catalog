"use client";

import { useState } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Avatar,
  Chip,
  Switch,
  Menu,
  MenuItem,
  Box,
  Typography,
  Pagination,
  Stack
} from "@mui/material";
import {
  Edit,
  Delete,
  MoreVert,
  Visibility,
  ContentCopy
} from "@mui/icons-material";
import { FlexBox } from "@/components/flex-box";
import { Paragraph } from "@/components/Typography";
import { currency } from "@/lib/currency";

interface Product {
  id: string;
  ref: string;
  name: string;
  name_en?: string;
  description?: string;
  category: string;
  price: number;
  cost_price?: number;
  stock: number;
  low_stock_threshold?: number;
  status: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

interface ProductsDataTableProps {
  products: Product[];
  selectedProducts: string[];
  onSelectionChange: (selected: string[]) => void;
  visibleColumns: Record<string, boolean>;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onStatusChange: (productId: string, status: string) => void;
}

export default function ProductsDataTable({
  products,
  selectedProducts,
  onSelectionChange,
  visibleColumns,
  onEdit,
  onDelete,
  onStatusChange
}: ProductsDataTableProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProductForMenu, setSelectedProductForMenu] = useState<Product | null>(null);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange(products.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (productId: string) => {
    const selectedIndex = selectedProducts.indexOf(productId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedProducts, productId];
    } else {
      newSelected = selectedProducts.filter(id => id !== productId);
    }

    onSelectionChange(newSelected);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "draft": return "warning";
      case "out_of_stock": return "error";
      case "discontinued": return "default";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "פעיל";
      case "draft": return "טיוטה";
      case "out_of_stock": return "אזל מהמלאי";
      case "discontinued": return "הופסק";
      default: return status;
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (order === "asc") {
      return a[orderBy as keyof Product] < b[orderBy as keyof Product] ? -1 : 1;
    }
    return a[orderBy as keyof Product] > b[orderBy as keyof Product] ? -1 : 1;
  });

  // Paginate products
  const paginatedProducts = sortedProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const isSelected = (productId: string) => selectedProducts.indexOf(productId) !== -1;
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              
              {visibleColumns.ref && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "ref"}
                    direction={orderBy === "ref" ? order : "asc"}
                    onClick={() => handleSort("ref")}
                  >
                    מק"ט
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.name && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleSort("name")}
                  >
                    שם המוצר
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.category && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "category"}
                    direction={orderBy === "category" ? order : "asc"}
                    onClick={() => handleSort("category")}
                  >
                    קטגוריה
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.price && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "price"}
                    direction={orderBy === "price" ? order : "asc"}
                    onClick={() => handleSort("price")}
                  >
                    מחיר
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.stock && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "stock"}
                    direction={orderBy === "stock" ? order : "asc"}
                    onClick={() => handleSort("stock")}
                  >
                    מלאי
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.status && (
                <TableCell>סטטוס</TableCell>
              )}

              {visibleColumns.actions && (
                <TableCell align="center">פעולות</TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow
                key={product.id}
                hover
                selected={isSelected(product.id)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(product.id)}
                    onChange={() => handleSelectOne(product.id)}
                  />
                </TableCell>

                {visibleColumns.ref && (
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {product.ref}
                    </Typography>
                  </TableCell>
                )}

                {visibleColumns.name && (
                  <TableCell>
                    <FlexBox alignItems="center" gap={2}>
                      <Avatar
                        src={product.images?.[0] || "/api/placeholder/40/40"}
                        sx={{ width: 40, height: 40, borderRadius: 2 }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {product.name}
                        </Typography>
                        {product.name_en && (
                          <Typography variant="caption" color="text.secondary">
                            {product.name_en}
                          </Typography>
                        )}
                      </Box>
                    </FlexBox>
                  </TableCell>
                )}

                {visibleColumns.category && (
                  <TableCell>
                    <Chip
                      label={product.category}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                )}

                {visibleColumns.price && (
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {currency(product.price)}
                      </Typography>
                      {product.cost_price && (
                        <Typography variant="caption" color="text.secondary">
                          עלות: {currency(product.cost_price)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                )}

                {visibleColumns.stock && (
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={product.stock <= (product.low_stock_threshold || 0) ? "error.main" : "text.primary"}
                      >
                        {product.stock}
                      </Typography>
                      {product.stock <= (product.low_stock_threshold || 0) && (
                        <Typography variant="caption" color="error.main">
                          מלאי נמוך
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                )}

                {visibleColumns.status && (
                  <TableCell>
                    <Chip
                      label={getStatusText(product.status)}
                      color={getStatusColor(product.status) as any}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                )}

                {visibleColumns.actions && (
                  <TableCell align="center">
                    <FlexBox gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(product)}
                        sx={{ color: "primary.main" }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        sx={{ color: "info.main" }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        sx={{ color: "secondary.main" }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedProductForMenu(product);
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </FlexBox>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary">
          מציג {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, products.length)} מתוך {products.length} מוצרים
        </Typography>
        
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(products.length / rowsPerPage)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Stack>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedProductForMenu(null);
        }}
      >
        <MenuItem onClick={() => {
          if (selectedProductForMenu) {
            onEdit(selectedProductForMenu);
          }
          setAnchorEl(null);
        }}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          ערוך
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedProductForMenu) {
            onStatusChange(selectedProductForMenu.id, selectedProductForMenu.status === "active" ? "draft" : "active");
          }
          setAnchorEl(null);
        }}>
          <Switch sx={{ mr: 1 }} />
          {selectedProductForMenu?.status === "active" ? "השבת" : "הפעל"}
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            if (selectedProductForMenu) {
              onDelete(selectedProductForMenu.id);
            }
            setAnchorEl(null);
          }}
          sx={{ color: "error.main" }}
        >
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          מחק
        </MenuItem>
      </Menu>
    </Card>
  );
}
