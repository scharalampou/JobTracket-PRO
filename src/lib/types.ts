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
  userId: string; // Added to link to the user
  company: string;
  role: string;
  jobDescriptionUrl: string;
  location: string;
  status: ApplicationStatus;
  dateApplied: Date;
  archived: boolean;
  notes?: string; // Optional notes for when closing an application
};
