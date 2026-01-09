'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JobApplication } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { Archive, ArrowUpDown, Globe, MapPin, Building, Briefcase as RoleIcon, ChevronDown, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { APPLICATION_STATUSES } from '@/lib/types';
import type { ApplicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { ConfirmDialog } from './confirm-dialog';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
  const { applications, archiveApplication } = useJobApplications();
  const [sortKey, setSortKey] = useState<SortKey>('dateApplied');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { applied, active, archived } = useMemo(() => {
    const activeStatuses: ApplicationStatus[] = [
      'Screening with Recruiter', 
      '1st Interview', 
      '2nd Interview', 
      '3rd Interview',
      'Task Stage',
      'Final Round',
      'Offer Received'
    ];
    const appliedApps = applications.filter(app => app.status === 'Applied' && !app.archived);
    const activeApps = applications.filter(app => activeStatuses.includes(app.status) && !app.archived);
    const archivedApps = applications.filter(app => app.archived);
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
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <div
      onClick={() => handleSort(key)}
      className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </div>
  );

  const renderTable = (data: JobApplication[], tableType: 'active' | 'applied' | 'archived') => {
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
              <TableHead className="w-[150px] text-base font-bold text-muted-foreground">Location</TableHead>
              <TableHead className="w-[200px] text-base font-bold">
                <SortableHeader sortKey="status">Status</SortableHeader>
              </TableHead>
              { (tableType === 'active' || tableType === 'archived') && <TableHead className="w-[100px]"></TableHead> }
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted(data).map(app => (
              <TableRow key={app.id}>
                <TableCell className="font-medium"><Building className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.company}</TableCell>
                <TableCell><RoleIcon className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.role}</TableCell>
                <TableCell className="text-muted-foreground">
                   <CalendarDays className="h-4 w-4 text-muted-foreground inline-block mr-2"/>
                  {format(app.dateApplied, 'LLL d, yyyy')}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {app.location.toLowerCase() === 'remote' ? <Globe className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                  {app.location}
                </TableCell>
                <TableCell>
                  <StatusDropdown application={app} />
                </TableCell>
                 { (tableType === 'active' || tableType === 'archived') && (
                    <TableCell>
                      {tableType === 'active' ? (
                          <ConfirmDialog
                            onConfirm={() => archiveApplication(app.id)}
                            title="Are you sure?"
                            description={`This will close your application for the ${app.role} role at ${app.company} and move it to the archive.`}
                            trigger={
                               <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Archive className="h-4 w-4" />
                                        <span className="sr-only">Close Application</span>
                                    </Button>
                                    </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Close Application</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            }
                        />
                      ) : (
                         <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
                          Closed
                        </Badge>
                      )
                    }
                    </TableCell>
                 )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <ScrollArea className="h-[450px]">
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:w-full">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="applied">Applied</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="active">{renderTable(active, 'active')}</TabsContent>
      <TabsContent value="applied">{renderTable(applied, 'applied')}</TabsContent>
      <TabsContent value="archived">{renderTable(archived, 'archived')}</TabsContent>
    </Tabs>
    </ScrollArea>
  );
}
