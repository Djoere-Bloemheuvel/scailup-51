
// Unified lead types for the ScailUp application
// This file consolidates all lead-related types to ensure consistency

export interface LeadFilters {
  search: string;
  industry: string[];
  jobTitle: string[]; // Keep as array for multi-select
  country: string[]; // Keep as array for multi-select
  employeeCount: { min: string; max: string };
  tags: string[];
  excludeIndustry: string[];
  excludeJobTitles: string[];
  excludeTags: string[];
  excludeLists: string[];
  lists: string[];
  functionGroups: string[];
  // Legacy property names for backward compatibility
  jobTitles?: string[];
  industries?: string[];
}

export interface UnifiedLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  title: string;
  industry: string;
  country: string;
  city: string;
  company_linkedin: string;
  company_website: string;
  company_phone: string;
  company_summary: string;
  company_keywords: string;
  linkedin_url: string;
  mobile_phone: string;
  full_name: string;
  state: string;
  seniority: string;
  organization_technologies: string;
  employee_count: number;
  status: string;
  function_group: string;
  created_at: string;
  updated_at: string;
  // UI-specific properties
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  emailStatus?: string;
  tags?: string[];
  inActiveCampaign: boolean;
  employeeCount: number;
}

// New simplified filters interface for the new leads page
export interface SimpleLeadFilters {
  search: string;
  industry: string[];
  jobTitle: string;
  country: string[];
  employeeCount: { min: string; max: string };
}

// Legacy type for backward compatibility
export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  industry: string;
  country: string;
  employeeCount: number | null;
  inActiveCampaign: boolean;
  created_at: string;
  updated_at: string;
  company_website?: any;
}

// Legacy filters for backward compatibility
export interface LegacyLeadFilters {
  searchTerm: string;
  jobTitles: string[];
  excludeJobTitles: string[];
  industries: string[];
  excludeIndustries: string[];
  country: string;
  companySize: string[];
  seniority: string;
  employeeNumberMin: number | null;
  employeeNumberMax: number | null;
  tags: string[];
  excludeTags: string[];
  lists?: string[];
  excludeLists?: string[];
}

// Lead conversion types
export interface LeadConversionData {
  leadId: string;
  notes?: string;
  status?: string;
  assignedTo?: string;
}

export interface BulkLeadConversionData {
  leadIds: string[];
  notes?: string;
  status?: string;
  assignedTo?: string;
}

// Lead statistics types
export interface LeadStatistics {
  total: number;
  converted: number;
  active: number;
  new: number;
  conversionRate: number;
}

// Lead enrichment types
export interface LeadEnrichmentData {
  leadId: string;
  enrichedData: Partial<UnifiedLead>;
}

// All types are exported above for easy importing
