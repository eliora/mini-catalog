import { Container, Typography, Box } from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = await createClient();
  
  // Get current user (middleware ensures user is authenticated and is admin)
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <AdminPanelSettings sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        <Typography variant="h2" gutterBottom>
          פאנל ניהול
        </Typography>
        <Typography variant="h6" color="text.secondary">
          ברוכים הבאים למערכת הניהול
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            מחובר כ: {user.email}
          </Typography>
        )}
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
          🚧 בתהליך פיתוח - רכיבי הניהול ימיגרו בקרוב
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          הדף מוגן על ידי middleware - רק משתמשים מורשים יכולים לגשת
        </Typography>
      </Box>
    </Container>
  );
}
