/**
 * @file Client Management Header Component
 * @description Renders the main action buttons for the client management page,
 * such as Import, Export, and Add Client.
 */
import React from 'react';
import { Box, Button } from '@mui/material';
import { Add as AddIcon, Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';

interface ClientManagementHeaderProps {
  canWrite: boolean;
  onAddClient: () => void;
  onExport: () => void;
  onImport: () => void;
}

const ClientManagementHeader: React.FC<ClientManagementHeaderProps> = ({
  canWrite,
  onAddClient,
  onExport,
  onImport,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={onImport}
        >
          ייבוא
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExport}
        >
          ייצוא
        </Button>
        {canWrite && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClient}
          >
            הוסף לקוח
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ClientManagementHeader;
