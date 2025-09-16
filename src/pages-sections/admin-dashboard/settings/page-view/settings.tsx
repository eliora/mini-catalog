"use client";

import { useState } from "react";
import { Box, Tab, Card } from "@mui/material";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import { styled } from "@mui/material/styles";
// LOCAL CUSTOM COMPONENTS
import GeneralSettings from "../general-settings";
import CompanySettings from "../company-settings";
import TaxSettings from "../tax-settings";
import NotificationSettings from "../notification-settings";
import SystemSettings from "../system-settings";

// STYLED COMPONENTS
const StyledTabPanel = styled(TabPanel)({
  paddingLeft: 0,
  paddingRight: 0,
  paddingBottom: 0,
});

const StyledTabList = styled(TabList)(({ theme }) => ({
  "& .MuiTab-root.Mui-selected": { color: theme.palette.primary.main },
  "& .MuiTabs-indicator": { background: theme.palette.primary.main },
}));

export default function SettingsManagementView() {
  const [selectedTab, setSelectedTab] = useState("general");

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: "grey.300", px: 3, pt: 3 }}>
            <StyledTabList
              onChange={(_, value) => setSelectedTab(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="הגדרות כלליות" value="general" disableRipple />
              <Tab label="פרטי החברה" value="company" disableRipple />
              <Tab label="מיסוי ומשלוח" value="tax" disableRipple />
              <Tab label="התראות" value="notifications" disableRipple />
              <Tab label="הגדרות מערכת" value="system" disableRipple />
            </StyledTabList>
          </Box>

          <StyledTabPanel value="general">
            <GeneralSettings />
          </StyledTabPanel>

          <StyledTabPanel value="company">
            <CompanySettings />
          </StyledTabPanel>

          <StyledTabPanel value="tax">
            <TaxSettings />
          </StyledTabPanel>

          <StyledTabPanel value="notifications">
            <NotificationSettings />
          </StyledTabPanel>

          <StyledTabPanel value="system">
            <SystemSettings />
          </StyledTabPanel>
        </TabContext>
      </Card>
    </Box>
  );
}