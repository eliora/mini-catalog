// ADMIN NAVIGATION CONFIGURATION
// Adapted from Bazaar Pro template for our mini-catalog admin panel

export const navigation = [
  { type: "label", label: "לוח בקרה מנהל" },
  { 
    name: "דשבורד", 
    icon: "🏠",
    path: "/admin" 
  },

  {
    name: "ניהול לקוחות",
    icon: "👥",
    path: "/admin/client-management"
  },

  {
    name: "ניהול מוצרים",
    icon: "📦",
    path: "/admin/products-management"
  },

  {
    name: "ניהול הזמנות",
    icon: "🛒",
    path: "/admin/orders-management"
  },

  {
    name: "הגדרות מערכת",
    icon: "⚙️",
    path: "/admin/settings"
  },

  { type: "label", label: "כלי מערכת" },
  {
    name: "אנליטיקס",
    icon: "📊",
    path: "/admin/analytics"
  },
  {
    name: "התנתקות",
    icon: "🚪",
    path: "/auth/logout"
  }
];
