
-- Add admin column to clients table
ALTER TABLE public.clients 
ADD COLUMN admin BOOLEAN NOT NULL DEFAULT false;

-- Update the existing admin client record to have admin privileges
UPDATE public.clients 
SET admin = true 
WHERE email = 'djoere@scailup.io';
