"use client";

import {
  Box,
  Card,
  Button,
  IconButton,
  Typography,
  Divider,
  Menu,
  MenuItem
} from "@mui/material";
import {
  Delete,
  Edit,
  LocalShipping,
  CheckCircle,
  Cancel,
  Email,
  Print,
  FileDownload,
  Close,
  ArrowDropDown
} from "@mui/icons-material";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Paragraph } from "@/components/Typography";
import { useState } from "react";

interface BulkOrderActionsProps {
  selectedCount: number;
  onBulkStatusChange: (status: string) => void;
  onBulkDelete?: () => void;
  onBulkExport?: () => void;
  onBulkPrint?: () => void;
  onBulkEmail?: () => void;
  onClearSelection: () => void;
}

export default function BulkOrderActions({
  selectedCount,
  onBulkStatusChange,
  onBulkDelete,
  onBulkExport,
  onBulkPrint,
  onBulkEmail,
  onClearSelection
}: BulkOrderActionsProps) {
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);

  const statusOptions = [
    { value: "pending", label: "ממתין", icon: <Edit />, color: "warning" },
    { value: "processing", label: "מעובד", icon: <LocalShipping />, color: "info" },
    { value: "shipped", label: "נשלח", icon: <LocalShipping />, color: "primary" },
    { value: "delivered", label: "נמסר", icon: <CheckCircle />, color: "success" },
    { value: "completed", label: "הושלם", icon: <CheckCircle />, color: "success" },
    { value: "cancelled", label: "בוטל", icon: <Cancel />, color: "error" }
  ];

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
                {selectedCount} הזמנות נבחרו
              </Typography>
              <Paragraph color="grey.600" fontSize="0.85rem">
                בחר פעולה לביצוע על ההזמנות הנבחרות
              </Paragraph>
            </Box>
          </FlexBox>

          <FlexBox alignItems="center" gap={1}>
            {/* Status Change */}
            <Button
              variant="outlined"
              endIcon={<ArrowDropDown />}
              onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              עדכן סטטוס
            </Button>

            {/* Communication Actions */}
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={onBulkEmail}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              שלח אימייל
            </Button>

            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={onBulkPrint}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              הדפס
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

            <IconButton
              onClick={onClearSelection}
              size="small"
              sx={{ 
                bgcolor: "grey.200",
                "&:hover": { bgcolor: "grey.300" }
              }}
            >
              <Close />
            </IconButton>
          </FlexBox>
        </FlexBetween>
      </Box>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 200 }
        }}
      >
        {statusOptions.map((status) => (
          <MenuItem
            key={status.value}
            onClick={() => {
              onBulkStatusChange(status.value);
              setStatusMenuAnchor(null);
            }}
            sx={{ 
              gap: 1,
              color: `${status.color}.main`
            }}
          >
            {status.icon}
            {status.label}
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
}
