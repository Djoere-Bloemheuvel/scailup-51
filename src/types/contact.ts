
// Updated contact types matching the Supabase schema and contacts_with_lead_data view
export interface ContactData {
  id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  // Personal information
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  mobile_phone: string;
  linkedin_url: string;
  // Job information  
  title: string;
  job_title?: string; // Alias for title
  seniority: string;
  function_group: string;
  // Company information
  company_name: string;
  industry: string;
  company_linkedin: string;
  company_website: string;
  company_phone: string;
  company_summary: string;
  company_keywords: string[];
  organization_technologies: string[];
  // Location information
  country: string;
  state: string;
  city: string;
  // Company metrics
  employee_count: number;
  // Contact management
  contact_summary: string;
  contact_date: string;
  nurture: boolean;
  nurture_reason: string | null;
  do_not_contact: boolean;
  matchscore: number | null;
  status: string;
  // Lead reference (from contacts_with_lead_data view)
  lead_id?: string;
  // Campaign-specific flags for UI state
  isInCampaign?: boolean;
  isCompleted?: boolean;
}

export interface ContactFilters {
  search: string;
  functionGroups: string[];
  titles: string[];
}

export type SortOption = 'recent' | 'alphabetical' | 'company' | 'title';

export interface UseContactsOptions {
  filters: ContactFilters;
  page: number;
  pageSize: number;
  sortBy?: SortOption;
}
