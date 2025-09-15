/**
 * CompanyInfoSection Component - Basic company information
 * 
 * Form section for managing basic company information including name, description,
 * tagline, and logo upload functionality.
 * 
 * Features:
 * - Company name and description fields
 * - Logo upload with preview
 * - Logo deletion functionality
 * - File size validation
 * 
 * Props:
 * - settings: Company settings object
 * - onLogoUpload: Logo upload handler
 * - onLogoDelete: Logo deletion handler
 * - onChange: Field change handler
 */

import React from 'react';
import {
  Grid,
  TextField,
  Box,
  Avatar,
  Stack,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const CompanyInfoSection = ({
  settings,
  onChange,
  onLogoUpload,
  onLogoDelete
}) => {
  return (
    <>
      {/* Basic Company Information */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          מידע בסיסי על החברה
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="שם החברה"
          value={settings.companyName}
          onChange={onChange('companyName')}
          placeholder="JEAN D'ARCEL"
          helperText="שם החברה יופיע בכותרת האתר ובהזמנות"
          required
          sx={{ }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        {/* Logo Upload Section */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            לוגו החברה
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={settings.companyLogo}
              sx={{ 
                width: 80, 
                height: 80, 
                border: '2px solid',
                borderColor: 'grey.300'
              }}
            >
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Stack spacing={1}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                size="small"
              >
                העלה לוגו
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={onLogoUpload}
                />
              </Button>
              {settings.companyLogo && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  size="small"
                  onClick={onLogoDelete}
                >
                  מחק לוגו
                </Button>
              )}
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            יופיע בכותרת האתר (לא במובייל) ובהזמנות מודפסות
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="תיאור החברה"
          value={settings.companyDescription}
          onChange={onChange('companyDescription')}
          placeholder="מערכת ניהול הזמנות"
          helperText="תיאור קצר של החברה או השירות"
          sx={{ }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="סלוגן/תיאור מורחב"
          value={settings.companyTagline}
          onChange={onChange('companyTagline')}
          placeholder="אתר מקצועי למוצרי יופי"
          helperText="סלוגן או תיאור מורחב (יופיע מתחת לשם החברה)"
          sx={{ }}
        />
      </Grid>
    </>
  );
};

export default React.memo(CompanyInfoSection);
