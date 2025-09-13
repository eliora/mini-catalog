/**
 * SupabaseError Component
 * 
 * User-friendly error display for Supabase connection issues.
 * Provides setup instructions and troubleshooting steps.
 * 
 * Features:
 * - Clear error messaging
 * - Step-by-step Supabase setup guide
 * - Copy-to-clipboard functionality for environment variables
 * - Retry connection functionality
 * - Links to Supabase documentation
 * 
 * @param {Error} error - The error object from Supabase
 * @param {Function} onRetry - Callback to retry connection
 */

import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Error as ErrorIcon,
  Launch as LaunchIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

const SupabaseError = ({ error, onRetry }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const exampleEnvContent = `# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_key_here`;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorIcon />
            שגיאת חיבור לבסיס נתונים
          </Box>
        </AlertTitle>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error?.message || 'לא ניתן להתחבר לבסיס הנתונים Supabase'}
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 הגדרת Supabase - מדריך מהיר
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            כדי לראות את המוצרים מבסיס הנתונים, יש צורך להגדיר את Supabase:
          </Typography>

          <List dense>
            <ListItem>
              <ListItemText 
                primary="1. צור חשבון Supabase"
                secondary={
                  <Button 
                    size="small" 
                    startIcon={<LaunchIcon />}
                    onClick={() => window.open('https://supabase.com', '_blank')}
                  >
                    פתח supabase.com
                  </Button>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="2. צור פרויקט חדש"
                secondary="בלוח הבקרה של Supabase, לחץ על 'New Project'"
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="3. העתק את פרטי החיבור"
                secondary="עבור ל-Settings → API והעתק את Project URL ואת Public anon key"
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="4. צור קובץ .env.local"
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      בתיקיית הפרויקט, צור קובץ בשם .env.local עם התוכן הבא:
                    </Typography>
                    <Box 
                      sx={{ 
                        backgroundColor: 'grey.100', 
                        p: 2, 
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        position: 'relative'
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {exampleEnvContent}
                      </pre>
                      <Button
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={() => copyToClipboard(exampleEnvContent)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        העתק
                      </Button>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="5. הפעל מחדש את השרת"
                secondary="עצור את השרת (Ctrl+C) והפעל שוב npm start"
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            💡 לפרטים נוספים, עיין בקובץ SUPABASE_SETUP_GUIDE.md בתיקיית הפרויקט
          </Typography>

          {onRetry && (
            <Button 
              variant="contained" 
              onClick={onRetry}
              sx={{ mt: 2 }}
            >
              נסה שוב לחבר
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupabaseError;
