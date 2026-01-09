'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JobApplication } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { ArrowUpDown, Globe, MapPin, Building, Briefcase as RoleIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { APPLICATION_STATUSES } from '@/lib/types';
import type { ApplicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortKey = keyof JobApplication | '';

const StatusDropdown = ({ application }: { application: JobApplication }) => {
  const { updateApplicationStatus } = useJobApplications();

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateApplicationStatus(application.id, newStatus);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full justify-between p-1 h-auto font-normal rounded-md',
            'hover:bg-accent/50 transition-colors'
          )}
        >
          <StatusBadge status={application.status} />
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {APPLICATION_STATUSES.map(status => (
          <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
            <StatusBadge status={status} className="py-1 px-1.5"/>
            <span className="ml-2">{status}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


export function ApplicationList() {
  const { applications } = useJobApplications();
  const [sortKey, setSortKey] = useState<SortKey>('dateApplied');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { applied, active, archived } = useMemo(() => {
    const archivedStatuses: ApplicationStatus[] = ['No Offer', 'Rejected CV'];
    const appliedApps = applications.filter(app => app.status === 'Applied');
    const activeApps = applications.filter(app => !archivedStatuses.includes(app.status) && app.status !== 'Applied');
    const archivedApps = applications.filter(app => archivedStatuses.includes(app.status));
    return { applied: appliedApps, active: activeApps, archived: archivedApps };
  }, [applications]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sorted = (data: JobApplication[]) => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <div
      onClick={() => handleSort(key)}
      className="flex items-center cursor-pointer hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </div>
  );

  const renderTable = (data: JobApplication[]) => {
    if (data.length === 0) {
      return <div className="text-center text-muted-foreground py-10">No applications to display.</div>
    }
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] text-base font-bold">
                <SortableHeader sortKey="company">Company</SortableHeader>
              </TableHead>
              <TableHead className="text-base font-bold">
                <SortableHeader sortKey="role">Role</SortableHeader>
              </TableHead>
              <TableHead className="w-[150px] text-base font-bold">
                <SortableHeader sortKey="dateApplied">Date</SortableHeader>
              </TableHead>
              <TableHead className="w-[200px] text-base font-bold">Location</TableHead>
              <TableHead className="w-[200px] text-base font-bold">
                <SortableHeader sortKey="status">Status</SortableHeader>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted(data).map(app => (
              <TableRow key={app.id}>
                <TableCell className="font-medium"><Building className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.company}</TableCell>
                <TableCell><RoleIcon className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.role}</TableCell>
                <TableCell>{format(new Date(app.dateApplied), 'P')}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {app.location.toLowerCase() === 'remote' ? <Globe className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                  {app.location}
                </TableCell>
                <TableCell>
                  <StatusDropdown application={app} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="applied">Applied</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="active">{renderTable(active)}</TabsContent>
      <TabsContent value="applied">{renderTable(applied)}</TabsContent>
      <TabsContent value="archived">{renderTable(archived)}</TabsContent>
    </Tabs>
  );
}
