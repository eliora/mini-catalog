"use client";

import React, { useState } from "react";
import {
  Grid,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Snackbar
} from "@mui/material";
import { 
  Save, 
  Refresh,
  Notifications,
  Email,
  Sms,
  NotificationsActive
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { useCompany } from "@/context/CompanyContext";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  category: string;
}

export default function NotificationSettings() {
  const { settings, updateSettings, isLoading } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Parse notification settings from database or use defaults
  const parseNotificationSettings = () => {
    try {
      if (settings?.notification_settings && typeof settings.notification_settings === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return settings.notification_settings as any;
      }
    } catch (error) {
      console.error('Error parsing notification settings:', error);
    }
    
    // Default notification settings
    return {
      categories: {
        orders: { sms: false, push: true, email: true, inApp: true },
        system: { sms: false, push: true, email: true, inApp: true },
        customers: { sms: false, push: false, email: false, inApp: true },
        inventory: { sms: false, push: false, email: true, inApp: true }
      }
    };
  };

  const notificationSettings: NotificationSetting[] = [
    {
      id: "new-order",
      title: "הזמנה חדשה",
      description: "התראה כאשר מתקבלת הזמנה חדשה",
      email: true,
      sms: false,
      push: true,
      inApp: true,
      category: "orders"
    },
    {
      id: "order-status",
      title: "שינוי סטטוס הזמנה",
      description: "התראה כאשר משתנה סטטוס הזמנה",
      email: true,
      sms: false,
      push: true,
      inApp: true,
      category: "orders"
    },
    {
      id: "low-stock",
      title: "מלאי נמוך",
      description: "התראה כאשר מלאי מוצר מתחת לסף המינימום",
      email: true,
      sms: false,
      push: false,
      inApp: true,
      category: "inventory"
    },
    {
      id: "out-of-stock",
      title: "אזל מהמלאי",
      description: "התראה כאשר מוצר נגמר מהמלאי",
      email: true,
      sms: false,
      push: false,
      inApp: true,
      category: "inventory"
    },
    {
      id: "new-customer",
      title: "לקוח חדש",
      description: "התראה כאשר נרשם לקוח חדש",
      email: false,
      sms: false,
      push: false,
      inApp: true,
      category: "customers"
    },
    {
      id: "payment-received",
      title: "תשלום התקבל",
      description: "התראה כאשר התקבל תשלום",
      email: true,
      sms: false,
      push: true,
      inApp: true,
      category: "orders"
    },
    {
      id: "system-updates",
      title: "עדכוני מערכת",
      description: "התראות על עדכונים ושינויים במערכת",
      email: true,
      sms: false,
      push: true,
      inApp: true,
      category: "system"
    }
  ];

  const currentSettings = parseNotificationSettings();
  const [localSettings, setLocalSettings] = useState(currentSettings);

  const handleToggle = (category: string, type: 'email' | 'sms' | 'push' | 'inApp') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLocalSettings((prev: any) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          [type]: !prev.categories[category][type]
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      console.log("Saving notification settings:", localSettings);
      
      const result = await updateSettings({
        notification_settings: localSettings
      });
      
      if (result.error) {
        setSnackbar({
          open: true,
          message: `שגיאה בשמירת הגדרות התראות: ${result.error}`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: "הגדרות התראות נשמרו בהצלחה!",
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      setSnackbar({
        open: true,
        message: "שגיאה בשמירת הגדרות התראות",
        severity: 'error'
      });
    }
  };

  const getCategorySettings = (category: string) => {
    return localSettings.categories[category] || { sms: false, push: false, email: false, inApp: false };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>הגדרות התראות</H5>
        <Paragraph color="grey.600">
          נהל את סוגי ההתראות והערוצים שבהם תרצה לקבל עדכונים
        </Paragraph>
      </Box>

      <Grid container spacing={3}>
        {/* Notification Categories */}
        {['orders', 'inventory', 'customers', 'system'].map((category) => {
          const categorySettings = getCategorySettings(category);
          const categoryName = {
            orders: 'הזמנות',
            inventory: 'מלאי',
            customers: 'לקוחות',
            system: 'מערכת'
          }[category];

          return (
            <Grid size={{ xs: 12 }} key={category}>
              <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                <CardContent>
                  <FlexBox alignItems="center" gap={2} mb={2}>
                    <Notifications color="primary" />
                    <H6 sx={{ fontWeight: 700 }}>{categoryName}</H6>
                  </FlexBox>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={2}>
                    <Grid size={{ md: 3, xs: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={categorySettings.email}
                            onChange={() => handleToggle(category, 'email')}
                            color="primary"
                          />
                        }
                        label={
                          <FlexBox alignItems="center" gap={1}>
                            <Email fontSize="small" />
                            <span>אימייל</span>
                          </FlexBox>
                        }
                      />
                    </Grid>

                    <Grid size={{ md: 3, xs: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={categorySettings.sms}
                            onChange={() => handleToggle(category, 'sms')}
                            color="primary"
                          />
                        }
                        label={
                          <FlexBox alignItems="center" gap={1}>
                            <Sms fontSize="small" />
                            <span>SMS</span>
                          </FlexBox>
                        }
                      />
                    </Grid>

                    <Grid size={{ md: 3, xs: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={categorySettings.push}
                            onChange={() => handleToggle(category, 'push')}
                            color="primary"
                          />
                        }
                        label={
                          <FlexBox alignItems="center" gap={1}>
                            <NotificationsActive fontSize="small" />
                            <span>Push</span>
                          </FlexBox>
                        }
                      />
                    </Grid>

                    <Grid size={{ md: 3, xs: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={categorySettings.inApp}
                            onChange={() => handleToggle(category, 'inApp')}
                            color="primary"
                          />
                        }
                        label={
                          <FlexBox alignItems="center" gap={1}>
                            <Notifications fontSize="small" />
                            <span>באפליקציה</span>
                          </FlexBox>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {/* Notification Details */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
            <CardContent>
              <FlexBox alignItems="center" gap={2} mb={2}>
                <Notifications color="primary" />
                <H6 sx={{ fontWeight: 700 }}>פירוט התראות</H6>
              </FlexBox>
              <Divider sx={{ mb: 3 }} />

              <List>
                {notificationSettings.map((setting) => (
                  <ListItem key={setting.id} sx={{ py: 1 }}>
                    <ListItemText
                      primary={setting.title}
                      secondary={setting.description}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={setting.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <FlexBetween>
            <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
              שינויים יכנסו לתוקף מיד לאחר השמירה
            </Alert>
            <FlexBox gap={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ borderRadius: 2 }}
                onClick={() => setLocalSettings(parseNotificationSettings())}
              >
                איפוס
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={isLoading}
                sx={{ borderRadius: 2, minWidth: 120 }}
              >
                {isLoading ? "שומר..." : "שמור שינויים"}
              </Button>
            </FlexBox>
          </FlexBetween>
        </Grid>
      </Grid>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}