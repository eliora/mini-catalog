/**
 * Client Edit Dialog Component
 * 
 * Reusable dialog for creating and editing client information with Hebrew localization.
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
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Avatar,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

interface Client {
  id: string;
  email: string;
  full_name: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name?: string;
  phone_number?: string;
  address?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
  display_name?: string;
  formatted_address?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
}

interface ClientData {
  email: string;
  full_name: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name?: string;
  phone_number?: string;
  address?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  password?: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name: string;
  phone_number: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface ClientEditDialogProps {
  client?: Client;
  userRoles: UserRole[];
  open: boolean;
  onClose: () => void;
  onSave: (clientData: ClientData) => Promise<void>;
  mode?: 'create' | 'edit';
}

// Hebrew labels and options
const HEBREW_LABELS = {
  dialog: {
    create: 'הוספת לקוח חדש',
    edit: 'עריכת פרטי לקוח',
  },
  fields: {
    email: 'כתובת אימייל',
    fullName: 'שם מלא',
    password: 'סיסמה',
    businessName: 'שם עסק',
    phoneNumber: 'מספר טלפון',
    userRole: 'תפקיד משתמש',
    status: 'סטטוס',
    address: 'כתובת',
    street: 'רחוב',
    city: 'עיר',
    postalCode: 'מיקוד',
    country: 'מדינה',
  },
  userRoles: {
    standard: 'לקוח רגיל',
    verified_members: 'חבר מאומת',
    customer: 'לקוח',
    admin: 'מנהל',
  },
  status: {
    active: 'פעיל',
    inactive: 'לא פעיל',
    suspended: 'מושעה',
  },
  actions: {
    save: 'שמירה',
    cancel: 'ביטול',
    close: 'סגירה',
  },
  validation: {
    emailRequired: 'כתובת אימייל נדרשת',
    nameRequired: 'שם מלא נדרש',
    invalidEmail: 'כתובת אימייל לא תקינה',
    phoneInvalid: 'מספר טלפון לא תקין',
  },
  placeholders: {
    email: 'הזן כתובת אימייל',
    fullName: 'הזן שם מלא',
    password: 'לפחות 6 תווים',
    businessName: 'הזן שם עסק (אופציונלי)',
    phoneNumber: 'הזן מספר טלפון',
    street: 'רחוב ומספר בית',
    city: 'עיר',
    postalCode: 'מיקוד',
  },
  sections: {
    personalInfo: 'פרטים אישיים',
    contactInfo: 'פרטי קשר',
    permissions: 'הרשאות ותפקידים',
    address: 'כתובת',
  }
};

const ClientEditDialog: React.FC<ClientEditDialogProps> = ({
  client,
  userRoles: _userRoles, // eslint-disable-line @typescript-eslint/no-unused-vars
  open,
  onClose,
  onSave,
  mode = client ? 'edit' : 'create'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    password: '',
    user_role: 'standard',
    business_name: '',
    phone_number: '',
    address: '',
    status: 'active'
  });

  // Initialize form data when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        email: client.email || '',
        name: client.full_name || client.display_name || '',
        password: '', // Never populate password for security
        user_role: client.user_role || 'standard',
        business_name: client.business_name || '',
        phone_number: client.phone_number || '',
        address: client.address || '',
        status: client.status || 'active'
      });
    } else {
      // Reset form for new client
      setFormData({
        email: '',
        name: '',
        password: '',
        user_role: 'standard',
        business_name: '',
        phone_number: '',
        address: '',
        status: 'active'
      });
    }
    setError(null);
    setValidationErrors({});
  }, [client, open]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = HEBREW_LABELS.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = HEBREW_LABELS.validation.invalidEmail;
    }

    // Name validation
    if (!formData.name.trim()) {
      errors.name = HEBREW_LABELS.validation.nameRequired;
    }

    // Password validation (only for new users)
    if (mode === 'create' && (!formData.password || formData.password.length < 6)) {
      errors.password = 'סיסמה חייבת להכיל לפחות 6 תווים';
    }

    // Phone validation (optional but if provided must be valid)
    if (formData.phone_number && !/^[\d\s\-\+\(\)]+$/.test(formData.phone_number)) {
      errors.phone_number = HEBREW_LABELS.validation.phoneInvalid;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field: string) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value as string
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!validateForm()) {
        return;
      }

      // Map form data to API expected format
      const clientData = {
        ...(client && { id: client.id }),
        email: formData.email.trim(),
        full_name: formData.name.trim(),
        ...(mode === 'create' && { password: formData.password }), // Only include password for new users
        user_role: formData.user_role,
        business_name: formData.business_name.trim(),
        phone_number: formData.phone_number.trim(),
        address: formData.address,
        status: formData.status
      };

      console.log('Dialog sending data:', clientData);
      console.log('Phone number from form:', formData.phone_number);
      console.log('Phone number after trim:', formData.phone_number.trim());

      await onSave(clientData);
      
    } catch (err: unknown) {
      setError((err as Error).message || 'שגיאה בשמירת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const isAdmin = formData.user_role === 'admin';

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            {mode === 'create' ? <PersonIcon /> : <BusinessIcon />}
          </Avatar>
          <Typography variant="h6" component="div">
            {mode === 'create' ? HEBREW_LABELS.dialog.create : HEBREW_LABELS.dialog.edit}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Personal Information Section */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" color="primary">
                  {HEBREW_LABELS.sections.personalInfo}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={HEBREW_LABELS.fields.fullName}
                  placeholder={HEBREW_LABELS.placeholders.fullName}
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                
                <TextField
                  fullWidth
                  label={HEBREW_LABELS.fields.businessName}
                  placeholder={HEBREW_LABELS.placeholders.businessName}
                  value={formData.business_name}
                  onChange={handleInputChange('business_name')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              {/* Password field - only for new users */}
              {mode === 'create' && (
                <TextField
                  fullWidth
                  type="password"
                  label={HEBREW_LABELS.fields.password}
                  placeholder={HEBREW_LABELS.placeholders.password}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmailIcon color="primary" />
                <Typography variant="h6" color="primary">
                  {HEBREW_LABELS.sections.contactInfo}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  type="email"
                  label={HEBREW_LABELS.fields.email}
                  placeholder={HEBREW_LABELS.placeholders.email}
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                
                <TextField
                  fullWidth
                  label={HEBREW_LABELS.fields.phoneNumber}
                  placeholder={HEBREW_LABELS.placeholders.phoneNumber}
                  value={formData.phone_number}
                  onChange={handleInputChange('phone_number')}
                  error={!!validationErrors.phone_number}
                  helperText={validationErrors.phone_number}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Address Section */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationIcon color="primary" />
                <Typography variant="h6" color="primary">
                  {HEBREW_LABELS.sections.address}
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label={HEBREW_LABELS.fields.street}
                  placeholder={HEBREW_LABELS.placeholders.street}
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label={HEBREW_LABELS.fields.city}
                    placeholder={HEBREW_LABELS.placeholders.city}
                    value=""
                    onChange={() => {}}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, flex: 1 }}
                  />
                  
                  <TextField
                    label={HEBREW_LABELS.fields.postalCode}
                    placeholder={HEBREW_LABELS.placeholders.postalCode}
                    value=""
                    onChange={() => {}}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, flex: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Permissions Section */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" color="primary">
                  {HEBREW_LABELS.sections.permissions}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <InputLabel>{HEBREW_LABELS.fields.userRole}</InputLabel>
                  <Select
                    value={formData.user_role}
                    onChange={handleSelectChange('user_role')}
                    label={HEBREW_LABELS.fields.userRole}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="standard">{HEBREW_LABELS.userRoles.standard}</MenuItem>
                    <MenuItem value="verified_members">{HEBREW_LABELS.userRoles.verified_members}</MenuItem>
                    <MenuItem value="customer">{HEBREW_LABELS.userRoles.customer}</MenuItem>
                    <MenuItem value="admin">{HEBREW_LABELS.userRoles.admin}</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>{HEBREW_LABELS.fields.status}</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={handleSelectChange('status')}
                    label={HEBREW_LABELS.fields.status}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="active">{HEBREW_LABELS.status.active}</MenuItem>
                    <MenuItem value="inactive">{HEBREW_LABELS.status.inactive}</MenuItem>
                    <MenuItem value="suspended">{HEBREW_LABELS.status.suspended}</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {isAdmin && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="body2">
                    <strong>שים לב:</strong> המשתמש יקבל הרשאות מנהל מערכת מלאות
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: 2, minWidth: 100 }}
        >
          {HEBREW_LABELS.actions.cancel}
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ 
            borderRadius: 2, 
            minWidth: 120,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {loading ? 'שומר...' : HEBREW_LABELS.actions.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientEditDialog;