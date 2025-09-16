import { PropsWithChildren } from "react";
import { Typography, Box } from "@mui/material";

// ==============================================================
interface Props extends PropsWithChildren {
  title: string;
}
// ==============================================================

export default function PageWrapper({ children, title }: Props) {
  return (
    <Box sx={{ pt: 2, pb: 2 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>

      {children}
    </Box>
  );
}
