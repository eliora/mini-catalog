"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon
} from "@mui/icons-material";
// LOCAL CUSTOM HOOK
import { useLayout } from "../dashboard-layout-context";

export default function DashboardNavbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { handleOpenMobileSidebar, handleSidebarCompactToggle } = useLayout();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        height: 70
      }}
    >
      <Toolbar sx={{ height: "100%" }}>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            edge="start"
            onClick={handleOpenMobileSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Desktop sidebar toggle */}
        {!isMobile && (
          <IconButton
            edge="start"
            onClick={handleSidebarCompactToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Page title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <AccountIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
