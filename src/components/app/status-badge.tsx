import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

const statusColors: Record<ApplicationStatus, string> = {
  Applied: 'bg-sky-200/20 text-sky-400 border-sky-300/30 hover:bg-sky-200/30',
  'Screening with Recruiter': 'bg-cyan-200/20 text-cyan-400 border-cyan-300/30 hover:bg-cyan-200/30',
  '1st Interview': 'bg-teal-200/20 text-teal-400 border-teal-300/30 hover:bg-teal-200/30',
  '2nd Interview': 'bg-blue-200/20 text-blue-400 border-blue-300/30 hover:bg-blue-200/30',
  '3rd Interview': 'bg-indigo-200/20 text-indigo-400 border-indigo-300/30 hover:bg-indigo-200/30',
  'Task Stage': 'bg-yellow-200/20 text-yellow-400 border-yellow-300/30 hover:bg-yellow-200/30',
  'Final Round': 'bg-purple-200/20 text-purple-400 border-purple-300/30 hover:bg-purple-200/30',
  'Offer Received': 'bg-green-200/20 text-green-400 border-green-300/30 hover:bg-green-200/30',
  'No Offer': 'bg-red-200/20 text-red-400 border-red-300/30 hover:bg-red-200/30',
  'Rejected CV': 'bg-orange-200/20 text-orange-400 border-orange-300/30 hover:bg-orange-200/30',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-normal', statusColors[status], className)}>
      {status}
    </Badge>
  );
}
