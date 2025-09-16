"use client";

import { Card, Grid, Box } from "@mui/material";
import { H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";

// Mock analytics component
const AnalyticsChart: React.FC = () => (
  <Box
    sx={{
      height: 300,
      backgroundColor: "primary.50",
      borderRadius: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "3rem",
      color: "primary.main"
    }}
  >
    📈
  </Box>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}> = ({ title, value, change, positive = true }) => (
  <Card sx={{ p: 2, textAlign: "center" }}>
    <Paragraph color="grey.600" fontSize={14} mb={1}>
      {title}
    </Paragraph>
    <H6 mb={0.5}>{value}</H6>
    <Paragraph
      fontSize={12}
      color={positive ? "success.main" : "error.main"}
    >
      {positive ? "+" : ""}{change}
    </Paragraph>
  </Card>
);

export default function Analytics() {
  return (
    <Card sx={{ p: 2 }}>
      <FlexBetween mb={2}>
        <H6>ניתוח נתונים</H6>
        <Paragraph fontSize={12} color="grey.600">
          30 ימים אחרונים
        </Paragraph>
      </FlexBetween>
      
      <Grid container spacing={2}>
        {/* Main Chart */}
        <Grid item xs={12} md={8}>
          <AnalyticsChart />
        </Grid>
        
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <FlexBox flexDirection="column" gap={2}>
            <StatCard
              title="ביקורים יומיים"
              value="1,245"
              change="12.5%"
              positive={true}
            />
            
            <StatCard
              title="שיעור המרה"
              value="3.2%"
              change="0.8%"
              positive={true}
            />
            
            <StatCard
              title="עגלות נטושות"
              value="28%"
              change="5.2%"
              positive={false}
            />
            
            <StatCard
              title="לקוחות חוזרים"
              value="65%"
              change="8.1%"
              positive={true}
            />
          </FlexBox>
        </Grid>
      </Grid>
    </Card>
  );
}
