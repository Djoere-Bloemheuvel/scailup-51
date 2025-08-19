
-- Phase 1: Database Security Implementation

-- Step 1: Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Step 2: Create clients table (if it doesn't exist) with proper structure
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    is_active BOOLEAN DEFAULT true,
    plan TEXT,
    admin BOOLEAN DEFAULT false,
    lead_engine BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id),
    UNIQUE(email)
);

-- Step 3: Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = _user_id AND role = _role
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_client_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(admin, false) FROM public.clients WHERE user_id = _user_id;
$$;

-- Step 4: Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles"
    ON public.user_roles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage all roles"
    ON public.user_roles
    FOR ALL
    USING (public.has_role(auth.uid(), 'super_admin'));

-- Step 6: Create RLS policies for clients table
CREATE POLICY "Users can view their own client record"
    ON public.clients
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all clients"
    ON public.clients
    FOR SELECT
    USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view all clients"
    ON public.clients
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own client record"
    ON public.clients
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all clients"
    ON public.clients
    FOR ALL
    USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage clients"
    ON public.clients
    FOR INSERT, UPDATE, DELETE
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Step 7: Create RLS policies for leads table
CREATE POLICY "Users can view leads through their client"
    ON public.leads
    FOR SELECT
    USING (
        public.get_user_client_id() IS NOT NULL
        AND (
            public.has_role(auth.uid(), 'super_admin')
            OR public.has_role(auth.uid(), 'admin')
            OR public.is_client_admin(auth.uid())
        )
    );

CREATE POLICY "Super admins can manage all leads"
    ON public.leads
    FOR ALL
    USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage leads"
    ON public.leads
    FOR INSERT, UPDATE, DELETE
    USING (
        public.has_role(auth.uid(), 'admin') 
        OR public.has_role(auth.uid(), 'super_admin')
        OR public.is_client_admin(auth.uid())
    );

-- Step 8: Create trigger to automatically create client record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Create client record
    INSERT INTO public.clients (user_id, email, first_name, last_name, company_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name',
        NEW.raw_user_meta_data ->> 'company_name'
    );
    
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Create super admin user (replace with actual admin email)
-- Note: This will need to be run after the user signs up
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'super_admin'::app_role 
-- FROM auth.users 
-- WHERE email = 'djoere@scailup.io'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Step 10: Create updated timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
