"use client";

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
  Chip
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

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  category: string;
}

export default function NotificationSettings() {
  const notificationSettings: NotificationSetting[] = [
    {
      id: "new-order",
      title: "הזמנה חדשה",
      description: "התראה כאשר מתקבלת הזמנה חדשה",
      email: true,
      sms: true,
      push: true,
      category: "orders"
    },
    {
      id: "order-status",
      title: "שינוי סטטוס הזמנה",
      description: "התראה כאשר משתנה סטטוס הזמנה",
      email: true,
      sms: false,
      push: true,
      category: "orders"
    },
    {
      id: "low-stock",
      title: "מלאי נמוך",
      description: "התראה כאשר מלאי מוצר מתחת לסף המינימום",
      email: true,
      sms: true,
      push: true,
      category: "inventory"
    },
    {
      id: "out-of-stock",
      title: "אזל מהמלאי",
      description: "התראה כאשר מוצר נגמר מהמלאי",
      email: true,
      sms: true,
      push: true,
      category: "inventory"
    },
    {
      id: "new-customer",
      title: "לקוח חדש",
      description: "התראה כאשר נרשם לקוח חדש",
      email: true,
      sms: false,
      push: false,
      category: "customers"
    },
    {
      id: "payment-received",
      title: "תשלום התקבל",
      description: "התראה כאשר התקבל תשלום",
      email: true,
      sms: false,
      push: true,
      category: "payments"
    },
    {
      id: "system-updates",
      title: "עדכוני מערכת",
      description: "התראות על עדכונים ושינויים במערכת",
      email: true,
      sms: false,
      push: false,
      category: "system"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "orders": return "primary";
      case "inventory": return "warning";
      case "customers": return "info";
      case "payments": return "success";
      case "system": return "secondary";
      default: return "default";
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "orders": return "הזמנות";
      case "inventory": return "מלאי";
      case "customers": return "לקוחות";
      case "payments": return "תשלומים";
      case "system": return "מערכת";
      default: return category;
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving notification settings");
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("הגדרות ההתראות נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      alert("שגיאה בשמירת הגדרות ההתראות");
    }
  };

  const groupedSettings = notificationSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>הגדרות התראות</H5>
        <Paragraph color="grey.600">
          נהל את ההתראות שתרצה לקבל עבור פעילויות שונות במערכת
        </Paragraph>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(groupedSettings).map(([category, settings]) => (
          <Grid size={{ xs: 12 }} key={category}>
            <Card sx={{ borderRadius: 2, border: "1px solid", borderColor: `${getCategoryColor(category)}.200` }}>
              <CardContent>
                <FlexBox alignItems="center" gap={2} mb={2}>
                  <Notifications color={getCategoryColor(category) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"} />
                  <H6 sx={{ fontWeight: 700 }}>{getCategoryTitle(category)}</H6>
                  <Chip 
                    label={`${settings.length} התראות`} 
                    size="small" 
                    color={getCategoryColor(category) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                  />
                </FlexBox>

                <List sx={{ p: 0 }}>
                  {settings.map((setting, index) => (
                    <Box key={setting.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemText
                          primary={setting.title}
                          secondary={setting.description}
                        />
                        <ListItemSecondaryAction>
                          <FlexBox gap={1} alignItems="center">
                            <FlexBox flexDirection="column" alignItems="center" gap={0.5}>
                              <Email sx={{ fontSize: 16, color: setting.email ? "primary.main" : "grey.400" }} />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={setting.email}
                                    size="small"
                                    color="primary"
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
                            </FlexBox>
                            
                            <FlexBox flexDirection="column" alignItems="center" gap={0.5}>
                              <Sms sx={{ fontSize: 16, color: setting.sms ? "success.main" : "grey.400" }} />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={setting.sms}
                                    size="small"
                                    color="success"
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
                            </FlexBox>
                            
                            <FlexBox flexDirection="column" alignItems="center" gap={0.5}>
                              <NotificationsActive sx={{ fontSize: 16, color: setting.push ? "warning.main" : "grey.400" }} />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={setting.push}
                                    size="small"
                                    color="warning"
                                  />
                                }
                                label=""
                                sx={{ m: 0 }}
                              />
                            </FlexBox>
                          </FlexBox>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < settings.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Legend */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ bgcolor: "grey.50", borderRadius: 2 }}>
            <CardContent>
              <H6 sx={{ fontWeight: 700, mb: 2 }}>מקרא</H6>
              <FlexBox gap={4}>
                <FlexBox alignItems="center" gap={1}>
                  <Email color="primary" />
                  <Paragraph>אימייל</Paragraph>
                </FlexBox>
                <FlexBox alignItems="center" gap={1}>
                  <Sms color="success" />
                  <Paragraph>SMS</Paragraph>
                </FlexBox>
                <FlexBox alignItems="center" gap={1}>
                  <NotificationsActive color="warning" />
                  <Paragraph>התראות דחיפה</Paragraph>
                </FlexBox>
              </FlexBox>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <FlexBetween>
            <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
              ההתראות יישלחו בזמן אמת לפי ההגדרות שנבחרו
            </Alert>
            <FlexBox gap={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ borderRadius: 2 }}
              >
                איפוס
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ borderRadius: 2, minWidth: 120 }}
              >
                שמור שינויים
              </Button>
            </FlexBox>
          </FlexBetween>
        </Grid>
      </Grid>
    </Box>
  );
}
