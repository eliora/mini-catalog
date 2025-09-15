import { 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Box,
  Chip,
  Stack
} from '@mui/material';
import { ShoppingCart, AdminPanelSettings, Store } from '@mui/icons-material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h1" gutterBottom>
          פורטל לקוסמטיקאיות
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          מערכת הזמנות מתקדמת עם Next.js 14, MUI v5, Supabase ו-TanStack Query
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Chip label="Next.js 14" color="primary" />
          <Chip label="TypeScript" color="secondary" />
          <Chip label="MUI v5" color="success" />
          <Chip label="Supabase" color="warning" />
          <Chip label="TanStack Query" color="info" />
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Store sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              קטלוג מוצרים
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              עיון במוצרים עם פילטרים מתקדמים, חיפוש וגלילה אינסופית
            </Typography>
            <Link href="/catalog" passHref>
              <Button variant="contained" size="large" fullWidth>
                לקטלוג
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <ShoppingCart sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              עגלת קניות
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              ניהול הזמנות עם אינטגרציית תשלומים דרך Hypay
            </Typography>
            <Link href="/orderform" passHref>
              <Button variant="contained" color="success" size="large" fullWidth>
                להזמנה
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <AdminPanelSettings sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              פאנל ניהול
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              ניהול מוצרים, הזמנות ומשתמשים עם הרשאות מבוססות תפקידים
            </Typography>
            <Link href="/admin" passHref>
              <Button variant="contained" color="warning" size="large" fullWidth>
                לניהול
              </Button>
            </Link>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          🎉 הגדרת Next.js הושלמה בהצלחה!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          המערכת כוללת:
        </Typography>
        <Box component="ul" sx={{ mt: 1, '& li': { mb: 0.5 } }}>
          <li>✅ Next.js 14 עם App Router ו-TypeScript</li>
          <li>✅ MUI v5 עם תמיכה מלאה ב-SSR ו-RTL</li>
          <li>✅ Supabase עם לקוחות server ו-client</li>
          <li>✅ TanStack Query עם hydration</li>
          <li>✅ עיצוב רספונסיבי עם ערכת הנושא המותאמת</li>
          <li>✅ Context Providers עם TypeScript ותמיכה בזמן אמת</li>
        </Box>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link href="/test-contexts" passHref>
            <Button variant="outlined" size="small">
              בדוק Context Providers
            </Button>
          </Link>
        </Box>
      </Box>
    </Container>
  );
}