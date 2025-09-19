import { PropsWithChildren } from "react";
import VendorDashboardLayout from "@/components/layouts/vendor-dashboard";
import AdminAuthGuard from "@/components/admin/guards/AdminAuthGuard";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <AdminAuthGuard>
      <VendorDashboardLayout>{children}</VendorDashboardLayout>
    </AdminAuthGuard>
  );
};

export default Layout;
