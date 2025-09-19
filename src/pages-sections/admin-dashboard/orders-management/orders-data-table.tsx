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
  Chip,
  Menu,
  MenuItem,
  Box,
  Typography,
  Pagination,
  Stack,
  Avatar,
  Tooltip
} from "@mui/material";
import {
  Delete,
  MoreVert,
  Print,
  Email,
  Restore,
  LocalShipping
} from "@mui/icons-material";
import { FlexBox } from "@/components/flex-box";
import { currency } from "@/lib/currency";

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

interface OrdersDataTableProps {
  orders: Order[];
  selectedOrders: string[];
  onSelectionChange: (selected: string[]) => void;
  visibleColumns: Record<string, boolean>;
  onRevive: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onPrint: (orderId: string) => void;
  onSendEmail: (orderId: string) => void;
}

export default function OrdersDataTable({
  orders,
  selectedOrders,
  onSelectionChange,
  visibleColumns,
  onRevive,
  onDelete,
  onStatusChange,
  onPrint,
  onSendEmail
}: OrdersDataTableProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState<Order | null>(null);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange(orders.map(o => o.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (orderId: string) => {
    const selectedIndex = selectedOrders.indexOf(orderId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedOrders, orderId];
    } else {
      newSelected = selectedOrders.filter(id => id !== orderId);
    }

    onSelectionChange(newSelected);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "processing": return "info";
      case "shipped": return "primary";
      case "delivered": return "success";
      case "completed": return "success";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "ממתין";
      case "processing": return "מעובד";
      case "shipped": return "נשלח";
      case "delivered": return "נמסר";
      case "completed": return "הושלם";
      case "cancelled": return "בוטל";
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "paid": return "success";
      case "failed": return "error";
      case "refunded": return "info";
      default: return "default";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "pending": return "ממתין";
      case "paid": return "שולם";
      case "failed": return "נכשל";
      case "refunded": return "הוחזר";
      default: return status;
    }
  };

  // Sort orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (order === "asc") {
      return a[orderBy as keyof Order] < b[orderBy as keyof Order] ? -1 : 1;
    }
    return a[orderBy as keyof Order] > b[orderBy as keyof Order] ? -1 : 1;
  });

  // Paginate orders
  const paginatedOrders = sortedOrders.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const isSelected = (orderId: string) => selectedOrders.indexOf(orderId) !== -1;
  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length;
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < orders.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
              
              {visibleColumns.id && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "id"}
                    direction={orderBy === "id" ? order : "asc"}
                    onClick={() => handleSort("id")}
                  >
                    מספר הזמנה
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.customer && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "customer_name"}
                    direction={orderBy === "customer_name" ? order : "asc"}
                    onClick={() => handleSort("customer_name")}
                  >
                    לקוח
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.items && (
                <TableCell>מוצרים</TableCell>
              )}

              {visibleColumns.total && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "total_amount"}
                    direction={orderBy === "total_amount" ? order : "asc"}
                    onClick={() => handleSort("total_amount")}
                  >
                    סה&quot;כ
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.status && (
                <TableCell>סטטוס</TableCell>
              )}

              {visibleColumns.payment && (
                <TableCell>תשלום</TableCell>
              )}

              {visibleColumns.date && (
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "created_at"}
                    direction={orderBy === "created_at" ? order : "asc"}
                    onClick={() => handleSort("created_at")}
                  >
                    תאריך
                  </TableSortLabel>
                </TableCell>
              )}

              {visibleColumns.actions && (
                <TableCell align="center">פעולות</TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedOrders.map((orderItem) => (
              <TableRow
                key={orderItem.id}
                hover
                selected={isSelected(orderItem.id)}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(orderItem.id)}
                    onChange={() => handleSelectOne(orderItem.id)}
                  />
                </TableCell>

                {visibleColumns.id && (
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {orderItem.id}
                    </Typography>
                  </TableCell>
                )}

                {visibleColumns.customer && (
                  <TableCell>
                    <FlexBox alignItems="center" gap={2}>
                      <Avatar
                        sx={{ width: 40, height: 40, bgcolor: "primary.main" }}
                      >
                        {orderItem.customer_name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {orderItem.customer_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {orderItem.customer_email}
                        </Typography>
                      </Box>
                    </FlexBox>
                  </TableCell>
                )}

                {visibleColumns.items && (
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {orderItem.items_count} מוצרים
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {orderItem.items.slice(0, 2).map(item => item.product_name).join(", ")}
                        {orderItem.items.length > 2 && "..."}
                      </Typography>
                    </Box>
                  </TableCell>
                )}

                {visibleColumns.total && (
                  <TableCell>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {currency(orderItem.total_amount)}
                    </Typography>
                  </TableCell>
                )}

                {visibleColumns.status && (
                  <TableCell>
                    <Chip
                      label={getStatusText(orderItem.status)}
                      color={getStatusColor(orderItem.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                      size="small"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                )}

                {visibleColumns.payment && (
                  <TableCell>
                    <Chip
                      label={getPaymentStatusText(orderItem.payment_status)}
                      color={getPaymentStatusColor(orderItem.payment_status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  </TableCell>
                )}

                {visibleColumns.date && (
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(orderItem.created_at)}
                    </Typography>
                  </TableCell>
                )}

                {visibleColumns.actions && (
                  <TableCell align="center">
                    <FlexBox gap={0.5}>
                      <Tooltip title="הדפס">
                        <IconButton
                          size="small"
                          onClick={() => onPrint(orderItem.id)}
                          sx={{ color: "primary.main" }}
                        >
                          <Print fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="שלח אימייל">
                        <IconButton
                          size="small"
                          onClick={() => onSendEmail(orderItem.id)}
                          sx={{ color: "info.main" }}
                        >
                          <Email fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {(orderItem.status === "cancelled" || orderItem.status === "completed") && (
                        <Tooltip title="החיה הזמנה">
                          <IconButton
                            size="small"
                            onClick={() => onRevive(orderItem)}
                            sx={{ color: "success.main" }}
                          >
                            <Restore fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedOrderForMenu(orderItem);
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
          מציג {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, orders.length)} מתוך {orders.length} הזמנות
        </Typography>
        
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(orders.length / rowsPerPage)}
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
          setSelectedOrderForMenu(null);
        }}
      >
        <MenuItem onClick={() => {
          if (selectedOrderForMenu) {
            onRevive(selectedOrderForMenu);
          }
          setAnchorEl(null);
        }}>
          <Restore sx={{ mr: 1, fontSize: 20 }} />
          החיה הזמנה
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedOrderForMenu) {
            onStatusChange(selectedOrderForMenu.id, "processing");
          }
          setAnchorEl(null);
        }}>
          <LocalShipping sx={{ mr: 1 }} />
          עדכן לעיבוד
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedOrderForMenu) {
            onPrint(selectedOrderForMenu.id);
          }
          setAnchorEl(null);
        }}>
          <Print sx={{ mr: 1, fontSize: 20 }} />
          הדפס
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            if (selectedOrderForMenu) {
              onDelete(selectedOrderForMenu.id);
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
