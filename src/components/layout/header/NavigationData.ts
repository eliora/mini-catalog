/**
 * NavigationData - Navigation menu structure for JDA Header
 * 
 * Contains the complete navigation menu structure matching the JDA website.
 * Organized by categories with submenu items and routing information.
 * 
 * Features:
 * - Hierarchical menu structure with categories and items
 * - Skin needs classification system
 * - Product categories with detailed subcategories
 * - Makeup categories and tools
 * - Routing information for navigation
 * - Full TypeScript type definitions
 */

// Navigation item interfaces
export interface NavigationSubItem {
  label: string;
  value: string;
  route?: string;
}

export interface NavigationCategory {
  category: string;
  items: NavigationSubItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  route?: string;
  submenu?: (NavigationSubItem | NavigationCategory)[];
}

// Navigation items configuration
export const navigationItems: NavigationItem[] = [
  {
    id: 'newProducts',
    label: 'מוצרים חדשים',
    route: '/catalog?filter=new'
  },
  {
    id: 'skinNeeds',
    label: 'צרכי עור',
    submenu: [
      { label: 'עור יבש', value: 'dry', route: '/catalog?skinType=dry' },
      { label: 'עור מעורב', value: 'combination', route: '/catalog?skinType=combination' },
      { label: 'עור שמני', value: 'oily', route: '/catalog?skinType=oily' },
      { label: 'עור רגיש', value: 'sensitive', route: '/catalog?skinType=sensitive' },
      { label: 'עור בוגר', value: 'mature', route: '/catalog?skinType=mature' },
      { label: 'עור רגיל', value: 'normal', route: '/catalog?skinType=normal' }
    ]
  },
  {
    id: 'products',
    label: 'מוצרים',
    submenu: [
      {
        category: 'ניקוי פנים',
        items: [
          { label: 'קרם ניקוי', value: 'cleansing-cream', route: '/catalog?category=cleansing-cream' },
          { label: 'חלב ניקוי', value: 'cleansing-milk', route: '/catalog?category=cleansing-milk' },
          { label: 'ג\'ל ניקוי', value: 'cleansing-gel', route: '/catalog?category=cleansing-gel' },
          { label: 'קצף ניקוי', value: 'cleansing-foam', route: '/catalog?category=cleansing-foam' },
          { label: 'שמן ניקוי', value: 'cleansing-oil', route: '/catalog?category=cleansing-oil' },
          { label: 'מי פנים', value: 'toner', route: '/catalog?category=toner' },
          { label: 'מסכת ניקוי', value: 'cleansing-mask', route: '/catalog?category=cleansing-mask' }
        ]
      },
      {
        category: 'טיפוח פנים',
        items: [
          { label: 'קרם יום', value: 'day-cream', route: '/catalog?category=day-cream' },
          { label: 'קרם לילה', value: 'night-cream', route: '/catalog?category=night-cream' },
          { label: 'טיפוח 24 שעות', value: '24h-care', route: '/catalog?category=24h-care' },
          { label: 'סרום', value: 'serum', route: '/catalog?category=serum' },
          { label: 'אמפולות', value: 'ampoules', route: '/catalog?category=ampoules' }
        ]
      },
      {
        category: 'טיפוח עיניים',
        items: [
          { label: 'קרם עיניים', value: 'eye-cream', route: '/catalog?category=eye-cream' },
          { label: 'סרום עיניים', value: 'eye-serum', route: '/catalog?category=eye-serum' },
          { label: 'מסכת עיניים', value: 'eye-mask', route: '/catalog?category=eye-mask' }
        ]
      },
      {
        category: 'הגנה מהשמש',
        items: [
          { label: 'קרם הגנה', value: 'sun-protection', route: '/catalog?category=sun-protection' },
          { label: 'לוציון הגנה', value: 'sun-lotion', route: '/catalog?category=sun-lotion' }
        ]
      }
    ]
  },
  {
    id: 'makeupCollection',
    label: 'קולקציית איפור',
    submenu: [
      {
        category: 'איפור פנים',
        items: [
          { label: 'קונסילר', value: 'concealer', route: '/catalog?category=concealer' },
          { label: 'סומק', value: 'rouge', route: '/catalog?category=rouge' },
          { label: 'פודרה', value: 'powder', route: '/catalog?category=powder' },
          { label: 'בסיס', value: 'foundation', route: '/catalog?category=foundation' }
        ]
      },
      {
        category: 'איפור עיניים',
        items: [
          { label: 'צלליות', value: 'eyeshadow', route: '/catalog?category=eyeshadow' },
          { label: 'מסקרה', value: 'mascara', route: '/catalog?category=mascara' },
          { label: 'אייליינר', value: 'eyeliner', route: '/catalog?category=eyeliner' },
          { label: 'עיפרון גבות', value: 'eyebrow', route: '/catalog?category=eyebrow' }
        ]
      },
      {
        category: 'איפור שפתיים',
        items: [
          { label: 'שפתון', value: 'lipstick', route: '/catalog?category=lipstick' },
          { label: 'גלוס', value: 'lipgloss', route: '/catalog?category=lipgloss' },
          { label: 'עיפרון שפתיים', value: 'lip-liner', route: '/catalog?category=lip-liner' }
        ]
      }
    ]
  },
  {
    id: 'productLines',
    label: 'קווי מוצרים',
    submenu: [
      { label: 'DÉMAQUILLANTE', value: 'demaquillante', route: '/catalog?line=demaquillante' },
      { label: 'HYDRATANTE', value: 'hydratante', route: '/catalog?line=hydratante' },
      { label: 'SENSITIVE', value: 'sensitive', route: '/catalog?line=sensitive' },
      { label: 'PURIFIANTE', value: 'purifiante', route: '/catalog?line=purifiante' },
      { label: 'ARCELMED', value: 'arcelmed', route: '/catalog?line=arcelmed' },
      { label: 'PRESTIGE', value: 'prestige', route: '/catalog?line=prestige' },
      { label: 'CAVIAR', value: 'caviar', route: '/catalog?line=caviar' },
      { label: 'ANTI-AGE', value: 'anti-age', route: '/catalog?line=anti-age' }
    ]
  },
  {
    id: 'blog',
    label: 'בלוג',
    route: '/blog'
  },
  {
    id: 'contact',
    label: 'צור קשר',
    route: '/contact'
  }
];

// Helper functions for navigation
export const findNavigationItemById = (id: string): NavigationItem | undefined => {
  return navigationItems.find(item => item.id === id);
};

export const getAllRoutes = (): string[] => {
  const routes: string[] = [];
  
  navigationItems.forEach(item => {
    if (item.route) {
      routes.push(item.route);
    }
    
    if (item.submenu) {
      item.submenu.forEach(subItem => {
        if ('route' in subItem && subItem.route) {
          routes.push(subItem.route);
        } else if ('items' in subItem) {
          subItem.items.forEach(nestedItem => {
            if (nestedItem.route) {
              routes.push(nestedItem.route);
            }
          });
        }
      });
    }
  });
  
  return routes;
};

export default navigationItems;

