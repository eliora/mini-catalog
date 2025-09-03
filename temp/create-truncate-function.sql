-- Create a truncate function for the products table
-- Run this in Supabase SQL Editor if you want faster table clearing

CREATE OR REPLACE FUNCTION truncate_products_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Truncate the products table (much faster than DELETE)
  TRUNCATE TABLE public.products RESTART IDENTITY;

  -- Reset any sequences if needed
  -- ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION truncate_products_table() TO authenticated;
GRANT EXECUTE ON FUNCTION truncate_products_table() TO anon;
