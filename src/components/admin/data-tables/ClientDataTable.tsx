/**
 * Client Data Table Component
 * 
 * Data table for displaying and managing clients with sorting, pagination, and actions.
 */

'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Typography,
  Box,
  Avatar,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Client {
  id: string;
  email: string;
  role: 'user' | 'admin';
  full_name: string;        // Changed from 'name' to 'full_name'
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';  // Single enum, not array
  business_name?: string;
  phone_number?: string;
  address?: any;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
  // Helper fields added by API
  display_name?: string;
  formatted_address?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
}

interface ClientDataTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
  onBulkAction: (action: string, clientIds: string[]) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

const ClientDataTable: React.FC<ClientDataTableProps> = ({
  clients,
  onEdit,
  onDelete,
  onBulkAction,
  canEdit = true,
  canDelete = true,
  pagination,
  onPageChange
}) => {
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedClients(clients.map(client => client.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedClient(client);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedClient(null);
  };

  const handleEdit = () => {
    if (selectedClient) {
      onEdit(selectedClient);
    }
    handleActionMenuClose();
  };

  const handleDelete = () => {
    if (selectedClient) {
      onDelete(selectedClient.id);
    }
    handleActionMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'inactive':
        return 'לא פעיל';
      case 'suspended':
        return 'מושעה';
      default:
        return status;
    }
  };

  const getUserRoleLabel = (userRole: string) => {
    switch (userRole) {
      case 'standard':
        return 'לקוח רגיל';
      case 'verified_members':
        return 'חבר מאומת';
      case 'customer':
        return 'לקוח';
      case 'admin':
        return 'מנהל';
      default:
        return userRole || 'לא מוגדר';
    }
  };

  const getUserRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return 'error';
      case 'verified_members':
        return 'primary';
      case 'customer':
        return 'secondary';
      case 'standard':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedClients.length > 0 && selectedClients.length < clients.length}
                  checked={clients.length > 0 && selectedClients.length === clients.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>לקוח</TableCell>
              <TableCell>פרטי קשר</TableCell>
              <TableCell>תפקיד משתמש</TableCell>
              <TableCell>תפקיד מערכת</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>כתובת</TableCell>
              <TableCell>נוצר</TableCell>
              <TableCell>עודכן</TableCell>
              <TableCell>כניסה אחרונה</TableCell>
              <TableCell align="right">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow
                key={client.id}
                selected={selectedClients.includes(client.id)}
                hover
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedClients.includes(client.id)}
                    onChange={() => handleSelectClient(client.id)}
                  />
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {client.business_name ? (
                        <BusinessIcon />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {client.display_name || client.full_name || 'ללא שם'}
                      </Typography>
                      {client.business_name && (
                        <Typography variant="caption" color="text.secondary">
                          {client.business_name}
                        </Typography>
                      )}
                      {client.is_admin && (
                        <Chip label="מנהל" size="small" color="error" sx={{ ml: 1 }} />
                      )}
                      {client.is_verified && (
                        <Chip label="מאומת" size="small" color="primary" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {client.email}
                    </Typography>
                    {client.phone_number && (
                      <Typography variant="caption" color="text.secondary">
                        {client.phone_number}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={getUserRoleLabel(client.user_role)}
                    size="small"
                    color={getUserRoleColor(client.user_role) as any}
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={client.role === 'admin' ? 'מנהל' : 'משתמש'}
                    size="small"
                    color={client.role === 'admin' ? 'error' : 'default'}
                  />
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={getStatusLabel(client.status)}
                    size="small"
                    color={getStatusColor(client.status) as any}
                  />
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {client.formatted_address || 'לא הוזנה כתובת'}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(client.created_at), 'dd/MM/yyyy')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(client.created_at), 'HH:mm')}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {client.updated_at 
                      ? format(new Date(client.updated_at), 'dd/MM/yyyy')
                      : 'לא עודכן'
                    }
                  </Typography>
                  {client.updated_at && (
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(client.updated_at), 'HH:mm')}
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {client.last_login 
                      ? format(new Date(client.last_login), 'dd/MM/yyyy')
                      : 'אף פעם'
                    }
                  </Typography>
                  {client.last_login && (
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(client.last_login), 'HH:mm')}
                    </Typography>
                  )}
                </TableCell>
                
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleActionMenuOpen(e, client)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={pagination.limit}
        onRowsPerPageChange={() => {}} // TODO: Implement rows per page change
        rowsPerPageOptions={[10, 25, 50]}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>עריכה</ListItemText>
          </MenuItem>
        )}
        
        {canDelete && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>מחיקה</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ClientDataTable;
