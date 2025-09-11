import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  People as CustomersIcon,
  AttachMoney as RevenueIcon,
  Schedule as PendingIcon,
  CheckCircle as CompletedIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Light, compact Bazaar Pro inspired components
const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: '#FFFFFF',
  border: '1px solid #E3E9EF',
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    borderColor: '#4E97FD',
  },
}));

const TrendCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  background: '#FFFFFF',
  color: '#2B3445',
  height: '100%',
  border: '1px solid #E3E9EF',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
}));

const RecentActivityCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: '1px solid #E3E9EF',
  height: '100%',
  background: '#FFFFFF',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
}));

const DashboardOverview = ({ stats = {} }) => {
  const dashboardStats = [
    {
      title: 'סך הזמנות',
      value: stats.totalOrders || 0,
      change: '+12%',
      changeType: 'positive',
      icon: <OrdersIcon sx={{ fontSize: 20 }} />,
      color: '#4E97FD'
    },
    {
      title: 'מוצרים פעילים',
      value: stats.activeProducts || 0,
      change: '+8%',
      changeType: 'positive',
      icon: <ProductsIcon sx={{ fontSize: 20 }} />,
      color: '#33D067'
    },
    {
      title: 'לקוחות רשומים',
      value: stats.totalCustomers || 0,
      change: '+15%',
      changeType: 'positive',
      icon: <CustomersIcon sx={{ fontSize: 20 }} />,
      color: '#4BB4B4'
    },
    {
      title: 'הכנסות חודשיות',
      value: `₪${stats.monthlyRevenue || 0}`,
      change: '+23%',
      changeType: 'positive',
      icon: <RevenueIcon sx={{ fontSize: 20 }} />,
      color: '#FA8C16'
    }
  ];

  const trendStats = [
    {
      title: 'מכירות השבוע',
      value: stats.weeklyOrders || 0,
      percentage: 85,
      icon: <OrdersIcon sx={{ fontSize: 18 }} />
    },
    {
      title: 'הזמנות בטיפול',
      value: stats.pendingOrders || 0,
      percentage: 65,
      icon: <PendingIcon sx={{ fontSize: 18 }} />
    },
    {
      title: 'הזמנות שהושלמו',
      value: stats.completedOrders || 0,
      percentage: 92,
      icon: <CompletedIcon sx={{ fontSize: 18 }} />
    }
  ];

  const recentOrders = stats.recentOrders || [
    { id: '1001', customer: 'משה כהן', total: 250.00, status: 'pending', time: 'לפני 5 דקות' },
    { id: '1002', customer: 'שרה לוי', total: 180.50, status: 'completed', time: 'לפני 15 דקות' },
    { id: '1003', customer: 'דוד ישראלי', total: 320.75, status: 'processing', time: 'לפני 30 דקות' },
    { id: '1004', customer: 'רחל אברהם', total: 95.25, status: 'delivered', time: 'לפני שעה' },
  ];

  const growthRate = 15; // Example growth rate
  const monthlyGrowth = 23; // Example monthly growth

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: '#2B3445',
            mb: 1,
            fontSize: '1.75rem'
          }}
        >
          ברוך הבא, מנהל המערכת
        </Typography>
        <Typography variant="body1" sx={{ color: '#7D879C', mb: 3, fontSize: '0.95rem' }}>
          הנה סקירה כללית של המערכת שלך עבור היום
        </Typography>
      </Box>

      {/* Stats Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#7D879C', fontSize: '0.8rem', mb: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2B3445', fontSize: '1.5rem' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${stat.color}15`, 
                      color: stat.color,
                      width: 40,
                      height: 40
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#33D067' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 16, color: '#E94560' }} />
                  )}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: stat.changeType === 'positive' ? '#33D067' : '#E94560',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  >
                    {stat.change}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7D879C', fontSize: '0.75rem' }}>
                    מהחודש הקודם
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Trends Section */}
        <Grid item xs={12} md={8}>
          <TrendCard>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2B3445', fontSize: '1.125rem' }}>
              סטטיסטיקות ומגמות
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#2B3445', fontSize: '1.75rem' }}>
                  +{growthRate}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#7D879C', fontSize: '0.8rem', mb: 2 }}>
                  גידול שבועי במכירות
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={growthRate * 5} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#E3E9EF',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4E97FD',
                      borderRadius: 3
                    }
                  }} 
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#2B3445', fontSize: '1.75rem' }}>
                  +{monthlyGrowth}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#7D879C', fontSize: '0.8rem', mb: 2 }}>
                  גידול חודשי בהכנסות
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={monthlyGrowth * 8} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: '#E3E9EF',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#33D067',
                      borderRadius: 3
                    }
                  }} 
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5, backgroundColor: '#E3E9EF' }} />

            {/* Quick Stats */}
            <Grid container spacing={2}>
              {trendStats.map((stat, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#F6F9FC', 
                        color: '#4E97FD', 
                        mx: 'auto', 
                        mb: 1,
                        width: 48,
                        height: 48
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center', mb: 0.5, color: '#2B3445', fontSize: '1rem' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7D879C', textAlign: 'center', display: 'block', fontSize: '0.75rem' }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TrendCard>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <RecentActivityCard>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2B3445', fontSize: '1.125rem' }}>
                הזמנות אחרונות
              </Typography>
              
              <Stack spacing={1.5}>
                {recentOrders.slice(0, 4).map((order, index) => (
                  <Box key={index} sx={{ p: 2, borderRadius: 2, bgcolor: '#F6F9FC', border: '1px solid #E3E9EF' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#2B3445', fontSize: '0.875rem' }}>
                          הזמנה #{order.id}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#2B3445', fontSize: '0.8rem' }}>
                          {order.customer}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7D879C', fontSize: '0.75rem' }}>
                          {order.time}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={`₪${order.total?.toFixed(2) || '0.00'}`}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: '#4E97FD',
                            color: 'white',
                            fontSize: '0.75rem',
                            mb: 0.5
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          color: order.status === 'completed' ? '#33D067' : 
                                 order.status === 'pending' ? '#FA8C16' : 
                                 order.status === 'processing' ? '#4E97FD' : '#7D879C',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          {order.status === 'completed' ? 'הושלם' :
                           order.status === 'pending' ? 'בהמתנה' :
                           order.status === 'processing' ? 'בטיפול' : 'נמסר'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </RecentActivityCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;