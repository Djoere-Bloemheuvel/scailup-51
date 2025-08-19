
-- Step 4: Create indexes for optimal database performance
-- These indexes will improve query performance across the application

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_is_duplicate ON leads(is_duplicate) WHERE is_duplicate = TRUE;
CREATE INDEX IF NOT EXISTS idx_leads_enrichment_status ON leads(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_leads_contact_status ON leads(contact_status);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);
CREATE INDEX IF NOT EXISTS idx_leads_job_title ON leads(job_title);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- Indexes for contacts table
CREATE INDEX IF NOT EXISTS idx_contacts_client_id ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_date ON contacts(contact_date);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Indexes for clients table
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_admin ON clients(admin) WHERE admin = true;
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Indexes for campaign-related tables
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead_id ON campaign_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_status ON campaign_leads(status);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_added_at ON campaign_leads(added_at);

CREATE INDEX IF NOT EXISTS idx_campaign_sequences_campaign_id ON campaign_sequences(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sequences_sequence_number ON campaign_sequences(sequence_number);

-- Indexes for activity tracking
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_activity_type ON contact_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_contact_activities_created_at ON contact_activities(created_at);

-- Indexes for webhook configurations
CREATE INDEX IF NOT EXISTS idx_webhook_configs_client_id ON webhook_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_webhook_type ON webhook_configs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_is_active ON webhook_configs(is_active) WHERE is_active = true;

-- Indexes for credit and module system
CREATE INDEX IF NOT EXISTS idx_credit_balances_client_id ON credit_balances(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_expires_at ON credit_balances(expires_at);
CREATE INDEX IF NOT EXISTS idx_client_modules_client_id ON client_modules(client_id);
CREATE INDEX IF NOT EXISTS idx_client_modules_active ON client_modules(active) WHERE active = true;

-- Indexes for service management
CREATE INDEX IF NOT EXISTS idx_services_client_id ON services(client_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);

-- Indexes for user settings and profiles
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_setting_key ON user_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin) WHERE is_super_admin = true;

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_client_email_status ON leads(client_id, email, contact_status) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_client_status ON contacts(client_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_status ON campaign_leads(campaign_id, status);
