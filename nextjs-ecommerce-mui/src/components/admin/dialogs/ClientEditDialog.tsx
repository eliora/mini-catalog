/**
 * Client Edit Dialog Component
 * 
 * Dialog for creating and editing client information.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface Client {
  id: string;
  email: string;
  name: string;
  business_name?: string;
  phone_number?: string;
  address?: any;
  user_roles: any[];
  status: 'active' | 'inactive' | 'suspended';
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

interface ClientEditDialogProps {
  client?: Client;
  userRoles: UserRole[];
  open: boolean;
  onClose: () => void;
  onSave: (clientData: any) => Promise<void>;
}

interface FormData {
  email: string;
  name: string;
  business_name: string;
  phone_number: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  user_roles: string[];
  status: 'active' | 'inactive' | 'suspended';
}

const ClientEditDialog: React.FC<ClientEditDialogProps> = ({
  client,
  userRoles,
  open,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    business_name: '',
    phone_number: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Israel'
    },
    user_roles: [],
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(client);

  useEffect(() => {
    if (client) {
      setFormData({
        email: client.email || '',
        name: client.name || '',
        business_name: client.business_name || '',
        phone_number: client.phone_number || '',
        address: client.address || {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Israel'
        },
        user_roles: client.user_roles?.map(role => role.id || role.name || role) || [],
        status: client.status || 'active'
      });
    } else {
      // Reset form for new client
      setFormData({
        email: '',
        name: '',
        business_name: '',
        phone_number: '',
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'Israel'
        },
        user_roles: [],
        status: 'active'
      });
    }
    setError(null);
  }, [client, open]);

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddressChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: event.target.value
      }
    }));
  };

  const handleRolesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      user_roles: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      status: event.target.value as 'active' | 'inactive' | 'suspended'
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (!formData.email || !formData.name) {
        setError('Email and name are required');
        return;
      }

      // Map role IDs to role objects
      const selectedRoles = userRoles.filter(role => 
        formData.user_roles.includes(role.id)
      );

      const clientData = {
        ...formData,
        user_roles: selectedRoles
      };

      await onSave(clientData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {isEditing ? 'Edit Client' : 'Add New Client'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Business Name"
                value={formData.business_name}
                onChange={handleInputChange('business_name')}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone_number}
                onChange={handleInputChange('phone_number')}
                disabled={loading}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={handleAddressChange('street')}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={handleAddressChange('city')}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.address.state}
                onChange={handleAddressChange('state')}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.address.postal_code}
                onChange={handleAddressChange('postal_code')}
                disabled={loading}
              />
            </Grid>

            {/* Roles and Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Roles & Status
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>User Roles</InputLabel>
                <Select
                  multiple
                  value={formData.user_roles}
                  onChange={handleRolesChange}
                  input={<OutlinedInput label="User Roles" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const role = userRoles.find(r => r.id === value);
                        return (
                          <Chip
                            key={value}
                            label={role?.name || value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {userRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box>
                        <Typography variant="body2">{role.name}</Typography>
                        {role.description && (
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Client' : 'Create Client')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientEditDialog;
