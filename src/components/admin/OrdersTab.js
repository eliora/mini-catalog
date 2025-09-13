import React, { useState, useEffect, useMemo } from 'react';
import { getOrders as apiGetOrders } from '../../api/orders';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import OrderRow from './data/OrderRow';
import OrderDetails from '../orderform/OrderDetails';

const OrdersTab = ({ onSnackbar }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderDialog, setOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiGetOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      onSnackbar?.('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDialog(true);
  };

  const handleUpdateOrder = (updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    onSnackbar?.('Order updated successfully', 'success');
  };

  const sortedOrders = useMemo(() => 
    [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), 
    [orders]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Orders ({orders.length})
        </Typography>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onView={handleViewOrder}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      {orderDialog && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setOrderDialog(false)}
          onUpdate={handleUpdateOrder}
          isAdmin={true}
        />
      )}
    </Box>
  );
};

export default OrdersTab;
