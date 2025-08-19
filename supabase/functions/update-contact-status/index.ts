
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateContactStatusRequest {
  contact_id: string;
  campaign_id: string;
  client_id?: string; // Optional for additional security validation
}

interface BatchUpdateContactStatusRequest {
  updates: UpdateContactStatusRequest[];
}

serve(async (req) => {
  console.log('🚀 Update contact status function called!');
  console.log('Request method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('⚡ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestBody = await req.text();
    console.log('📥 Raw request body:', requestBody);

    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body as JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📝 Parsed request body:', JSON.stringify(parsedBody, null, 2));

    // Check if this is a batch update or single update
    const isBatchUpdate = parsedBody.updates && Array.isArray(parsedBody.updates);
    
    if (isBatchUpdate) {
      // Handle batch update
      const batchRequest: BatchUpdateContactStatusRequest = parsedBody;
      
      if (!batchRequest.updates || batchRequest.updates.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No updates provided' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`🔄 Processing batch update for ${batchRequest.updates.length} contacts`);
      
      const results = [];
      let successfulUpdates = 0;
      let failedUpdates = 0;

      for (const update of batchRequest.updates) {
        const result = await updateSingleContactStatus(supabase, update);
        results.push(result);
        
        if (result.success && result.updated) {
          successfulUpdates++;
        } else if (!result.success) {
          failedUpdates++;
        }
      }

      const batchSummary = {
        success: failedUpdates === 0,
        totalProcessed: batchRequest.updates.length,
        successfulUpdates,
        failedUpdates,
        results
      };

      console.log('✅ Batch update completed:', batchSummary);
      
      return new Response(
        JSON.stringify(batchSummary),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Handle single update
      const singleRequest: UpdateContactStatusRequest = parsedBody;
      
      if (!singleRequest.contact_id || !singleRequest.campaign_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: contact_id, campaign_id' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`🔄 Processing single update for contact ${singleRequest.contact_id} in campaign ${singleRequest.campaign_id}`);
      
      const result = await updateSingleContactStatus(supabase, singleRequest);
      
      console.log('✅ Single update completed:', result);
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('❌ Error in update-contact-status function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function updateSingleContactStatus(supabase: any, request: UpdateContactStatusRequest) {
  const { contact_id, campaign_id, client_id } = request;

  try {
    console.log(`📋 Updating contact ${contact_id} in campaign ${campaign_id} to 'Actief'`);

    // First, verify the contact exists with status 'Gepland'
    let query = supabase
      .from('campaign_contacts')
      .select('status, contact_id, campaign_id')
      .eq('contact_id', contact_id)
      .eq('campaign_id', campaign_id)
      .eq('status', 'Gepland');

    const { data: existingRecord, error: fetchError } = await query.single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        console.log(`ℹ️ No record found with status 'Gepland' for contact ${contact_id} in campaign ${campaign_id}`);
        return {
          success: true,
          message: 'Contact not found with status Gepland - ignoring',
          updated: false
        };
      }
      
      console.error('❌ Error fetching contact record:', fetchError);
      return {
        success: false,
        message: 'Failed to fetch contact record'
      };
    }

    if (!existingRecord) {
      console.log(`ℹ️ No record found with status 'Gepland' for contact ${contact_id} in campaign ${campaign_id}`);
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
      console.error('❌ Error updating contact status:', updateError);
      return {
        success: false,
        message: 'Failed to update contact status'
      };
    }

    console.log(`✅ Successfully updated contact ${contact_id} in campaign ${campaign_id} to 'Actief'`);
    return {
      success: true,
      message: 'Contact status updated successfully',
      updated: true
    };

  } catch (error) {
    console.error('❌ Unexpected error in updateSingleContactStatus:', error);
    return {
      success: false,
      message: 'Unexpected error occurred'
    };
  }
}
