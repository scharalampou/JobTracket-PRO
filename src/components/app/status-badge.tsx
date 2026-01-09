import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: ApplicationStatus;
  className?: string;
};

const statusColors: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
  Screening: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30',
  'Recruiter Call': 'bg-teal-500/20 text-teal-300 border-teal-500/30 hover:bg-teal-500/30',
  'Technical Interview': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30',
  'Final Round': 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30',
  Offer: 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30',
  Accepted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold hover:bg-emerald-500/30',
  'No Offer': 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
  Ghosted: 'bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-normal', statusColors[status], className)}>
      {status}
    </Badge>
  );
}
