
-- Create index on company_domain for better performance
CREATE INDEX IF NOT EXISTS idx_clients_company_domain ON public.clients(company_domain);

-- Create index on client_users for user lookup performance
CREATE INDEX IF NOT EXISTS idx_client_users_user_id ON public.client_users(user_id);

-- Add trigger to update clients.updated_at when modified
CREATE OR REPLACE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
