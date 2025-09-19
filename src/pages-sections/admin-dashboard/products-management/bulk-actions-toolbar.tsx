"use client";

import {
  Box,
  Card,
  Button,
  Typography,
  Divider
} from "@mui/material";
import {
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  FileDownload,
  Close
} from "@mui/icons-material";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Paragraph } from "@/components/Typography";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkEdit?: () => void;
  onBulkExport?: () => void;
  onBulkStatusChange?: (status: string) => void;
  onClearSelection: () => void;
}

export default function BulkActionsToolbar({
  selectedCount,
  onBulkDelete,
  onBulkEdit,
  onBulkExport,
  onBulkStatusChange,
  onClearSelection
}: BulkActionsToolbarProps) {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 3, 
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        border: "2px solid",
        borderColor: "primary.main",
        bgcolor: "primary.50"
      }}
    >
      <Box sx={{ p: 2 }}>
        <FlexBetween>
          <FlexBox alignItems="center" gap={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700
              }}
            >
              {selectedCount}
            </Box>
            
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedCount} מוצרים נבחרו
              </Typography>
              <Paragraph color="grey.600" fontSize="0.85rem">
                בחר פעולה לביצוע על המוצרים הנבחרים
              </Paragraph>
            </Box>
          </FlexBox>

          <FlexBox alignItems="center" gap={1}>
            {/* Bulk Actions */}
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={onBulkEdit}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              עריכה
            </Button>

            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => onBulkStatusChange?.("active")}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              הפעל
            </Button>

            <Button
              variant="outlined"
              startIcon={<VisibilityOff />}
              onClick={() => onBulkStatusChange?.("draft")}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              השבת
            </Button>

            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={onBulkExport}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              ייצא
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={onBulkDelete}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              מחק
            </Button>

            <Box
              onClick={onClearSelection}
              sx={{ 
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: "grey.200",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Close fontSize="small" />
            </Box>
          </FlexBox>
        </FlexBetween>
      </Box>
    </Card>
  );
}
