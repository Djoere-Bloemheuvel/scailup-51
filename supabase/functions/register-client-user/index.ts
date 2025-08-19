
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RegisterClientUserRequest {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  phone_number?: string;
}

interface ApiResponse {
  success: boolean;
  error?: string;
}

// Enhanced validation functions
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,20}$/;
  return phoneRegex.test(phone);
};

const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{1,50}$/;
  return nameRegex.test(name);
};

const isValidCompanyName = (name: string): boolean => {
  const companyRegex = /^[a-zA-ZÀ-ÿ0-9\s\-\.\,\&\(\)]{1,100}$/;
  return companyRegex.test(name);
};

// Enhanced sanitization
const sanitizeString = (input: string): string => {
  return input.trim()
    .replace(/[<>]/g, '')
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 1000); // Prevent excessively long strings
};

const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d\+\-\s\(\)]/g, '').trim();
};

const extractDomain = (email: string): string => {
  return email.split('@')[1].toLowerCase();
};

const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with 0, replace with +31 for Netherlands
  if (cleaned.startsWith('0')) {
    return '+31' + cleaned.substring(1);
  }
  
  // If it doesn't start with +, assume Netherlands
  if (!cleaned.startsWith('+')) {
    return '+31' + cleaned;
  }
  
  return cleaned;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Initialize Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse and validate request body
    let body: RegisterClientUserRequest;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Enhanced input validation
    if (!body.user_id || !isValidUUID(body.user_id)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid user_id format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body.email || !isValidEmail(body.email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body.first_name || !isValidName(body.first_name)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid first_name format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body.last_name || !isValidName(body.last_name)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid last_name format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!body.company_name || !isValidCompanyName(body.company_name)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid company_name format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (body.phone_number && !isValidPhone(body.phone_number)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone_number format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize inputs without company website
    const sanitizedData = {
      user_id: body.user_id,
      email: body.email.toLowerCase().trim(),
      first_name: sanitizeString(body.first_name),
      last_name: sanitizeString(body.last_name),
      company_name: sanitizeString(body.company_name),
      phone_number: body.phone_number ? normalizePhone(sanitizePhone(body.phone_number)) : undefined
    };

    const domain = extractDomain(sanitizedData.email);

    console.log(`Processing registration for user ${sanitizedData.user_id} with email ${sanitizedData.email}, phone ${sanitizedData.phone_number}, and domain ${domain}`);

    // Check if user is already registered in client_users (idempotent check)
    const { data: existingClientUser, error: clientUserCheckError } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', sanitizedData.user_id)
      .maybeSingle();

    if (clientUserCheckError) {
      console.error('Error checking existing client user:', clientUserCheckError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error during client user check' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (existingClientUser) {
      console.log(`User ${sanitizedData.user_id} is already registered to client ${existingClientUser.client_id}`);
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if client exists for this domain
    const { data: existingClient, error: clientCheckError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_domain', domain)
      .maybeSingle();

    if (clientCheckError) {
      console.error('Error checking existing client:', clientCheckError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error during client check' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let clientId: string;

    if (existingClient) {
      // Use existing client
      clientId = existingClient.id;
      console.log(`Using existing client ${clientId} for domain ${domain}`);
    } else {
      // Create new client without company website
      console.log(`Creating new client for domain ${domain}`);
      
      const clientData = {
        company_name: sanitizedData.company_name,
        company_email: sanitizedData.email,
        company_domain: domain,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newClient, error: clientCreateError } = await supabase
        .from('clients')
        .insert(clientData)
        .select('id')
        .single();

      if (clientCreateError) {
        console.error('Error creating client:', clientCreateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create client' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      clientId = newClient.id;
    }

    // Insert user into client_users table as admin
    console.log(`Inserting user ${sanitizedData.user_id} into client_users as admin for client ${clientId}`);
    
    const { error: clientUserInsertError } = await supabase
      .from('client_users')
      .insert({
        user_id: sanitizedData.user_id,
        client_id: clientId,
        role: 'admin',
        created_at: new Date().toISOString()
      });

    if (clientUserInsertError) {
      console.error('Error inserting client user:', clientUserInsertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create client user relationship' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log successful registration
    console.log(`Successfully registered user ${sanitizedData.user_id} to client ${clientId} with phone ${sanitizedData.phone_number}`);

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in register-client-user function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
