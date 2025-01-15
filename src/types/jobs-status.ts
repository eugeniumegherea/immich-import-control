export interface JobsStatus {
  thumbnailGeneration: JobStatus;
  metadataExtraction: JobStatus;
  videoConversion: JobStatus;
  smartSearch: JobStatus;
  storageTemplateMigration: JobStatus;
  migration: JobStatus;
  backgroundTask: JobStatus;
  search: JobStatus;
  duplicateDetection: JobStatus;
  faceDetection: JobStatus;
  facialRecognition: JobStatus;
  sidecar: JobStatus;
  library: JobStatus;
  notifications: JobStatus;
  backupDatabase: JobStatus;
}

export type JobType = keyof JobsStatus;
export type JobCommand =
  | 'start'
  | 'pause'
  | 'resume'
  | 'empty'
  | 'clear-failed';

export interface JobStatus {
  jobCounts: JobCounts;
  queueStatus: QueueStatus;
}

export interface JobCounts {
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  waiting: number;
  paused: number;
}

export interface QueueStatus {
  isActive: boolean;
  isPaused: boolean;
}
