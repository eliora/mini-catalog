# Next.js 14 + MUI + Supabase Setup

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Service Role Key for admin operations (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Hypay Configuration (if using payment integration)
NEXT_PUBLIC_HYPAY_API_KEY=your_hypay_api_key_here
HYPAY_SECRET_KEY=your_hypay_secret_key_here
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Home page
├── lib/                # Utilities and configurations
│   ├── registry.tsx    # MUI SSR registry
│   ├── queryClient.ts  # TanStack Query client
│   └── supabase/       # Supabase clients
│       ├── client.ts   # Client-side Supabase
│       └── server.ts   # Server-side Supabase
├── providers/          # React providers
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
└── theme/              # MUI theme configuration
    └── deepTheme.ts
```

## Features Implemented

✅ Next.js 14 with App Router and TypeScript  
✅ MUI v5 with full SSR support and RTL  
✅ Supabase integration (server + client)  
✅ TanStack Query with SSR hydration  
✅ Responsive design with custom theme  
✅ Hebrew font (Heebo) with proper RTL support  

## Next Steps

1. Migrate components from the original React app
2. Set up Supabase middleware for authentication
3. Create API routes for backend logic
4. Implement context providers (Auth, Cart, Company)
5. Add component migration strategy
