
// Helper function to escape special characters in query strings
export const escapeQueryString = (str: string) => {
  return str.replace(/[&()]/g, '\\$&');
};

// Build search conditions for filtering
export const buildSearchConditions = (searchTerm: string) => {
  const escapedSearchTerm = escapeQueryString(searchTerm.trim());
  return [
    `first_name.ilike.%${escapedSearchTerm}%`,
    `last_name.ilike.%${escapedSearchTerm}%`,
    `company_name.ilike.%${escapedSearchTerm}%`,
    `title.ilike.%${escapedSearchTerm}%`,
    `email.ilike.%${escapedSearchTerm}%`
  ];
};

// Build job title conditions for filtering
export const buildJobTitleConditions = (jobTitles: string[]) => {
  return jobTitles.map(title => {
    const escapedTitle = escapeQueryString(title);
    return `title.ilike.%${escapedTitle}%`;
  }).join(',');
};

// Build company size conditions for filtering
export const buildCompanySizeConditions = (companySize: string[]) => {
  const companySizeConditions: string[] = [];
  
  companySize.forEach(sizeCategory => {
    switch (sizeCategory) {
      case 'unknown':
        companySizeConditions.push('employee_count.is.null');
        break;
      case '1_10':
        companySizeConditions.push('employee_count.lte.10');
        break;
      case '11_50':
        companySizeConditions.push('and(employee_count.gte.11,employee_count.lte.50)');
        break;
      case '51_200':
        companySizeConditions.push('and(employee_count.gte.51,employee_count.lte.200)');
        break;
      case '201_500':
        companySizeConditions.push('and(employee_count.gte.201,employee_count.lte.500)');
        break;
      case '501_1000':
        companySizeConditions.push('and(employee_count.gte.501,employee_count.lte.1000)');
        break;
      case '1001_5000':
        companySizeConditions.push('and(employee_count.gte.1001,employee_count.lte.5000)');
        break;
      case '5000_plus':
        companySizeConditions.push('employee_count.gte.5000');
        break;
    }
  });
  
  return companySizeConditions;
};
