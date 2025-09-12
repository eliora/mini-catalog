# 🔒 MANUAL RLS SETUP INSTRUCTIONS

Since the Supabase client doesn't support direct SQL execution, you need to apply these RLS policies manually via the Supabase dashboard.

## 🚨 CRITICAL SECURITY ISSUE DETECTED

**Anonymous users can currently access pricing data!** This must be fixed immediately.

## 📋 MANUAL STEPS TO APPLY

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard/project/erpufcvhxxulxmldikfp
- Navigate to: **Database** → **Tables** → **prices**

### 2. Enable RLS on prices table
```sql
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
```

### 3. Enable RLS on users table  
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### 4. Drop existing policies (if any)
```sql
DROP POLICY IF EXISTS "Admin users can manage all prices" ON public.prices;
DROP POLICY IF EXISTS "Verified members can read prices" ON public.prices;
DROP POLICY IF EXISTS "verified_members role full access to prices" ON public.prices;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can read all users" ON public.users;
```

### 5. Create RLS policies for prices table

#### Admin Full Access Policy
```sql
CREATE POLICY "Admin full access to prices" ON public.prices
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  );
```

#### Verified Members Read Access Policy
```sql
CREATE POLICY "Verified members can read prices" ON public.prices
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_role IN ('verified_member', 'admin')
    )
  );
```

### 6. Create RLS policies for users table

#### Users Can Read Own Profile
```sql
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);
```

#### Users Can Update Own Profile
```sql
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

#### Admin Can Read All Users
```sql
CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  );
```

## 🧪 TESTING AFTER SETUP

After applying the policies, test with this command:

```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const anonSupabase = createClient(
  process.env.REACT_APP_SUPABASE_URL, 
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

anonSupabase.from('prices').select('product_ref').limit(1).then(result => {
  if (result.error) {
    console.log('✅ SUCCESS: Anonymous access blocked!');
    console.log('Error:', result.error.message);
  } else {
    console.log('❌ FAILED: Anonymous access still works');
  }
});
"
```

## ✅ EXPECTED RESULT

After applying RLS policies:
- ✅ Anonymous users should be **BLOCKED** from accessing prices
- ✅ Admin users should have **FULL ACCESS** to prices  
- ✅ Verified members should have **READ ACCESS** to prices
- ✅ Standard users should be **BLOCKED** from accessing prices

## 🔧 CURRENT STATUS

**Before RLS Fix:**
- ❌ Anonymous users can access prices (SECURITY RISK)
- ✅ Service key has full access
- ✅ Database has 10+ price records
- ✅ Users table has admin/standard roles

**After RLS Fix:**
- ✅ Anonymous access blocked
- ✅ Role-based access working
- ✅ Security restored
