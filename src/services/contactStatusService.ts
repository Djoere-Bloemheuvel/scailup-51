
import { supabase } from '@/integrations/supabase/client';

export interface UpdateContactStatusParams {
  contact_id: string;
  campaign_id: string;
}

export interface UpdateContactStatusResult {
  success: boolean;
  message: string;
  updated?: boolean;
}

export interface BatchUpdateContactStatusParams {
  updates: UpdateContactStatusParams[];
}

export interface BatchUpdateContactStatusResult {
  success: boolean;
  totalProcessed: number;
  successfulUpdates: number;
  failedUpdates: number;
  results: UpdateContactStatusResult[];
}

/**
 * Updates a contact's status from 'Gepland' to 'Actief' in the campaign_contacts table
 */
export async function updateContactStatusToActive(
  params: UpdateContactStatusParams
): Promise<UpdateContactStatusResult> {
  const { contact_id, campaign_id } = params;

  console.log(`Updating contact status to 'Actief' for contact ${contact_id} in campaign ${campaign_id}`);

  try {
    // First, verify the contact exists with status 'Gepland'
    const { data: existingRecord, error: fetchError } = await supabase
      .from('campaign_contacts')
      .select('status, contact_id, campaign_id')
      .eq('contact_id', contact_id)
      .eq('campaign_id', campaign_id)
      .eq('status', 'Gepland')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log(`No record found with status 'Gepland' for contact ${contact_id} in campaign ${campaign_id}`);
        return {
          success: true,
          message: 'Contact not found with status Gepland - ignoring',
          updated: false
        };
      }
      
      console.error('Error fetching contact record:', fetchError);
      return {
        success: false,
        message: 'Failed to fetch contact record'
      };
    }

    if (!existingRecord) {
      console.log(`No record found with status 'Gepland' for contact ${contact_id} in campaign ${campaign_id}`);
      return {
        success: true,
        message: 'Contact not found with status Gepland - ignoring',
        updated: false
      };
    }

    // Update the status to 'Actief'
    const { error: updateError } = await supabase
      .from('campaign_contacts')
      .update({ 
        status: 'Actief',
        updated_at: new Date().toISOString()
      })
      .eq('contact_id', contact_id)
      .eq('campaign_id', campaign_id)
      .eq('status', 'Gepland');

    if (updateError) {
      console.error('Error updating contact status:', updateError);
      return {
        success: false,
        message: 'Failed to update contact status'
      };
    }

    console.log(`Successfully updated contact ${contact_id} in campaign ${campaign_id} to 'Actief'`);
    return {
      success: true,
      message: 'Contact status updated successfully',
      updated: true
    };

  } catch (error) {
    console.error('Unexpected error in updateContactStatusToActive:', error);
    return {
      success: false,
      message: 'Unexpected error occurred'
    };
  }
}

/**
 * Batch update multiple contacts' status from 'Gepland' to 'Actief'
 */
export async function batchUpdateContactStatusToActive(
  params: BatchUpdateContactStatusParams
): Promise<BatchUpdateContactStatusResult> {
  const { updates } = params;

  console.log(`Starting batch update for ${updates.length} contacts`);

  const results: UpdateContactStatusResult[] = [];
  let successfulUpdates = 0;
  let failedUpdates = 0;

  // Process updates in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(update => updateContactStatusToActive(update));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Update counters
    batchResults.forEach(result => {
      if (result.success && result.updated) {
        successfulUpdates++;
      } else if (!result.success) {
        failedUpdates++;
      }
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < updates.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const summary: BatchUpdateContactStatusResult = {
    success: failedUpdates === 0,
    totalProcessed: updates.length,
    successfulUpdates,
    failedUpdates,
    results
  };

  console.log('Batch update summary:', summary);
  return summary;
}

/**
 * Helper function to get current user's client ID for security validation
 */
export async function getCurrentUserClientId(): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_current_user_client_id');
  
  if (error) {
    console.error('Error getting current user client ID:', error);
    return null;
  }
  
  return data;
}
