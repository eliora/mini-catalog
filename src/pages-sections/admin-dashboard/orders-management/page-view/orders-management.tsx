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
  ViewColumn,
  FileDownload,
  Refresh,
  Code
} from "@mui/icons-material";
import { H5, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import OrdersDataTable from "../orders-data-table";
import OrderRevivalDialog from "../order-revival-dialog";
import SqlEditorDialog from "../sql-editor-dialog";
import BulkOrderActions from "../bulk-order-actions";

// Define Order interface for data table
interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items_count: number;
  created_at: string;
  updated_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

// Define Order interface for revival dialog
interface OrderForRevival {
  id: string;
  client_id: string;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
  updated_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  client?: {
    id: string;
    name: string;
    email: string;
    phone_number?: string;
    business_name?: string;
    address?: string | null;
    user_roles: string[];
    status: string;
  };
}

// Orders data will be loaded from API
const mockOrders: Order[] = [];

interface OrdersManagementViewProps {
  // Props can be added here when needed
  [key: string]: unknown;
}

export default function OrdersManagementView(_props: OrdersManagementViewProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [isRevivalDialogOpen, setIsRevivalDialogOpen] = useState(false);
  const [isSqlEditorOpen, setIsSqlEditorOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderForRevival | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    customer: true,
    items: true,
    total: true,
    status: true,
    payment: true,
    date: true,
    actions: true
  });

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(order => order.payment_status === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // Convert Order to OrderForRevival
  const convertOrderForRevival = (order: Order): OrderForRevival => {
    return {
      id: order.id,
      client_id: order.customer_email, // Use email as client_id for now
      total_amount: order.total_amount,
      status: order.status,
      items_count: order.items_count,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.items,
      client: {
        id: order.customer_email,
        name: order.customer_name,
        email: order.customer_email,
        phone_number: order.customer_phone,
        user_roles: [],
        status: 'active'
      }
    };
  };

  const handleOrderRevive = (orderData: OrderForRevival) => {
    if (editingOrder) {
      // Update existing order
      setOrders(prev => prev.map(o => o.id === orderData.id ? { ...o, ...orderData, status: "processing" } : o));
      setSnackbar({ open: true, message: "ההזמנה הוחזרה לחיים ועודכנה בהצלחה", severity: "success" });
    }
    setIsRevivalDialogOpen(false);
    setEditingOrder(null);
  };

  const handleOrderDelete = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setSnackbar({ open: true, message: "ההזמנה נמחקה בהצלחה", severity: "success" });
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setSnackbar({ open: true, message: "סטטוס ההזמנה עודכן בהצלחה", severity: "success" });
  };

  const handleBulkStatusChange = (newStatus: string) => {
    setOrders(prev => prev.map(o => selectedOrders.includes(o.id) ? { ...o, status: newStatus } : o));
    setSelectedOrders([]);
    setSnackbar({ open: true, message: `${selectedOrders.length} הזמנות עודכנו בהצלחה`, severity: "success" });
  };

  const handleExport = () => {
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "מספר הזמנה,לקוח,סה\"כ,סטטוס,תשלום,תאריך\n" +
      filteredOrders.map(o => `${o.id},${o.customer_name},${o.total_amount},${o.status},${o.payment_status},${o.created_at}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbar({ open: true, message: "הקובץ יוצא בהצלחה", severity: "success" });
  };

  const handlePrint = (orderId: string) => {
    // Mock print functionality
    console.log("Printing order:", orderId);
    setSnackbar({ open: true, message: "ההזמנה נשלחה להדפסה", severity: "success" });
  };

  const handleSendEmail = (orderId: string) => {
    // Mock email functionality
    console.log("Sending email for order:", orderId);
    setSnackbar({ open: true, message: "אימייל נשלח ללקוח", severity: "success" });
  };

  const statuses = [
    { value: "pending", label: "ממתין" },
    { value: "processing", label: "מעובד" },
    { value: "shipped", label: "נשלח" },
    { value: "delivered", label: "נמסר" },
    { value: "completed", label: "הושלם" },
    { value: "cancelled", label: "בוטל" }
  ];

  const paymentStatuses = [
    { value: "pending", label: "ממתין לתשלום" },
    { value: "paid", label: "שולם" },
    { value: "failed", label: "נכשל" },
    { value: "refunded", label: "הוחזר" }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>ניהול הזמנות</H5>
        <Paragraph color="grey.600">
          נהל הזמנות, עדכן סטטוסים, החיה הזמנות ושלח מסמכים
        </Paragraph>
      </Box>

      {/* Toolbar */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <Box sx={{ p: 3 }}>
          <FlexBetween mb={2}>
            <FlexBox gap={2} alignItems="center">
              <TextField
                size="small"
                placeholder="חיפוש הזמנות..."
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

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>תשלום</InputLabel>
                <Select
                  value={paymentFilter}
                  label="תשלום"
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">הכל</MenuItem>
                  {paymentStatuses.map(status => (
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
                startIcon={<Code />}
                onClick={() => setIsSqlEditorOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                SQL Editor
              </Button>
              
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
            </FlexBox>
          </FlexBetween>

          {/* Active Filters */}
          {(searchTerm || statusFilter !== "all" || paymentFilter !== "all") && (
            <FlexBox gap={1} flexWrap="wrap">
              {searchTerm && (
                <Chip
                  label={`חיפוש: ${searchTerm}`}
                  onDelete={() => setSearchTerm("")}
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
              {paymentFilter !== "all" && (
                <Chip
                  label={`תשלום: ${paymentStatuses.find(s => s.value === paymentFilter)?.label}`}
                  onDelete={() => setPaymentFilter("all")}
                  size="small"
                />
              )}
            </FlexBox>
          )}
        </Box>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <BulkOrderActions
          selectedCount={selectedOrders.length}
          onBulkStatusChange={handleBulkStatusChange}
          onClearSelection={() => setSelectedOrders([])}
        />
      )}

      {/* Orders Table */}
      <OrdersDataTable
        orders={filteredOrders}
        selectedOrders={selectedOrders}
        onSelectionChange={setSelectedOrders}
        visibleColumns={visibleColumns}
        onRevive={(order) => {
          setEditingOrder(convertOrderForRevival(order));
          setIsRevivalDialogOpen(true);
        }}
        onDelete={handleOrderDelete}
        onStatusChange={handleStatusChange}
        onPrint={handlePrint}
        onSendEmail={handleSendEmail}
      />

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

      {/* Order Revival Dialog */}
      <OrderRevivalDialog
        open={isRevivalDialogOpen}
        order={editingOrder}
        onClose={() => {
          setIsRevivalDialogOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleOrderRevive}
      />

      {/* SQL Editor Dialog */}
      <SqlEditorDialog
        open={isSqlEditorOpen}
        onClose={() => setIsSqlEditorOpen(false)}
        onExecute={(query) => {
          console.log("Executing SQL:", query);
          setSnackbar({ open: true, message: "השאילתה בוצעה בהצלחה", severity: "success" });
        }}
      />

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