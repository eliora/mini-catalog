/**
 * OrderDetailsHeader Component
 * 
 * Header section for order details with order info and action buttons.
 * Extracted from OrderDetails.js for better maintainability.
 * 
 * Features:
 * - Order title with ID
 * - Action buttons (edit, save, cancel, revive, print)
 * - Customer and order information grid
 * - Status indicators
 * 
 * @param {Object} order - Order data
 * @param {boolean} editMode - Whether in edit mode
 * @param {boolean} isAdmin - Whether user is admin
 * @param {boolean} saving - Whether save operation is in progress
 * @param {Function} onEdit - Edit mode toggle callback
 * @param {Function} onSave - Save changes callback
 * @param {Function} onCancel - Cancel edit callback
 * @param {Function} onRevive - Revive order callback
 * @param {Function} onPrint - Print order callback
 * @param {Function} onCustomerNameChange - Customer name change callback
 */

import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Grid,
  Box,
  TextField,
  Chip,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';

const OrderDetailsHeader = ({
  order,
  editMode,
  isAdmin,
  saving,
  onEdit,
  onSave,
  onCancel,
  onRevive,
  onPrint,
  onCustomerNameChange
}) => {
  return (
    <Paper elevation={3} sx={{ mb: 3, p: 3 }}>
      {/* Header with Title and Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          הזמנה #{order.id}
        </Typography>
        
        <Stack direction="row" spacing={2}>
          {!editMode && isAdmin && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEdit}
              >
                עריכה
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<RestoreIcon />}
                onClick={onRevive}
              >
                החייאה
              </Button>
            </>
          )}
          
          {editMode && (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={onSave}
                disabled={saving}
              >
                {saving ? 'שומר...' : 'שמור'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                disabled={saving}
              >
                ביטול
              </Button>
            </>
          )}
          
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={onPrint}
          >
            הדפס
          </Button>
        </Stack>
      </Stack>

      {/* Order Information Grid */}
      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              פרטי לקוח
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  שם לקוח:
                </Typography>
                {editMode ? (
                  <TextField
                    size="small"
                    value={order.customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    sx={{ width: 200 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {order.customerName || 'אורח'}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  סוג לקוח:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  רגיל
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
        
        {/* Order Information */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              פרטי הזמנה
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  מספר הזמנה:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  #{new Date().getFullYear()}-{String(order.id).padStart(4, '0')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  תאריך:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {new Date(order.created_at).toLocaleDateString('he-IL')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  סטטוס:
                </Typography>
                <Chip label="הוגשה" size="small" color="success" />
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(OrderDetailsHeader);
