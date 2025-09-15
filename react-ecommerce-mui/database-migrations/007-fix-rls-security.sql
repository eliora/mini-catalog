-- Enable RLS on both tables
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Admin users can manage all prices" ON public.prices;
DROP POLICY IF EXISTS "Verified members can read prices" ON public.prices;
DROP POLICY IF EXISTS "verified_members role full access to prices" ON public.prices;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admin can read all users" ON public.users;

-- Create proper RLS policies for prices table
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

CREATE POLICY "Verified members can read prices" ON public.prices
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_role IN ('verified_member', 'admin')
    )
  );

-- Create proper RLS policies for users table  
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can read all users" ON public.users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  );
