/**
 * QuickPaymentPage Example
 * 
 * This file demonstrates how to use the QuickPaymentPage component
 * for standalone payment processing where users can input any amount.
 */

import React from 'react';
import { Box, Container, Typography, Alert, Button } from '@mui/material';
import { QuickPaymentPage } from '../src/hypay';

// Example: Basic quick payment page
const BasicQuickPaymentExample = () => {
  const companySettings = {
    currency: 'ILS',
    paymentMethods: ['credit_card', 'paypal', 'bit'],
    paymentExpiryMinutes: 30
  };

  const handlePaymentSuccess = (paymentSession) => {
    console.log('Payment successful!', paymentSession);
    alert(`תשלום הושלם בהצלחה! מספר עסקה: ${paymentSession.transaction_id}`);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    alert(`שגיאה בתשלום: ${error}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        דוגמה - עמוד תשלום מהיר
      </Typography>

      <QuickPaymentPage
        companySettings={companySettings}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        title="תשלום מהיר"
        description="הזן את הסכום הרצוי ופרטיך לביצוע התשלום"
        minAmount={10}
        maxAmount={5000}
        defaultCurrency="ILS"
      />
    </Container>
  );
};

// Example: Donation page
const DonationPageExample = () => {
  const companySettings = {
    currency: 'ILS',
    paymentMethods: ['credit_card', 'paypal', 'bit']
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <QuickPaymentPage
        companySettings={companySettings}
        onPaymentSuccess={(session) => {
          console.log('Donation successful:', session);
          // Could redirect to thank you page or show special message
        }}
        title="תרומה לארגון"
        description="תרומתך חשובה לנו ותסייע לפעילותנו"
        minAmount={5}
        maxAmount={10000}
        defaultCurrency="ILS"
      />
    </Container>
  );
};

// Example: Service payment page
const ServicePaymentExample = () => {
  const companySettings = {
    currency: 'ILS',
    paymentMethods: ['credit_card', 'bit']
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <QuickPaymentPage
        companySettings={companySettings}
        title="תשלום עבור שירותים"
        description="שלם עבור השירותים שקיבלת"
        minAmount={50}
        maxAmount={2000}
        defaultCurrency="ILS"
      />
    </Container>
  );
};

// Example: Multiple payment scenarios in one page
const MultiScenarioExample = () => {
  const [selectedScenario, setSelectedScenario] = React.useState('donation');
  
  const scenarios = {
    donation: {
      title: 'תרומה',
      description: 'תרום לעמותה',
      minAmount: 10,
      maxAmount: 5000
    },
    deposit: {
      title: 'פיקדון',
      description: 'הפקד כסף לחשבון',
      minAmount: 100,
      maxAmount: 10000
    },
    service: {
      title: 'תשלום עבור שירות',
      description: 'שלם עבור השירות שקיבלת',
      minAmount: 50,
      maxAmount: 1000
    }
  };

  const companySettings = {
    currency: 'ILS',
    paymentMethods: ['credit_card', 'paypal', 'bit']
  };

  const currentScenario = scenarios[selectedScenario];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        דוגמה - תרחישי תשלום שונים
      </Typography>

      {/* Scenario selector */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        {Object.entries(scenarios).map(([key, scenario]) => (
          <Button
            key={key}
            variant={selectedScenario === key ? 'contained' : 'outlined'}
            onClick={() => setSelectedScenario(key)}
          >
            {scenario.title}
          </Button>
        ))}
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        נבחר תרחיש: {currentScenario.title}
      </Alert>

      <QuickPaymentPage
        key={selectedScenario} // Force re-render when scenario changes
        companySettings={companySettings}
        title={currentScenario.title}
        description={currentScenario.description}
        minAmount={currentScenario.minAmount}
        maxAmount={currentScenario.maxAmount}
        onPaymentSuccess={(session) => {
          console.log(`${currentScenario.title} payment successful:`, session);
          alert(`${currentScenario.title} הושלם בהצלחה!`);
        }}
      />
    </Container>
  );
};

// Example: Custom styling and branding
const CustomStyledExample = () => {
  const companySettings = {
    currency: 'ILS',
    paymentMethods: ['credit_card', 'paypal', 'bit']
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        <Box sx={{ 
          textAlign: 'center', 
          color: 'white', 
          mb: 4 
        }}>
          <Typography variant="h2" gutterBottom>
            חברת ABC
          </Typography>
          <Typography variant="h5">
            מערכת תשלומים מתקדמת
          </Typography>
        </Box>

        <Box sx={{ 
          bgcolor: 'white', 
          borderRadius: 3, 
          p: 2,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <QuickPaymentPage
            companySettings={companySettings}
            title="תשלום מאובטח"
            description="מערכת התשלומים המתקדמת והבטוחה שלנו"
            minAmount={1}
            maxAmount={50000}
            onPaymentSuccess={(session) => {
              console.log('Custom payment successful:', session);
              // Could show custom success animation or redirect
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

// Export examples
export {
  BasicQuickPaymentExample,
  DonationPageExample,
  ServicePaymentExample,
  MultiScenarioExample,
  CustomStyledExample
};

export default BasicQuickPaymentExample;
