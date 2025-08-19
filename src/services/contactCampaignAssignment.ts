import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContactAssignmentResult {
  contactId: string;
  campaignId?: string;
  success: boolean;
  error?: string;
  message?: string;
}

export interface BatchAssignmentSummary {
  totalProcessed: number;
  successfulAssignments: number;
  failedAssignments: number;
  noEligibleCampaigns: number;
  results: ContactAssignmentResult[];
}

/**
 * Assigns a single contact to an eligible campaign using direct database queries
 */
export async function assignContactToCampaign(contactId: string): Promise<ContactAssignmentResult> {
  console.log(`Processing contact assignment for contact: ${contactId}`);
  
  try {
    // First, get the contact's client_id
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('client_id')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      console.error('Error fetching contact:', contactError);
      return {
        contactId,
        success: false,
        error: 'CONTACT_NOT_FOUND',
        message: 'Contact not found'
      };
    }

    // Find the next eligible campaign for this contact
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, created_at')
      .eq('client_id', contact.client_id)
      .eq('auto_assign_enabled', true)
      .order('created_at', { ascending: true });

    if (campaignError) {
      console.error('Error fetching campaigns:', campaignError);
      return {
        contactId,
        success: false,
        error: 'CAMPAIGN_FETCH_ERROR',
        message: campaignError.message
      };
    }

    if (!campaigns || campaigns.length === 0) {
      console.log(`No eligible campaigns found for contact: ${contactId}`);
      return {
        contactId,
        success: true,
        message: 'No eligible campaigns found'
      };
    }

    // Find the first campaign that hasn't been completed by this contact
    let eligibleCampaign = null;
    for (const campaign of campaigns) {
      const { data: existingAssignment, error: assignmentError } = await supabase
        .from('campaign_contacts')
        .select('status')
        .eq('contact_id', contactId)
        .eq('campaign_id', campaign.id)
        .eq('status', 'Afgerond')
        .single();

      if (assignmentError && assignmentError.code !== 'PGRST116') {
        console.error('Error checking campaign assignment:', assignmentError);
        continue;
      }

      // If no completed assignment found, this campaign is eligible
      if (!existingAssignment) {
        eligibleCampaign = campaign;
        break;
      }
    }

    if (!eligibleCampaign) {
      console.log(`No eligible campaign found for contact: ${contactId}`);
      return {
        contactId,
        success: true,
        message: 'No eligible campaign found'
      };
    }

    console.log(`Found eligible campaign ${eligibleCampaign.id} for contact ${contactId}`);

    // Add contact to the campaign using the RPC function
    const { data: assignmentResult, error: assignmentError } = await supabase
      .rpc('add_contact_to_campaign', {
        p_contact_id: contactId,
        p_campaign_id: eligibleCampaign.id
      });

    if (assignmentError) {
      console.error('Error adding contact to campaign:', assignmentError);
      return {
        contactId,
        campaignId: eligibleCampaign.id,
        success: false,
        error: 'ASSIGNMENT_ERROR',
        message: assignmentError.message
      };
    }

    // Validate the assignment result
    if (!assignmentResult || typeof assignmentResult !== 'object' || Array.isArray(assignmentResult)) {
      console.error('Invalid assignment result format:', assignmentResult);
      return {
        contactId,
        campaignId: eligibleCampaign.id,
        success: false,
        error: 'INVALID_RESPONSE',
        message: 'Invalid response format from assignment function'
      };
    }

    // Type-safe access to the result properties
    const resultObj = assignmentResult as Record<string, any>;
    const success = resultObj.success === true;
    const errorCode = typeof resultObj.error === 'string' ? resultObj.error : undefined;
    const message = typeof resultObj.message === 'string' ? resultObj.message : undefined;

    if (!success) {
      console.error('Assignment function returned error:', resultObj);
      return {
        contactId,
        campaignId: eligibleCampaign.id,
        success: false,
        error: errorCode || 'ASSIGNMENT_FAILED',
        message: message || 'Failed to assign contact to campaign'
      };
    }

    // Update contact status to 'Gepland'
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ status: 'Gepland', updated_at: new Date().toISOString() })
      .eq('id', contactId);

    if (updateError) {
      console.error('Error updating contact status:', updateError);
      // Assignment succeeded but status update failed - log warning
      console.warn(`Contact ${contactId} assigned to campaign ${eligibleCampaign.id} but status update failed`);
    }

    console.log(`Successfully assigned contact ${contactId} to campaign ${eligibleCampaign.id}`);
    return {
      contactId,
      campaignId: eligibleCampaign.id,
      success: true,
      message: 'Contact successfully assigned to campaign'
    };

  } catch (error) {
    console.error('Unexpected error in contact assignment:', error);
    return {
      contactId,
      success: false,
      error: 'UNEXPECTED_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Processes multiple contacts for campaign assignment in batch
 */
export async function batchAssignContactsToCampaigns(contactIds: string[]): Promise<BatchAssignmentSummary> {
  console.log(`Starting batch assignment for ${contactIds.length} contacts`);
  
  const results: ContactAssignmentResult[] = [];
  let successfulAssignments = 0;
  let failedAssignments = 0;
  let noEligibleCampaigns = 0;

  // Process contacts in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < contactIds.length; i += batchSize) {
    const batch = contactIds.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(contactId => assignContactToCampaign(contactId));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Update counters
    batchResults.forEach(result => {
      if (result.success) {
        if (result.campaignId) {
          successfulAssignments++;
        } else {
          noEligibleCampaigns++;
        }
      } else {
        failedAssignments++;
      }
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < contactIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const summary: BatchAssignmentSummary = {
    totalProcessed: contactIds.length,
    successfulAssignments,
    failedAssignments,
    noEligibleCampaigns,
    results
  };

  console.log('Batch assignment summary:', summary);
  return summary;
}

/**
 * Processes Ready contacts for campaign assignment
 */
export async function processReadyContactsForAssignment(clientId?: string): Promise<BatchAssignmentSummary> {
  console.log('Processing Ready contacts for campaign assignment');
  
  try {
    // Get current user's client ID if not provided
    const effectiveClientId = clientId || await getCurrentUserClientId();
    
    if (!effectiveClientId) {
      throw new Error('No client context available');
    }

    // Get all Ready contacts for this client
    const { data: readyContacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('client_id', effectiveClientId)
      .eq('status', 'Ready')
      .not('email', 'is', null)
      .neq('email', '');

    if (fetchError) {
      console.error('Error fetching Ready contacts:', fetchError);
      throw fetchError;
    }

    if (!readyContacts || readyContacts.length === 0) {
      console.log('No Ready contacts found for assignment');
      return {
        totalProcessed: 0,
        successfulAssignments: 0,
        failedAssignments: 0,
        noEligibleCampaigns: 0,
        results: []
      };
    }

    const contactIds = readyContacts.map(contact => contact.id);
    console.log(`Found ${contactIds.length} Ready contacts for assignment`);

    return await batchAssignContactsToCampaigns(contactIds);

  } catch (error) {
    console.error('Error processing Ready contacts:', error);
    throw error;
  }
}

/**
 * Helper function to get current user's client ID
 */
async function getCurrentUserClientId(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_current_user_client_id');
  
  if (error) {
    console.error('Error getting current user client ID:', error);
    return null;
  }
  
  return data;
}

/**
 * Background task wrapper that can be called after contact creation/import
 */
export async function runContactAssignmentBackgroundTask(contactIds?: string[]): Promise<void> {
  console.log('Starting contact assignment background task');
  
  try {
    let summary: BatchAssignmentSummary;
    
    if (contactIds && contactIds.length > 0) {
      // Process specific contacts
      summary = await batchAssignContactsToCampaigns(contactIds);
    } else {
      // Process all Ready contacts
      summary = await processReadyContactsForAssignment();
    }
    
    // Log summary for debugging
    console.log('Contact assignment task completed:', {
      totalProcessed: summary.totalProcessed,
      successfulAssignments: summary.successfulAssignments,
      failedAssignments: summary.failedAssignments,
      noEligibleCampaigns: summary.noEligibleCampaigns
    });
    
    // Show toast notification
    if (summary.totalProcessed > 0) {
      if (summary.successfulAssignments > 0) {
        toast.success(`${summary.successfulAssignments} contact(s) automatically assigned to campaigns`);
      }
      if (summary.failedAssignments > 0) {
        toast.warning(`${summary.failedAssignments} contact(s) could not be assigned to campaigns`);
      }
      if (summary.noEligibleCampaigns > 0) {
        toast.info(`${summary.noEligibleCampaigns} contact(s) had no eligible campaigns`);
      }
    } else {
      toast.info('No Ready contacts found for assignment');
    }
    
  } catch (error) {
    console.error('Contact assignment background task failed:', error);
    toast.error('Failed to process contact assignments');
  }
}
