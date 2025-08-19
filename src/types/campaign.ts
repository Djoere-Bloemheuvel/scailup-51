
export interface AudienceFilter {
  function_groups?: string[];
  industries?: string[];
  countries?: string[];
  company_size?: string[];
  min_employees?: number;
  max_employees?: number;
}

export interface CampaignData {
  id: string;
  name: string;
  audience_filter?: AudienceFilter | null;
  [key: string]: any;
}
