import { Container, Typography, Box } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

export default function OrderFormPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <ShoppingCart sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h2" gutterBottom>
          טופס הזמנה
        </Typography>
        <Typography variant="h6" color="text.secondary">
          כאן יהיה טופס ההזמנה עם עגלת הקניות
        </Typography>
      </Box>
      
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        border: 1, 
        borderColor: 'divider',
        textAlign: 'center'
      }}>
        <Typography variant="body1">
          🚧 בתהליך פיתוח - רכיבי ההזמנה ימיגרו בקרוב
        </Typography>
      </Box>
    </Container>
  );
}
