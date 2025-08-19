
import { supabase } from '@/integrations/supabase/client';

export interface ContactFilterParams {
  clientId: string;
  search?: string;
  functionGroups?: string[];
  industries?: string[];
  countries?: string[];
  minEmployees?: number;
  maxEmployees?: number;
  statusFilter?: string;
  requireValidEmail?: boolean;
  includeNullEmployees?: boolean;
}

export const buildContactQuery = (params: ContactFilterParams) => {
  const {
    clientId,
    search,
    functionGroups,
    industries,
    countries,
    minEmployees,
    maxEmployees,
    statusFilter = 'Ready', // Fixed: Changed from 'ready' to 'Ready' (title case)
    requireValidEmail = true
  } = params;

  console.debug('Building contact query with params:', params);

  // Use the contacts table directly instead of the view for better reliability
  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('client_id', clientId);

  // Apply status filter (default to 'Ready' for audience targeting)
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  // Apply email validation (required for audience targeting)
  if (requireValidEmail) {
    query = query.not('email', 'is', null).neq('email', '');
  }

  // Apply search filter across multiple fields
  if (search && search.trim()) {
    const searchTerm = search.replace(/'/g, "''"); // Escape single quotes
    query = query.or(`full_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
  }

  // Apply function groups filter
  if (functionGroups && functionGroups.length > 0) {
    query = query.in('function_group', functionGroups);
  }

  // Apply industries filter
  if (industries && industries.length > 0) {
    query = query.in('industry', industries);
  }

  // Apply countries filter
  if (countries && countries.length > 0) {
    query = query.in('country', countries);
  }

  // Apply employee count filters
  if (minEmployees !== undefined && minEmployees !== null) {
    query = query.gte('employee_count', minEmployees);
  }

  if (maxEmployees !== undefined && maxEmployees !== null) {
    query = query.lte('employee_count', maxEmployees);
  }

  return query;
};

export const fetchContactCount = async (params: ContactFilterParams): Promise<number> => {
  try {
    // Validate client ID is provided
    if (!params.clientId) {
      throw new Error('Client ID is required for contact filtering');
    }

    console.debug('Fetching contact count with client-specific filtering:', {
      clientId: params.clientId,
      statusFilter: params.statusFilter,
      requireValidEmail: params.requireValidEmail,
      filters: {
        functionGroups: params.functionGroups?.length || 0,
        industries: params.industries?.length || 0,
        countries: params.countries?.length || 0,
        employeeRange: `${params.minEmployees || 'any'}-${params.maxEmployees || 'any'}`
      }
    });
    
    const query = buildContactQuery(params);
    
    // Only get the count, not the actual data - use abortSignal for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const { count, error } = await query
      .limit(1)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error('Contact count query error:', error);
      throw new Error(`Contact count query failed: ${error.message}`);
    }

    const finalCount = count || 0;
    console.debug('Contact count query success:', {
      count: finalCount,
      clientId: params.clientId,
      table: 'contacts',
      filters: {
        functionGroups: params.functionGroups?.length || 0,
        industries: params.industries?.length || 0,
        countries: params.countries?.length || 0,
        employeeRange: `${params.minEmployees || 'any'}-${params.maxEmployees || 'any'}`
      }
    });

    return finalCount;
  } catch (error) {
    console.error('fetchContactCount error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again with fewer filters.');
      }
      throw error;
    }
    
    throw new Error('Failed to fetch contact count. Please try again.');
  }
};

export const fetchContactIds = async (params: ContactFilterParams): Promise<string[]> => {
  try {
    // Validate client ID is provided
    if (!params.clientId) {
      throw new Error('Client ID is required for contact filtering');
    }

    console.debug('Fetching contact IDs with client-specific filtering:', {
      clientId: params.clientId,
      statusFilter: params.statusFilter,
      requireValidEmail: params.requireValidEmail
    });
    
    const query = buildContactQuery(params);
    
    // Only select the ID field for performance with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for ID fetching
    
    const { data, error } = await query
      .select('id')
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error('Contact IDs query error:', error);
      throw new Error(`Contact IDs query failed: ${error.message}`);
    }

    const contactIds = (data || []).map(item => item.id);
    console.debug('Contact IDs query success:', {
      count: contactIds.length,
      clientId: params.clientId,
      table: 'contacts',
      sample: contactIds.slice(0, 3)
    });

    return contactIds;
  } catch (error) {
    console.error('fetchContactIds error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try with fewer filters.');
      }
      throw error;
    }
    
    throw new Error('Failed to fetch contact IDs. Please try again.');
  }
};
