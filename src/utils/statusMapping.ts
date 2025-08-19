
// Status mapping between database and frontend
export const STATUS_MAPPING = {
  // Database -> Frontend
  draft: 'Concept',
  running: 'Actief',
  paused: 'Concept',
  completed: 'Concept',
  // Frontend -> Database
  Concept: 'draft',
  Actief: 'running'
} as const;

export type DatabaseStatus = 'draft' | 'running' | 'paused' | 'completed';
export type FrontendStatus = 'Concept' | 'Actief';

export const mapDatabaseToFrontend = (dbStatus: DatabaseStatus): FrontendStatus => {
  return STATUS_MAPPING[dbStatus] || 'Concept';
};

export const mapFrontendToDatabase = (frontendStatus: FrontendStatus): DatabaseStatus => {
  return STATUS_MAPPING[frontendStatus] || 'draft';
};
