"use client";

import { Grid, Card, Box } from "@mui/material";
import { H3, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { currency } from "@/lib/currency";

// Mock chart component for now
const MockChart: React.FC<{ type: string; height: number }> = ({ type, height }) => (
  <Box
    sx={{
      height,
      backgroundColor: "primary.50",
      borderRadius: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2rem",
      color: "primary.main"
    }}
  >
    {type === "bar" && "📊"}
    {type === "area" && "📈"}
    {type === "radialBar" && "🎯"}
  </Box>
);

// Card2 component for sales cards
const Card2: React.FC<{
  title: string;
  percentage: string;
  amount: string;
  children: React.ReactNode;
}> = ({ title, percentage, amount, children }) => (
  <Card sx={{ p: 2, height: "100%" }}>
    <FlexBetween mb={1}>
      <H6 color="grey.600">{title}</H6>
      <Paragraph fontSize={12} color="success.main">
        +{percentage}
      </Paragraph>
    </FlexBetween>
    
    <H3 mb={2}>{amount}</H3>
    
    {children}
  </Card>
);

export default function Sales() {
  return (
    <Box>
      <Grid container spacing={3}>
        {/* WEEKLY SALE CHART */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card2 title="מכירות שבועיות" percentage="25.25%" amount={currency(10240, 0)}>
            <MockChart type="bar" height={100} />
          </Card2>
        </Grid>

        {/* PRODUCT SHARE CHART */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card2 title="חלק מוצרים" percentage="10.25%" amount="39.56%">
            <MockChart type="radialBar" height={130} />
          </Card2>
        </Grid>

        {/* TOTAL ORDERS CHART */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card2 title="סה&quot;כ הזמנות" percentage="2.65%" amount={currency(12260, 0)}>
            <MockChart type="area" height={80} />
          </Card2>
        </Grid>

        {/* MARKET SHARE CHART */}
        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <Card2 title="נתח שוק" percentage="2.65%" amount={currency(14260, 0)}>
            <MockChart type="radialBar" height={130} />
          </Card2>
        </Grid>
      </Grid>
    </Box>
  );
}
