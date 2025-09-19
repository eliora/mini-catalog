"use client";

import {
  Card,
  Box,
  Avatar,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import { H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { currency } from "@/lib/currency";
import { MoreVert, TrendingUp, AccessTime } from "@mui/icons-material";

// Mock data for recent purchases
const mockPurchases = [
  {
    id: 1,
    customer: "שרה כהן",
    product: "סרום ויטמין C",
    amount: 189,
    status: "completed",
    date: "היום",
    time: "14:30",
    avatar: "ש"
  },
  {
    id: 2,
    customer: "רחל לוי",
    product: "קרם לחות יום",
    amount: 245,
    status: "pending",
    date: "אתמול",
    time: "16:45",
    avatar: "ר"
  },
  {
    id: 3,
    customer: "מיכל אברהם",
    product: "מסכת פנים",
    amount: 156,
    status: "completed",
    date: "אתמול",
    time: "09:20",
    avatar: "מ"
  },
  {
    id: 4,
    customer: "דנה רוזן",
    product: "תחליב ניקוי",
    amount: 98,
    status: "completed",
    date: "לפני יומיים",
    time: "11:15",
    avatar: "ד"
  },
  {
    id: 5,
    customer: "עדן מזרחי",
    product: "שמן ארגן",
    amount: 320,
    status: "completed",
    date: "לפני יומיים",
    time: "13:40",
    avatar: "ע"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "הושלם";
    case "pending":
      return "ממתין";
    case "cancelled":
      return "בוטל";
    default:
      return status;
  }
};

export default function RecentPurchase() {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <FlexBetween>
          <Box>
            <H6 sx={{ fontWeight: 700, mb: 0.5 }}>רכישות אחרונות</H6>
            <Paragraph color="grey.600" fontSize="0.85rem">
              5 הזמנות אחרונות במערכת
            </Paragraph>
          </Box>
          <FlexBox alignItems="center" gap={1}>
            <TrendingUp sx={{ color: "success.main", fontSize: 20 }} />
            <Paragraph color="success.main" fontSize="0.85rem" fontWeight={600}>
              +12%
            </Paragraph>
          </FlexBox>
        </FlexBetween>
      </Box>

      <Divider />

      {/* Purchases List */}
      <List sx={{ p: 0 }}>
        {mockPurchases.map((purchase, index) => (
          <Box key={purchase.id}>
            <ListItem sx={{ px: 3, py: 2 }}>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: `${getStatusColor(purchase.status)}.main`,
                    color: "white",
                    fontWeight: 600,
                    fontSize: "1rem"
                  }}
                >
                  {purchase.avatar}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <FlexBetween>
                    <Box>
                      <Paragraph fontWeight={600} fontSize="0.95rem">
                        {purchase.customer}
                      </Paragraph>
                      <Paragraph color="grey.600" fontSize="0.85rem">
                        {purchase.product}
                      </Paragraph>
                    </Box>
                    <Box sx={{ textAlign: "left" }}>
                      <Paragraph fontWeight={700} fontSize="1rem" color="primary.main">
                        {currency(purchase.amount)}
                      </Paragraph>
                      <FlexBox alignItems="center" gap={0.5}>
                        <AccessTime sx={{ fontSize: 14, color: "grey.500" }} />
                        <Paragraph color="grey.500" fontSize="0.75rem">
                          {purchase.time}
                        </Paragraph>
                      </FlexBox>
                    </Box>
                  </FlexBetween>
                }
                secondary={
                  <FlexBetween sx={{ mt: 1 }}>
                    <Paragraph color="grey.600" fontSize="0.8rem">
                      {purchase.date}
                    </Paragraph>
                    <Chip
                      label={getStatusText(purchase.status)}
                      color={getStatusColor(purchase.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600
                      }}
                    />
                  </FlexBetween>
                }
              />

              <ListItemSecondaryAction>
                <IconButton size="small" sx={{ color: "grey.400" }}>
                  <MoreVert />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            
            {index < mockPurchases.length - 1 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>
    </Card>
  );
}
