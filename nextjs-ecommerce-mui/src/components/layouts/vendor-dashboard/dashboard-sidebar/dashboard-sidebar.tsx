"use client";

import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Divider
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
// LOCAL CUSTOM HOOK
import { useLayout } from "../dashboard-layout-context";
// NAVIGATION DATA
import { navigation } from "../dashboard-navigation";

const DRAWER_WIDTH = 280;
const COMPACT_WIDTH = 86;

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  
  const {
    sidebarCompact,
    showMobileSideBar,
    handleCloseMobileSidebar,
    handleSidebarHover,
    isSidebarHover
  } = useLayout();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      handleCloseMobileSidebar();
    }
  };

  const drawerContent = (
    <Box
      sx={{ 
        height: "100%", 
        display: "flex", 
        flexDirection: "column",
        overflow: "hidden"
      }}
      onMouseEnter={() => handleSidebarHover(true)}
      onMouseLeave={() => handleSidebarHover(false)}
    >
      {/* Logo/Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarCompact && !isSidebarHover ? "center" : "flex-start",
          borderBottom: "1px solid",
          borderColor: "divider",
          height: 70
        }}
      >
        {(!sidebarCompact || isSidebarHover) && (
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            Admin Panel
          </Typography>
        )}
        {sidebarCompact && !isSidebarHover && (
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            AP
          </Typography>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ p: 1 }}>
          {navigation.map((item, index) => {
            if (item.type === "label") {
              return (
                <Box key={index}>
                  {(!sidebarCompact || isSidebarHover) && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 2,
                        py: 1,
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.75rem"
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                  {sidebarCompact && !isSidebarHover && <Divider sx={{ my: 1 }} />}
                </Box>
              );
            }

            const isActive = pathname === item.path;

            return (
              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path!)}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mx: 0.5,
                    justifyContent: sidebarCompact && !isSidebarHover ? "center" : "flex-start",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "primary.contrastText"
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCompact && !isSidebarHover ? "auto" : 40,
                      mr: sidebarCompact && !isSidebarHover ? 0 : 1.5,
                      justifyContent: "center",
                      fontSize: "1.5rem"
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {(!sidebarCompact || isSidebarHover) && (
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight: isActive ? 600 : 500
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={showMobileSideBar}
        onClose={handleCloseMobileSidebar}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box"
          }
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarCompact ? COMPACT_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarCompact ? COMPACT_WIDTH : DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: "width 0.3s"
        }
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
