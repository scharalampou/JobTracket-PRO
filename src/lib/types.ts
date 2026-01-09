export const APPLICATION_STATUSES = [
  'Applied',
  'Screening with Recruiter',
  '1st Interview',
  '2nd Interview',
  '3rd Interview',
  'Task Stage',
  'Final Round',
  'Offer Received',
  'No Offer',
  'Rejected CV',
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
