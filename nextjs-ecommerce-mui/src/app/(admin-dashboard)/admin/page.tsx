import { Metadata } from "next";
import { DashboardPageView } from "@/pages-sections/admin-dashboard/dashboard/page-view";

export const metadata: Metadata = {
  title: "Admin Dashboard - Mini Catalog",
  description: "Admin dashboard for managing the mini catalog system",
};

export default function AdminDashboard() {
  return <DashboardPageView />;
}