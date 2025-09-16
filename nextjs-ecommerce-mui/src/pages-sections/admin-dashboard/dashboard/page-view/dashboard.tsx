import { Grid, Box } from "@mui/material";
import { 
  ShoppingCart, 
  AttachMoney, 
  People, 
  Inventory,
  TrendingUp,
  Assessment,
  Notifications
} from "@mui/icons-material";
// LOCAL CUSTOM COMPONENTS
import Sales from "../sales";
import Card1 from "../card-1";
import Analytics from "../analytics";
import WelcomeCard from "../welcome-card";
import RecentPurchase from "../recent-purchase";
import StockOutProducts from "../stock-out-products";
import { currency } from "@/lib/currency";

// Mock data for tracking cards with icons
const cardData = [
  {
    id: 1,
    title: "הזמנות היום",
    color: "primary.main",
    amount1: "24",
    amount2: "הזמנות חדשות",
    percentage: "8.5%",
    status: "up" as const,
    icon: <ShoppingCart />
  },
  {
    id: 2,
    title: "הכנסות השבוע",
    color: "success.main",
    amount1: currency(15420),
    amount2: "מהשבוע שעבר",
    percentage: "12.3%",
    status: "up" as const,
    icon: <AttachMoney />
  },
  {
    id: 3,
    title: "לקוחות חדשים",
    color: "info.main",
    amount1: "18",
    amount2: "השבוע",
    percentage: "15.2%",
    status: "up" as const,
    icon: <People />
  },
  {
    id: 4,
    title: "מוצרים פעילים",
    color: "warning.main",
    amount1: "156",
    amount2: "במלאי",
    percentage: "2.1%",
    status: "down" as const,
    icon: <Inventory />
  }
];

export default function DashboardPageView() {
  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Grid container spacing={3}>
        {/* WELCOME CARD SECTION */}
        <Grid item lg={8} md={7} xs={12}>
          <WelcomeCard />
        </Grid>

        {/* QUICK STATS */}
        <Grid item lg={4} md={5} xs={12}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
            <Card1
              title="התראות חדשות"
              color="error.main"
              amount1="3"
              amount2="דורש טיפול"
              percentage="2 חדשות"
              status="up"
              icon={<Notifications />}
            />
            <Card1
              title="ביצועים"
              color="success.main"
              amount1="94%"
              amount2="יעילות מערכת"
              percentage="+2.1%"
              status="up"
              icon={<TrendingUp />}
            />
          </Box>
        </Grid>

        {/* ALL TRACKING CARDS */}
        <Grid container item xs={12} spacing={3}>
          {cardData.map((item) => (
            <Grid item lg={3} md={6} sm={6} xs={12} key={item.id}>
              <Card1
                title={item.title}
                color={item.color}
                amount1={item.amount1}
                amount2={item.amount2}
                percentage={item.percentage}
                status={item.status}
                icon={item.icon}
              />
            </Grid>
          ))}
        </Grid>

        {/* SALES AREA */}
        <Grid item xs={12}>
          <Sales />
        </Grid>

        {/* ANALYTICS AREA */}
        <Grid item xs={12}>
          <Analytics />
        </Grid>

        {/* RECENT PURCHASE AND STOCK ALERTS */}
        <Grid container item xs={12} spacing={3}>
          {/* RECENT PURCHASE AREA */}
          <Grid item lg={8} md={7} xs={12}>
            <RecentPurchase />
          </Grid>

          {/* STOCK OUT PRODUCTS */}
          <Grid item lg={4} md={5} xs={12}>
            <StockOutProducts />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
