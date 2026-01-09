export const APPLICATION_STATUSES = [
  'Applied',
  'Screening',
  'Recruiter Call',
  'Technical Interview',
  'Final Round',
  'Offer',
  'Accepted',
  'No Offer',
  'Ghosted',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  jobDescriptionUrl: string;
  dateApplied: Date;
  location: string;
  status: ApplicationStatus;
};
