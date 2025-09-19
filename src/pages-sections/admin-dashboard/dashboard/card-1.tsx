"use client";

import { Card, Box, Avatar, Chip } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { H3, Paragraph } from "@/components/Typography";
import { FlexBetween } from "@/components/flex-box";

// ========================================================
interface Props {
  color: string;
  title: string;
  status?: "up" | "down";
  amount1: string | number;
  amount2: string | number;
  percentage: string | number;
  icon?: React.ReactNode;
}
// ========================================================

export default function Card1(props: Props) {
  const { title, amount1, amount2, percentage, status = "up", color = "primary.main", icon } = props;
  
  const isPositive = status === "up";
  const gradientColors = {
    "primary.main": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "success.main": "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
    "warning.main": "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    "info.main": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    "error.main": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
  };

  return (
    <Card 
      sx={{ 
        p: 0,
        borderRadius: 1,
      }}
    >
      {/* Header with gradient */}
      <Box
        sx={{
          background: gradientColors[color as keyof typeof gradientColors] || gradientColors["primary.main"],
          p: 2,
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 0 0-8 0-8s8 0 8 0 0 8 0 8-8 0-8 0'/%3E%3C/g%3E%3C/svg%3E")`,
            zIndex: 0
          }}
        />
        
        <FlexBetween sx={{ position: "relative", zIndex: 1 }}>
          <Box>
            <Paragraph sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.85rem", fontWeight: 500 }}>
              {title}
            </Paragraph>
            <H3 sx={{ color: "white", fontWeight: 700, mt: 0.5 }}>{amount1}</H3>
          </Box>
          
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontSize: "1.5rem"
            }}
          >
            {icon || "📊"}
          </Avatar>
        </FlexBetween>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <FlexBetween>
          <Paragraph color="grey.600" fontSize="0.85rem">
            {amount2}
          </Paragraph>

          <Chip
            icon={isPositive ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />}
            label={`${isPositive ? '+' : ''}${percentage}`}
            size="small"
            color={isPositive ? "success" : "error"}
            sx={{
              height: 24,
              fontSize: "0.75rem",
              fontWeight: 600,
              "& .MuiChip-icon": {
                fontSize: 14
              }
            }}
          />
        </FlexBetween>
      </Box>
    </Card>
  );
}
