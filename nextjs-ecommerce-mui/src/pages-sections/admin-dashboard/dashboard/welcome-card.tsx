"use client";

import { Box, Card, Avatar, LinearProgress } from "@mui/material";
import { H3, H4, H5, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { currency } from "@/lib/currency";
import { TrendingUp, Visibility, ShoppingCart } from "@mui/icons-material";

export default function WelcomeCard() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "בוקר טוב" : currentHour < 18 ? "אחר הצהריים טובים" : "ערב טוב";
  
  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        p: 3,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
      }}>
      
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 0
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <FlexBetween mb={3}>
          <Box>
            <H4 sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
              {greeting}, מנהל המערכת! 👋
            </H4>
            <Paragraph sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
              סקירה מהירה של הביצועים שלך היום
            </Paragraph>
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
            👨‍💼
          </Avatar>
        </FlexBetween>

        {/* Stats Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
          {/* Daily Visits */}
          <Box>
            <FlexBox alignItems="center" mb={1}>
              <Visibility sx={{ fontSize: 20, mr: 1, color: "rgba(255,255,255,0.8)" }} />
              <Paragraph sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                ביקורים היום
              </Paragraph>
            </FlexBox>
            <H3 sx={{ color: "white", fontWeight: 700, mb: 1 }}>1,245</H3>
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#4ade80",
                  borderRadius: 3
                }
              }}
            />
            <Paragraph sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", mt: 0.5 }}>
              +12% מאתמול
            </Paragraph>
          </Box>

          {/* Daily Sales */}
          <Box>
            <FlexBox alignItems="center" mb={1}>
              <ShoppingCart sx={{ fontSize: 20, mr: 1, color: "rgba(255,255,255,0.8)" }} />
              <Paragraph sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                מכירות היום
              </Paragraph>
            </FlexBox>
            <H3 sx={{ color: "white", fontWeight: 700, mb: 1 }}>{currency(8360.50)}</H3>
            <LinearProgress
              variant="determinate"
              value={85}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#fbbf24",
                  borderRadius: 3
                }
              }}
            />
            <Paragraph sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", mt: 0.5 }}>
              +8% מהשבוע שעבר
            </Paragraph>
          </Box>
        </Box>

        {/* Achievement Badge */}
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            p: 2,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}
        >
          <FlexBetween>
            <FlexBox alignItems="center">
              <TrendingUp sx={{ color: "#4ade80", mr: 1 }} />
              <Box>
                <Paragraph sx={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
                  יעד החודש
                </Paragraph>
                <Paragraph sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
                  הושגו 78% מהמטרה
                </Paragraph>
              </Box>
            </FlexBox>
            <Box sx={{ textAlign: "center" }}>
              <H5 sx={{ color: "#4ade80", fontWeight: 700 }}>78%</H5>
            </Box>
          </FlexBetween>
        </Box>
      </Box>
    </Card>
  );
}
