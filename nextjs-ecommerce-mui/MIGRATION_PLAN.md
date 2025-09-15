# Next.js Migration Plan

## 🎯 Migration Strategy Overview

Convert the React + MUI + Supabase ecommerce app to Next.js 14+ with TypeScript, maintaining the same component structure and business logic.

## 📁 Directory Structure Mapping

### Original → Next.js Structure

```
react-ecommerce-mui/src/              →  nextjs-ecommerce-mui/src/
├── pages/                           →  app/                    # Next.js App Router
│   ├── index.js                     →  page.tsx               # Home page
│   └── site/                        →  app/site/              # Site pages
├── components/                      →  components/            # Keep structure
├── context/                         →  context/               # Keep structure  
├── hooks/                           →  hooks/                 # Keep structure
├── api/                             →  app/api/               # Next.js API routes
├── lib/                             →  lib/                   # Keep structure
├── providers/                       →  providers/             # Keep structure
├── theme/                           →  theme/                 # Keep structure
├── utils/                           →  utils/                 # Keep structure
└── hypay/                           →  hypay/                 # Keep structure
```

## 🚀 Migration Phases

### Phase 1: Core Infrastructure ✅ COMPLETED
- [x] Next.js 14 project scaffolding
- [x] MUI v5 SSR setup with RTL support
- [x] Supabase client helpers (server + client)
- [x] TanStack Query provider
- [x] Root layout with providers

### Phase 2: Route Structure & Navigation
**Target:** `/app` directory routes

#### 2.1 Main App Routes
```
/                        → app/page.tsx (Home/Landing)
/catalog                 → app/catalog/page.tsx
/orderform              → app/orderform/page.tsx
/admin                  → app/admin/page.tsx
/auth/callback          → app/auth/callback/page.tsx
```

#### 2.2 Site Routes (Standalone Pages)
```
/quickpayment           → app/quickpayment/page.tsx
/site/quickpayment      → app/site/quickpayment/page.tsx
```

#### 2.3 API Routes
```
src/api/orders.js       → app/api/orders/route.ts
src/api/prices.js       → app/api/prices/route.ts
src/api/products.js     → app/api/products/route.ts
src/api/settings.js     → app/api/settings/route.ts
```

### Phase 3: Context Providers & Authentication
**Priority:** HIGH - Required for all other components

#### 3.1 Context Migration
- `AuthContext.js` → `context/AuthContext.tsx`
- `CartContext.js` → `context/CartContext.tsx` 
- `CompanyContext.js` → `context/CompanyContext.tsx`

#### 3.2 Supabase Middleware
- Create `middleware.ts` for protected routes
- Auth state management for server components
- RLS policy integration

### Phase 4: Component Migration by Domain

#### 4.1 Authentication Components (Client Components)
**Location:** `components/auth/`
- `AuthCallback.js` → `AuthCallback.tsx`
- `AuthDialog.js` → `AuthDialog.tsx`
- `Login.js` → `Login.tsx`
- `SignInForm.js` → `SignInForm.tsx`
- `SignUpForm.js` → `SignUpForm.tsx`
- `signup/` folder → TypeScript conversion

**Component Type:** Client Components (interactive forms)

#### 4.2 Catalog Components (Mixed Server/Client)
**Location:** `components/catalog/`

**Server Components:**
- `CatalogLayout.js` → `CatalogLayout.tsx` (layout, SEO)
- `ProductDisplay.js` → `ProductDisplay.tsx` (product data)

**Client Components:**
- `CatalogClean.js` → `CatalogClean.tsx` (filters, search)
- `FilterPanel.js` → `FilterPanel.tsx` (interactive filters)
- `ProductCard.js` → `ProductCard.tsx` (add to cart)
- `ProductDetailsDialog.js` → `ProductDetailsDialog.tsx`
- All mobile/desktop filter components

#### 4.3 Admin Components (Client Components)
**Location:** `components/admin/`
- `Admin.js` → `Admin.tsx`
- `DashboardOverview.js` → `DashboardOverview.tsx`
- All admin forms, tables, and dialogs
- CSV import functionality

**Component Type:** Client Components (admin interactions)

#### 4.4 Order Form Components (Client Components)
**Location:** `components/orderform/`
- `OrderForm.js` → `OrderForm.tsx`
- `CartItemsTable.js` → `CartItemsTable.tsx`
- All cart management components

#### 4.5 Layout Components (Mixed)
**Location:** `components/layout/`

**Server Components:**
- Basic layout structure

**Client Components:**
- `JDAHeader.js` → `JDAHeader.tsx` (search, auth menu)
- Navigation components with user interactions

#### 4.6 Common Components (Mixed)
**Location:** `components/common/`
- Most can be Server Components
- Interactive ones (QuantityInput) → Client Components

### Phase 5: Hooks & Custom Logic
**Location:** `hooks/`
- Convert all custom hooks to TypeScript
- Update Supabase client usage
- TanStack Query integration updates

### Phase 6: Payment Integration (Hypay)
**Location:** `hypay/`
- Convert to TypeScript
- Next.js API route integration
- Server-side payment processing

## 📋 Component Classification Guide

### Server Components (Default)
- **Use for:** Static content, data fetching, SEO pages
- **Examples:** Product listings, company info, order history display
- **Benefits:** Better performance, SEO, reduced bundle size

### Client Components ('use client')
- **Use for:** Interactive UI, forms, state management, browser APIs
- **Examples:** Filters, cart, auth forms, admin panels
- **Required for:** useState, useEffect, event handlers, context consumers

## 🔧 TypeScript Conversion Guidelines

### 1. Props Interfaces
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  isLoading?: boolean;
}
```

### 2. API Response Types
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  // ... other fields
}

interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}
```

### 3. Supabase Integration
```typescript
import { createClient } from '@/lib/supabase/client';
// or
import { createClient } from '@/lib/supabase/server';
```

## 🎨 Styling Migration

### Keep Existing Approach
- Continue using `sx` prop for component styling
- Maintain responsive breakpoints
- Keep RTL support
- Use existing theme system

## 📱 Mobile Responsiveness

### Maintain Current Strategy
- Mobile-first design approach
- Responsive breakpoints in theme
- Mobile-specific components in `/mobile` folders
- Desktop-specific components in `/desktop` folders

## 🔄 Data Fetching Strategy

### TanStack Query Integration
- Server-side data fetching for initial page loads
- Client-side query hydration
- Infinite scroll for product catalogs
- Optimistic updates for cart operations

### Supabase RLS
- Maintain existing Row Level Security policies
- Server component data fetching
- Client component real-time subscriptions

## 🚧 Migration Order Priority

1. **HIGH PRIORITY**
   - Context providers (Auth, Cart, Company)
   - Basic routing structure
   - Supabase middleware

2. **MEDIUM PRIORITY**  
   - Catalog components (core business logic)
   - Authentication flow
   - Order form functionality

3. **LOW PRIORITY**
   - Admin panel (can work with existing setup initially)
   - Payment integration refinements
   - Advanced features

## 🧪 Testing Strategy

1. **Component by Component**
   - Test each migrated component individually
   - Verify TypeScript compilation
   - Check responsive behavior

2. **Integration Testing**
   - Auth flow end-to-end
   - Cart functionality
   - Order submission

3. **Performance Testing**
   - SSR rendering
   - Bundle size optimization
   - Mobile performance

## 📋 Next Steps

1. **Start with Phase 2:** Create route structure
2. **Implement middleware:** Supabase auth protection
3. **Migrate contexts:** Auth, Cart, Company providers
4. **Begin component migration:** Start with catalog components
5. **Iterative testing:** Test each phase thoroughly

This migration plan maintains the existing business logic while leveraging Next.js 14 features for better performance, SEO, and developer experience.
