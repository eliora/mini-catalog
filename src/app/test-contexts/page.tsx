'use client';

import { Container, Typography, Card, CardContent, Box, Button, Stack } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useCompany } from '@/context/CompanyContext';

export default function TestContextsPage() {
  const auth = useAuth();
  const cart = useCart();
  const company = useCompany();

  const handleAddTestItem = () => {
    // Add a test product to cart
    cart.addItem({
      id: 'test-1',
      ref: 'TEST001',
      product_name: 'Test Product',
      main_pic: null,
      size: 'Medium',
      product_type: 'Test',
    } as any, 2, 'Test notes');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        בדיקת Context Providers
      </Typography>
      
      <Stack spacing={3}>
        {/* Auth Context Test */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔐 AuthContext
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              <div>מחובר: {auth.isAuthenticated() ? 'כן' : 'לא'}</div>
              <div>טוען: {auth.isLoading ? 'כן' : 'לא'}</div>
              <div>מאתחל: {auth.isInitializing ? 'כן' : 'לא'}</div>
              <div>משתמש: {auth.user?.email || 'אין'}</div>
              <div>אדמין: {auth.isAdmin() ? 'כן' : 'לא'}</div>
              {auth.error && <div style={{ color: 'red' }}>שגיאה: {auth.error}</div>}
            </Box>
          </CardContent>
        </Card>

        {/* Cart Context Test */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🛒 CartContext
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, fontFamily: 'monospace', fontSize: '0.875rem', mb: 2 }}>
              <div>פריטים בעגלה: {cart.getItemCount()}</div>
              <div>סכום ביניים: ₪{cart.getSubtotal().toFixed(2)}</div>
              <div>סה״כ: ₪{cart.getTotal().toFixed(2)}</div>
              <div>טוען: {cart.isLoading ? 'כן' : 'לא'}</div>
              {cart.error && <div style={{ color: 'red' }}>שגיאה: {cart.error}</div>}
            </Box>
            <Button variant="outlined" onClick={handleAddTestItem} size="small">
              הוסף פריט לבדיקה
            </Button>
            {cart.cart.items.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">פריטים בעגלה:</Typography>
                {cart.cart.items.map((item, index) => (
                  <Box key={index} sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {item.product_name} x{item.quantity} - {item.notes}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Company Context Test */}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏢 CompanyContext
            </Typography>
            <Box sx={{ display: 'grid', gap: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}>
              <div>שם החברה: {company.getDisplayName()}</div>
              <div>טוען: {company.isLoading ? 'כן' : 'לא'}</div>
              <div>עודכן לאחרונה: {company.lastUpdated?.toLocaleString('he-IL') || 'אין'}</div>
              {company.settings && (
                <>
                  <div>תיאור: {company.settings.company_description}</div>
                  <div>אימייל: {company.settings.contact_email || 'אין'}</div>
                  <div>טלפון: {company.settings.contact_phone || 'אין'}</div>
                </>
              )}
              {company.error && <div style={{ color: 'red' }}>שגיאה: {company.error}</div>}
            </Box>
          </CardContent>
        </Card>

        {/* Success Summary */}
        <Card elevation={3} sx={{ bgcolor: 'success.50', borderColor: 'success.main', border: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              ✅ מיגרציה הושלמה בהצלחה!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              כל שלושת ה-Context Providers מוכנים לשימוש:
            </Typography>
            <Box component="ul" sx={{ mt: 1, '& li': { mb: 0.5 } }}>
              <li>✅ AuthContext - עם TypeScript ותמיכה בזמן אמת</li>
              <li>✅ CartContext - עם TypeScript וניהול localStorage</li>
              <li>✅ CompanyContext - עם TypeScript ותמיכה בזמן אמת</li>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
