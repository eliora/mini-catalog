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
 */

export const navigationItems = [
  {
    id: 'newProducts',
    label: 'מוצרים חדשים',
    route: '/catalog?filter=new'
  },
  {
    id: 'skinNeeds',
    label: 'צרכי עור',
    submenu: [
      { label: 'עור יבש', value: 'dry' },
      { label: 'עור מעורב', value: 'combination' },
      { label: 'עור שמני', value: 'oily' },
      { label: 'עור רגיש', value: 'sensitive' },
      { label: 'עור בוגר', value: 'mature' },
      { label: 'עור רגיל', value: 'normal' }
    ]
  },
  {
    id: 'products',
    label: 'מוצרים',
    submenu: [
      {
        category: 'ניקוי פנים',
        items: [
          { label: 'קרם ניקוי', value: 'cleansing-cream' },
          { label: 'חלב ניקוי', value: 'cleansing-milk' },
          { label: 'ג\'ל ניקוי', value: 'cleansing-gel' },
          { label: 'קצף ניקוי', value: 'cleansing-foam' },
          { label: 'שמן ניקוי', value: 'cleansing-oil' },
          { label: 'מי פנים', value: 'toner' },
          { label: 'מסכת ניקוי', value: 'cleansing-mask' }
        ]
      },
      {
        category: 'טיפוח פנים',
        items: [
          { label: 'קרם יום', value: 'day-cream' },
          { label: 'קרם לילה', value: 'night-cream' },
          { label: 'טיפוח 24 שעות', value: '24h-care' },
          { label: 'סרום', value: 'serum' },
          { label: 'אמפולות', value: 'ampoules' }
        ]
      },
    ]
  },
  {
    id: 'makeupCollection',
    label: 'קולקציית איפור',
    submenu: [
      {
        category: 'איפור פנים',
        items: [
          { label: 'קונסילר', value: 'concealer' },
          { label: 'סומק', value: 'rouge' },
          { label: 'פודרה', value: 'powder' },
          { label: 'בסיס', value: 'foundation' }
        ]
      },
      {
        category: 'איפור עיניים',
        items: [
          { label: 'צלליות', value: 'eyeshadow' },
          { label: 'מסקרה', value: 'mascara' },
          { label: 'אייליינר', value: 'eyeliner' },
          { label: 'עיפרון גבות', value: 'eyebrow' }
        ]
      }
    ]
  },
  {
    id: 'productLines',
    label: 'קווי מוצרים',
    submenu: [
      { label: 'DÉMAQUILLANTE', value: 'demaquillante' },
      { label: 'hydratante', value: 'hydratante' },
      { label: 'sensitive', value: 'sensitive' },
      { label: 'purifiante', value: 'purifiante' },
      { label: 'ARCELMED', value: 'arcelmed' },
      { label: 'prestige', value: 'prestige' },
      { label: 'CAVIAR', value: 'caviar' }
    ]
  },
  {
    id: 'blog',
    label: 'בלוג',
    route: '/blog'
  }
];

export default navigationItems;
