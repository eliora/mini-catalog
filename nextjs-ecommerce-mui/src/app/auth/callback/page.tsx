import { Container, Typography, Box, CircularProgress } from '@mui/material';

export default function AuthCallbackPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h4" gutterBottom>
          מעבד אימות...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          אנא המתן בזמן שאנחנו מאמתים את הפרטים שלך
        </Typography>
      </Box>
    </Container>
  );
}
