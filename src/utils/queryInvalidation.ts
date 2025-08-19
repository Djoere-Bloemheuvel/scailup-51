
import { QueryClient } from '@tanstack/react-query';

/**
 * Utility function to invalidate lead-related queries for the current client only
 * This ensures that converted leads only disappear for the client who converted them
 */
export const invalidateLeadQueries = (queryClient: QueryClient, clientId?: string) => {
  console.log('=== INVALIDATING CLIENT-SPECIFIC LEAD QUERIES ===', { clientId });
  
  if (!clientId) {
    console.warn('No client ID provided for query invalidation - skipping to prevent global invalidation');
    return;
  }
  
  // Invalidate queries that include the specific client ID in their query key
  const leadQueryKeys = [
    ['contacts', undefined, undefined, undefined, undefined, clientId], // contacts query with clientId
    ['secure-leads', undefined, clientId], // secure-leads query with clientId
    ['optimized-leads', undefined, clientId], // optimized-leads query with clientId
    ['lead-data', clientId], // lead-data query with clientId
    ['filtered-leads', clientId], // filtered-leads query with clientId
    ['available-leads', clientId] // available-leads query with clientId
  ];

  // Invalidate queries that contain the client ID
  leadQueryKeys.forEach(queryKey => {
    queryClient.invalidateQueries({ 
      queryKey,
      exact: false // Allow partial matches
    });
  });
  
  // Also invalidate queries using a predicate that checks for client-specific queries
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const hasLeadInKey = query.queryKey.some(key => 
        typeof key === 'string' && key.toLowerCase().includes('lead')
      );
      const hasClientId = query.queryKey.includes(clientId);
      return hasLeadInKey && hasClientId;
    }
  });
  
  // Immediately refetch active queries to ensure instant UI updates for this client only
  console.log('=== FORCING CLIENT-SPECIFIC REFETCH ===');
  leadQueryKeys.forEach(queryKey => {
    queryClient.refetchQueries({ 
      queryKey,
      type: 'active',
      exact: false
    });
  });
  
  // Call the global invalidate function if available (for useSecureLeads hook)
  if (typeof window !== 'undefined' && (window as any).__invalidateLeadQueries) {
    console.log('=== CALLING CLIENT-SPECIFIC LEAD INVALIDATION ===');
    (window as any).__invalidateLeadQueries();
  }
  
  console.log('=== CLIENT-SPECIFIC LEAD QUERY INVALIDATION COMPLETE ===');
};

/**
 * Optimistically remove converted leads from current client's cache only
 * This provides instant UI feedback without affecting other clients
 */
export const optimisticallyRemoveLeadFromCache = (
  queryClient: QueryClient,
  leadId: string,
  clientId?: string
) => {
  console.log('=== OPTIMISTICALLY REMOVING LEAD FOR CLIENT ===', { leadId, clientId });

  if (!clientId) {
    console.warn('No client ID provided for optimistic update - skipping to prevent global cache mutation');
    return;
  }

  // Update only client-specific lead query caches
  queryClient.setQueriesData(
    { 
      predicate: (query) => {
        const hasLeadInKey = query.queryKey.some(key => 
          typeof key === 'string' && key.toLowerCase().includes('lead')
        );
        const hasClientId = query.queryKey.includes(clientId);
        return hasLeadInKey && hasClientId;
      }
    },
    (oldData: any) => {
      if (!oldData) return oldData;
      
      // Handle different data structures
      if (oldData.leads && Array.isArray(oldData.leads)) {
        return {
          ...oldData,
          leads: oldData.leads.filter((lead: any) => lead.id !== leadId),
          total: Math.max(0, (oldData.total || oldData.leads.length) - 1)
        };
      }
      
      if (Array.isArray(oldData)) {
        return oldData.filter((lead: any) => lead.id !== leadId);
      }
      
      return oldData;
    }
  );

  console.log('=== CLIENT-SPECIFIC OPTIMISTIC REMOVAL COMPLETE ===');
};

/**
 * Rollback optimistic updates for the current client only if conversion fails
 */
export const rollbackOptimisticUpdate = (
  queryClient: QueryClient,
  leadId: string,
  clientId?: string
) => {
  console.log('=== ROLLING BACK CLIENT-SPECIFIC OPTIMISTIC UPDATE ===', { leadId, clientId });
  
  if (!clientId) {
    console.warn('No client ID provided for rollback - performing minimal invalidation');
    return;
  }
  
  // Only invalidate queries for this specific client
  invalidateLeadQueries(queryClient, clientId);
};
