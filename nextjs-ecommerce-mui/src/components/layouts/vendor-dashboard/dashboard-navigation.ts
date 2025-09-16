// ADMIN NAVIGATION CONFIGURATION
// Adapted from Bazaar Pro template for our mini-catalog admin panel

export const navigation = [
  { type: "label", label: "Admin Dashboard" },
  { 
    name: "Dashboard", 
    icon: "🏠", // Will replace with proper icons later
    path: "/admin" 
  },

  {
    name: "Client Management",
    icon: "👥",
    path: "/admin/client-management"
  },

  {
    name: "Products Management",
    icon: "📦",
    path: "/admin/products-management"
  },

  {
    name: "Orders Management",
    icon: "🛒",
    path: "/admin/orders-management"
  },

  {
    name: "Settings",
    icon: "⚙️",
    path: "/admin/settings"
  },

  { type: "label", label: "System" },
  {
    name: "Analytics",
    icon: "📊",
    path: "/admin/analytics"
  },
  {
    name: "Logout",
    icon: "🚪",
    path: "/auth/logout"
  }
];
