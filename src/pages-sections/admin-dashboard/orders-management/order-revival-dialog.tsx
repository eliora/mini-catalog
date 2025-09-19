"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from "@mui/material";
import {
  Close,
  Add,
  Delete,
  Restore,
  Person,
  ShoppingCart,
  Payment
} from "@mui/icons-material";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { H6 } from "@/components/Typography";
import { currency } from "@/lib/currency";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  client_id: string;
  total_amount: number;
  status: string;
  items_count: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
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

interface OrderRevivalDialogProps {
  open: boolean;
  order?: Order | null;
  onClose: () => void;
  onSave: (order: Order) => void;
}

export default function OrderRevivalDialog({
  open,
  order,
  onClose,
  onSave
}: OrderRevivalDialogProps) {
  const [formData, setFormData] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState<OrderItem>({
    product_name: "",
    quantity: 1,
    price: 0
  });

  useEffect(() => {
    if (order) {
      setFormData(order);
      setItems(order.items || []);
    }
  }, [order, open]);

  const handleSubmit = () => {
    if (formData) {
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const updatedOrder = {
        ...formData,
        items,
        items_count: items.length,
        total_amount: totalAmount,
        status: "processing", // Revival automatically sets to processing
        updated_at: new Date().toISOString(),
        client_id: formData.client_id
      };
      onSave(updatedOrder);
    }
  };

  const handleAddItem = () => {
    if (newItem.product_name && newItem.price > 0) {
      setItems(prev => [...prev, newItem]);
      setNewItem({ product_name: "", quantity: 1, price: 0 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  if (!formData) return null;

  const statuses = [
    { value: "pending", label: "ממתין" },
    { value: "processing", label: "מעובד" },
    { value: "shipped", label: "נשלח" },
    { value: "delivered", label: "נמסר" },
    { value: "completed", label: "הושלם" }
  ];

  const paymentStatuses: Array<{ value: string; label: string }> = [ // eslint-disable-line @typescript-eslint/no-unused-vars
    { value: "pending", label: "ממתין לתשלום" },
    { value: "paid", label: "שולם" },
    { value: "failed", label: "נכשל" },
    { value: "refunded", label: "הוחזר" }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <FlexBetween>
          <FlexBox alignItems="center" gap={2}>
            <Restore color="success" />
            <Typography variant="h6" fontWeight={700}>
              החיית הזמנה - {formData.id}
            </Typography>
          </FlexBox>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </FlexBetween>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          החיית הזמנה מאפשרת לערוך הזמנה שהושלמה או בוטלה ולהחזירה למצב פעיל
        </Alert>

        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
              <CardContent>
                <FlexBox alignItems="center" gap={2} mb={2}>
                  <Person color="primary" />
                  <H6 sx={{ fontWeight: 700 }}>פרטי הלקוח</H6>
                </FlexBox>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="שם הלקוח"
                      value={formData.client?.name || ''}
                      onChange={(e) => setFormData(prev => prev ? { 
                        ...prev, 
                        client: prev.client ? { ...prev.client, name: e.target.value } : { 
                          id: prev.client_id, 
                          name: e.target.value, 
                          email: '', 
                          user_roles: [], 
                          status: 'active' 
                        } 
                      } : null)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="אימייל"
                      type="email"
                      value={formData.client?.email || ''}
                      onChange={(e) => setFormData(prev => prev ? { 
                        ...prev, 
                        client: prev.client ? { ...prev.client, email: e.target.value } : { 
                          id: prev.client_id, 
                          name: '', 
                          email: e.target.value, 
                          user_roles: [], 
                          status: 'active' 
                        } 
                      } : null)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="טלפון"
                      value={formData.client?.phone_number || ''}
                      onChange={(e) => setFormData(prev => prev ? { 
                        ...prev, 
                        client: prev.client ? { ...prev.client, phone_number: e.target.value } : { 
                          id: prev.client_id, 
                          name: '', 
                          email: '', 
                          phone_number: e.target.value, 
                          user_roles: [], 
                          status: 'active' 
                        } 
                      } : null)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "success.200" }}>
              <CardContent>
                <FlexBetween mb={2}>
                  <FlexBox alignItems="center" gap={2}>
                    <ShoppingCart color="success" />
                    <H6 sx={{ fontWeight: 700 }}>פריטי ההזמנה</H6>
                  </FlexBox>
                  <Typography variant="h6" color="success.main" fontWeight={700}>
                    סה&quot;כ: {currency(totalAmount)}
                  </Typography>
                </FlexBetween>

                {/* Items Table */}
                <TableContainer sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>מוצר</TableCell>
                        <TableCell>כמות</TableCell>
                        <TableCell>מחיר יחידה</TableCell>
                        <TableCell>סה&quot;כ</TableCell>
                        <TableCell align="center">פעולות</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              value={item.product_name}
                              onChange={(e) => handleUpdateItem(index, "product_name", e.target.value)}
                              size="small"
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(index, "quantity", Number(e.target.value))}
                              size="small"
                              sx={{ width: 80, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(index, "price", Number(e.target.value))}
                              size="small"
                              sx={{ width: 100, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {currency(item.quantity * item.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleRemoveItem(index)}
                              size="small"
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Add New Item Row */}
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell>
                          <TextField
                            placeholder="שם מוצר חדש"
                            value={newItem.product_name}
                            onChange={(e) => setNewItem(prev => ({ ...prev, product_name: e.target.value }))}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                            size="small"
                            sx={{ width: 80, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={newItem.price}
                            onChange={(e) => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                            size="small"
                            sx={{ width: 100, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {currency(newItem.quantity * newItem.price)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={handleAddItem}
                            size="small"
                            color="primary"
                            disabled={!newItem.product_name || newItem.price <= 0}
                          >
                            <Add />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Status */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "warning.200" }}>
              <CardContent>
                <FlexBox alignItems="center" gap={2} mb={2}>
                  <Payment color="warning" />
                  <H6 sx={{ fontWeight: 700 }}>סטטוס ההזמנה</H6>
                </FlexBox>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>סטטוס הזמנה</InputLabel>
                      <Select
                        value="processing" // Revival always sets to processing
                        label="סטטוס הזמנה"
                        disabled
                        sx={{ borderRadius: 2 }}
                      >
                        {statuses.map(status => (
                          <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="הערות"
                      multiline
                      rows={2}
                      value={(formData as Order & { notes?: string }).notes || ''}
                      onChange={(e) => setFormData(prev => prev ? { ...prev, notes: e.target.value } as Order & { notes?: string } : null)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      placeholder="הערות נוספות להזמנה..."
                    />
                  </Grid>
                </Grid>

                <Alert severity="warning" sx={{ mt: 2 }}>
                  החיית הזמנה תשנה את הסטטוס ל&quot;מעובד&quot; ותאפשר המשך עיבוד ההזמנה
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          startIcon={<Restore />}
          sx={{ borderRadius: 2 }}
        >
          החיה הזמנה
        </Button>
      </DialogActions>
    </Dialog>
  );
}
