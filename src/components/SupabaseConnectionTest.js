import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  Button,
  Chip,
  Paper,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { supabase } from '../config/supabase';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState(null);

  const testConnection = useCallback(async () => {
    setConnectionStatus('checking');
    setLastChecked(new Date());

    try {
      // Test 1: Basic connection test
      const { error: connectionError } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`);
      }

      // Test 2: Get actual product count
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Count query failed: ${countError.message}`);
      }

      setConnectionStatus('connected');
      setConnectionDetails({
        productCount: count || 0,
        timestamp: new Date(),
        success: true
      });

    } catch (error) {
      
      setConnectionStatus('disconnected');
      setConnectionDetails({
        error: error.message,
        timestamp: new Date(),
        success: false
      });
    }
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'error';
      case 'checking':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <ConnectedIcon />;
      case 'disconnected':
        return <DisconnectedIcon />;
      case 'checking':
        return (
          <RefreshIcon
            sx={{
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />
        );
      default:
        return <DisconnectedIcon />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'מחובר ל-Supabase';
      case 'disconnected':
        return 'לא מחובר ל-Supabase';
      case 'checking':
        return 'בודק חיבור...';
      default:
        return 'סטטוס לא ידוע';
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 2,

        border: '2px solid',
        borderColor: connectionStatus === 'connected' ? 'success.main' : 'error.main'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={getStatusIcon()}
            label={getStatusText()}
            color={getStatusColor()}
            variant="outlined"
          />
          {lastChecked && (
            <Typography variant="body2" color="text.secondary">
              נבדק לאחרונה: {lastChecked.toLocaleTimeString('he-IL')}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={testConnection}
            disabled={connectionStatus === 'checking'}
            startIcon={<RefreshIcon />}
          >
            בדוק שוב
          </Button>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {connectionDetails && (
            <>
              {connectionStatus === 'connected' ? (
                <Alert severity="success">
                  <AlertTitle>✅ חיבור תקין</AlertTitle>
                  <Typography>
                    מספר מוצרים במסד הנתונים: <strong>{connectionDetails.productCount}</strong>
                  </Typography>
                  <Typography variant="body2">
                    נבדק ב: {connectionDetails.timestamp.toLocaleString('he-IL')}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="error">
                  <AlertTitle>❌ בעיית חיבור</AlertTitle>
                  <Typography>
                    שגיאה: <strong>{connectionDetails.error}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    וודא ש:
                  </Typography>
                  <Typography variant="body2" component="div">
                    • קובץ <code>.env.local</code> מכיל את פרטי החיבור הנכונים<br/>
                    • מסד הנתונים Supabase פעיל<br/>
                    • טבלאות המוצרים וההזמנות קיימות<br/>
                    • הגדרות האבטחה (RLS) מוגדרות נכון
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default SupabaseConnectionTest;
