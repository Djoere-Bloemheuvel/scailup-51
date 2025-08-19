
// Type definitions for RPC function responses
export interface ConvertLeadToContactResponse {
  success: boolean;
  error?: string;
  message?: string;
  contact?: any;
  client_id?: string;
  user_id?: string;
}

export interface BulkConvertResult {
  convertedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface AddContactToCampaignResponse {
  success: boolean;
  error?: string;
  message?: string;
  current_status?: string;
}

export interface GetNextCampaignResponse {
  campaign_id: string | null;
}
