/**
 * @file Client Statistics Grid Component
 * @description Renders a grid of cards displaying key statistics about the client list.
 */
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface ClientStatsGridProps {
  totalClients: number;
  activeClients: number;
  verifiedMembers: number;
  adminUsers: number;
}

const ClientStatsGrid: React.FC<ClientStatsGridProps> = ({
  totalClients,
  activeClients,
  verifiedMembers,
  adminUsers,
}) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6">{totalClients}</Typography>
          <Typography variant="body2" color="text.secondary">סך הכל לקוחות</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">{activeClients}</Typography>
          <Typography variant="body2" color="text.secondary">לקוחות פעילים</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">{verifiedMembers}</Typography>
          <Typography variant="body2" color="text.secondary">חברים מאומתים</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">{adminUsers}</Typography>
          <Typography variant="body2" color="text.secondary">מנהלים</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientStatsGrid;
