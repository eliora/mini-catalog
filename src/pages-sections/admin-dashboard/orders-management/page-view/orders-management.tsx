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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from "@mui/material";
import {
  Search,
  Add,
  FilterList,
  ViewColumn,
  FileDownload,
  Refresh,
  Print,
  Email,
  Edit,
  Restore,
  Code
} from "@mui/icons-material";
import { H5, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import OrdersDataTable from "../orders-data-table";
import OrderRevivalDialog from "../order-revival-dialog";
import SqlEditorDialog from "../sql-editor-dialog";
import BulkOrderActions from "../bulk-order-actions";

// Mock orders data
const mockOrders = [
  {
    id: "ORD-001",
    customer_name: "שרה כהן",
    customer_email: "sarah@example.com",
    customer_phone: "050-1234567",
    total_amount: 485.50,
    status: "completed",
    payment_status: "paid",
    items_count: 3,
    created_at: "2024-01-20T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    items: [
      { product_name: "סרום ויטמין C", quantity: 2, price: 189 },
      { product_name: "קרם לחות", quantity: 1, price: 145 }
    ]
  },
  {
    id: "ORD-002",
    customer_name: "רחל לוי",
    customer_email: "rachel@example.com", 
    customer_phone: "052-9876543",
    total_amount: 299.00,
    status: "processing",
    payment_status: "paid",
    items_count: 1,
    created_at: "2024-01-21T09:15:00Z",
    updated_at: "2024-01-21T09:15:00Z",
    items: [
      { product_name: "מסכת זהב", quantity: 1, price: 299 }
    ]
  },
  {
    id: "ORD-003",
    customer_name: "מיכל אברהם",
    customer_email: "michal@example.com",
    customer_phone: "054-5555555",
    total_amount: 178.00,
    status: "cancelled",
    payment_status: "refunded",
    items_count: 2,
    created_at: "2024-01-19T16:20:00Z",
    updated_at: "2024-01-20T08:30:00Z",
    items: [
      { product_name: "שמן ארגן", quantity: 2, price: 89 }
    ]
  }
];

interface OrdersManagementViewProps {
  // Props can be added here when needed
}

export default function OrdersManagementView(_props: OrdersManagementViewProps) {
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [isRevivalDialogOpen, setIsRevivalDialogOpen] = useState(false);
  const [isSqlEditorOpen, setIsSqlEditorOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
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

  const handleOrderRevive = (orderData: any) => {
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
          setEditingOrder(order);
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