"use client";

import {
  Card,
  Box,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button
} from "@mui/material";
import { H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Warning, Error, Add, Notifications } from "@mui/icons-material";

// Define StockProduct interface
interface StockProduct {
  id: number;
  name: string;
  category: string;
  stock: number;
  image: string;
  lastOrder: string;
  supplier: string;
}

// Stock out products data will be loaded from API
const mockStockOut: StockProduct[] = [];

export default function StockOutProducts() {
  const criticalCount = mockStockOut.filter(p => p.stock === 0).length;
  const lowStockCount = mockStockOut.filter(p => p.stock > 0 && p.stock <= 3).length;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <FlexBetween>
          <Box>
            <H6 sx={{ fontWeight: 700, mb: 0.5 }}>התראות מלאי</H6>
            <Paragraph color="grey.600" fontSize="0.85rem">
              {criticalCount} אזל מלאי • {lowStockCount} מלאי נמוך
            </Paragraph>
          </Box>
          <FlexBox alignItems="center" gap={1}>
            <Notifications sx={{ color: "error.main", fontSize: 20 }} />
            <Paragraph color="error.main" fontSize="0.85rem" fontWeight={600}>
              {criticalCount + lowStockCount}
            </Paragraph>
          </FlexBox>
        </FlexBetween>
      </Box>

      <Divider />

      {/* Stock Alert List */}
      <List sx={{ p: 0 }}>
        {mockStockOut.map((product, index) => (
          <Box key={product.id}>
            <ListItem sx={{ px: 3, py: 2 }}>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: product.stock === 0 ? "error.50" : "warning.50",
                    color: product.stock === 0 ? "error.main" : "warning.main",
                    fontSize: "1.2rem"
                  }}
                >
                  {product.image}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <FlexBetween>
                    <Box>
                      <Paragraph fontWeight={600} fontSize="0.95rem">
                        {product.name}
                      </Paragraph>
                      <Paragraph color="grey.600" fontSize="0.8rem">
                        {product.category} • {product.supplier}
                      </Paragraph>
                    </Box>
                    <Box sx={{ textAlign: "left" }}>
                      <Chip
                        icon={product.stock === 0 ? <Error sx={{ fontSize: 14 }} /> : <Warning sx={{ fontSize: 14 }} />}
                        label={product.stock === 0 ? "אזל מלאי" : `${product.stock} יח'`}
                        color={product.stock === 0 ? "error" : "warning"}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          "& .MuiChip-icon": {
                            fontSize: 14
                          }
                        }}
                      />
                    </Box>
                  </FlexBetween>
                }
                secondary={
                  <FlexBetween sx={{ mt: 1 }}>
                    <Paragraph color="grey.600" fontSize="0.75rem">
                      הזמנה אחרונה: {product.lastOrder}
                    </Paragraph>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      sx={{
                        fontSize: "0.7rem",
                        height: 24,
                        minWidth: "auto",
                        px: 1
                      }}
                    >
                      הזמן
                    </Button>
                  </FlexBetween>
                }
              />
            </ListItem>
            
            {index < mockStockOut.length - 1 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>

      {/* Footer Action */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Add />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600
          }}
        >
          הזמן מוצרים נוספים
        </Button>
      </Box>
    </Card>
  );
}
