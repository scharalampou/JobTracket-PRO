import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

const statusColors: Record<ApplicationStatus, string> = {
  Applied: 'border-transparent bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  'Screening with Recruiter': 'border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
  '1st Interview': 'border-transparent bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
  '2nd Interview': 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  '3rd Interview': 'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  'Task Stage': 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Final Round': 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  'Offer Received': 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'No Offer': 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  'Rejected CV': 'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-normal', statusColors[status], className)}>
      {status}
    </Badge>
  );
}
