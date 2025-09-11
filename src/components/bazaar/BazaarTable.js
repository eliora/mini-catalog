import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Avatar,
  Typography,
  Chip,
  Switch
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

// Enhanced Table Styles based on Bazaar Pro
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
}));

const StyledTable = styled(Table)({
  minWidth: 650,
});

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  paddingTop: 16,
  paddingBottom: 16,
  color: theme.palette.grey[700],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 700,
  paddingTop: 20,
  paddingBottom: 20,
  color: theme.palette.grey[800],
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.grey[25],
  },
  '&:last-child .MuiTableCell-root': {
    border: 0,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  color: theme.palette.grey[600],
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: 8,
  transition: 'all 0.2s ease-in-out',
  '& .MuiSvgIcon-root': {
    fontSize: 18,
  },
  '&:hover': {
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '08',
    transform: 'translateY(-1px)',
  },
  '&.edit:hover': {
    color: theme.palette.info.main,
    borderColor: theme.palette.info.main,
    backgroundColor: theme.palette.info.main + '08',
  },
  '&.delete:hover': {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    backgroundColor: theme.palette.error.main + '08',
  },
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 600,
  height: 24,
  borderRadius: 12,
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.grey[700],
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})(({ theme, status }) => {
  let backgroundColor, color;
  
  switch (status) {
    case 'active':
    case 'published':
    case 'completed':
      backgroundColor = theme.palette.success[100];
      color = theme.palette.success.main;
      break;
    case 'pending':
    case 'processing':
      backgroundColor = theme.palette.warning[100];
      color = theme.palette.warning.main;
      break;
    case 'inactive':
    case 'draft':
      backgroundColor = theme.palette.grey[100];
      color = theme.palette.grey[600];
      break;
    case 'cancelled':
    case 'deleted':
      backgroundColor = theme.palette.error[100];
      color = theme.palette.error.main;
      break;
    default:
      backgroundColor = theme.palette.info[100];
      color = theme.palette.info.main;
  }
  
  return {
    fontSize: 11,
    fontWeight: 700,
    height: 22,
    borderRadius: 11,
    backgroundColor,
    color,
    textTransform: 'uppercase',
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  };
});

const ProductCell = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const ProductInfo = styled(Box)({
  minWidth: 0,
  flex: 1,
});

const ProductName = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  color: theme.palette.grey[800],
  marginBottom: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const ProductId = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.grey[500],
  fontFamily: 'monospace',
}));

const PriceText = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 700,
  color: theme.palette.grey[800],
}));

// Enhanced Switch component
const BazaarSwitch = styled(Switch)(({ theme }) => ({
  width: 44,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.success.main,
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
  },
  '& .MuiSwitch-track': {
    borderRadius: 12,
    backgroundColor: theme.palette.grey[300],
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

// Action buttons component
const TableActions = ({ onView, onEdit, onDelete, id }) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {onView && (
      <StyledIconButton onClick={() => onView(id)} title="View">
        <ViewIcon />
      </StyledIconButton>
    )}
    {onEdit && (
      <StyledIconButton className="edit" onClick={() => onEdit(id)} title="Edit">
        <EditIcon />
      </StyledIconButton>
    )}
    {onDelete && (
      <StyledIconButton className="delete" onClick={() => onDelete(id)} title="Delete">
        <DeleteIcon />
      </StyledIconButton>
    )}
  </Box>
);

// Product row component
const ProductTableRow = ({ 
  product, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  showActions = true 
}) => {
  return (
    <StyledTableRow>
      <StyledTableCell>
        <ProductCell>
          <Avatar
            src={product.image || product.mainPic}
            alt={product.name || product.productName}
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2,
              backgroundColor: 'grey.100'
            }}
          />
          <ProductInfo>
            <ProductName>
              {product.name || product.productName}
            </ProductName>
            <ProductId>
              #{product.id || product.ref}
            </ProductId>
          </ProductInfo>
        </ProductCell>
      </StyledTableCell>
      
      <StyledTableCell>
        <CategoryChip 
          label={product.category || product.line || 'Uncategorized'} 
          size="small" 
        />
      </StyledTableCell>
      
      <StyledTableCell>
        <PriceText>
          ${product.price || product.unitPrice}
        </PriceText>
      </StyledTableCell>
      
      {onToggleStatus && (
        <StyledTableCell>
          <BazaarSwitch
            checked={product.published || product.active || false}
            onChange={() => onToggleStatus(product.id || product.ref)}
          />
        </StyledTableCell>
      )}
      
      {showActions && (
        <StyledTableCell align="center">
          <TableActions
            id={product.id || product.ref}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </StyledTableCell>
      )}
    </StyledTableRow>
  );
};

// Order row component
const OrderTableRow = ({ 
  order, 
  onView, 
  onEdit, 
  onDelete,
  formatDate,
  showActions = true 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <StyledTableRow>
      <StyledTableCell>
        <Typography variant="body2" fontWeight={600}>
          {formatDate ? formatDate(order.created_at) : order.created_at}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(order.created_at).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </StyledTableCell>
      
      <StyledTableCell>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          #{order.id}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date().getFullYear()}-{String(order.id).padStart(4, '0')}
        </Typography>
      </StyledTableCell>
      
      <StyledTableCell>
        <Typography variant="body2" fontWeight={600}>
          {order.customerName || order.customer_name || 'Guest'}
        </Typography>
      </StyledTableCell>
      
      <StyledTableCell>
        <PriceText color="success.main">
          {formatCurrency(order.total)}
        </PriceText>
      </StyledTableCell>
      
      <StyledTableCell>
        <StatusChip 
          label="Submitted" 
          status="completed"
          size="small" 
        />
      </StyledTableCell>
      
      {showActions && (
        <StyledTableCell align="center">
          <TableActions
            id={order.id}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </StyledTableCell>
      )}
    </StyledTableRow>
  );
};

// Main BazaarTable component
const BazaarTable = ({ 
  headers, 
  data, 
  type = 'product', // 'product', 'order', 'custom'
  onView,
  onEdit, 
  onDelete,
  onToggleStatus,
  formatDate,
  showActions = true,
  children 
}) => {
  return (
    <StyledTableContainer component={Paper}>
      <StyledTable>
        <StyledTableHead>
          <TableRow>
            {headers.map((header, index) => (
              <StyledHeaderCell key={index} align={header.align || 'left'}>
                {header.label}
              </StyledHeaderCell>
            ))}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {children ? (
            children
          ) : (
            data.map((item, index) => {
              if (type === 'product') {
                return (
                  <ProductTableRow
                    key={index}
                    product={item}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    showActions={showActions}
                  />
                );
              } else if (type === 'order') {
                return (
                  <OrderTableRow
                    key={index}
                    order={item}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    formatDate={formatDate}
                    showActions={showActions}
                  />
                );
              }
              return null;
            })
          )}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};

export default BazaarTable;
export { 
  TableActions, 
  ProductTableRow, 
  OrderTableRow, 
  CategoryChip, 
  StatusChip, 
  BazaarSwitch 
};
