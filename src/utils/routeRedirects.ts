
// Route redirects for unified lead management
// All legacy lead routes should redirect to /leads

export const LEGACY_LEAD_ROUTES = [
  '/optimized-database', 
  '/lead-database',
  '/lead-manager',
  '/leads-dashboard'
];

export const UNIFIED_LEAD_ROUTE = '/leads';

export const shouldRedirectToDatabase = (pathname: string): boolean => {
  return LEGACY_LEAD_ROUTES.includes(pathname);
};

export const getCanonicalLeadRoute = (): string => {
  return UNIFIED_LEAD_ROUTE;
};

// SEO meta helper for the unified leads page
export const getDatabasePageMeta = () => ({
  title: 'Lead Database | ScailUp',
  description: 'Comprehensive lead management and conversion platform for B2B sales teams.',
  canonical: `${window.location.origin}/leads`
});
