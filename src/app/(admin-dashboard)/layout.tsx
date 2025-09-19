import { PropsWithChildren } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminAuthGuard from "@/components/admin/guards/AdminAuthGuard";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
};

export default Layout;
