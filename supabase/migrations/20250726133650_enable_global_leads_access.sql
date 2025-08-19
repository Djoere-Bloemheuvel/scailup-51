-- Enable global read access to leads table for all authenticated users
-- This makes the leads table a shared, central database for exploration
-- Compatible with /database page and frontend logic

-- First, drop any existing SELECT policies on leads table
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads from their client" ON public.leads;
DROP POLICY IF EXISTS "Users can view their client leads" ON public.leads;
DROP POLICY IF EXISTS "All authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Users with client access can view leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their campaign leads" ON public.leads;
DROP POLICY IF EXISTS "Allow read access to all logged-in users" ON public.leads;
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;

-- Create the new global read policy for all authenticated users
CREATE POLICY "Allow read access to all logged-in users"
  ON public.leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Ensure the table has RLS enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Note: INSERT, UPDATE, DELETE policies are preserved and not modified
-- This migration only affects SELECT access to make leads globally readable

-- Add comment for documentation
COMMENT ON POLICY "Allow read access to all logged-in users" ON public.leads IS 
'Allows all authenticated users to view leads regardless of ownership. This enables the /database page to serve as a shared lead explorer for all users.';
