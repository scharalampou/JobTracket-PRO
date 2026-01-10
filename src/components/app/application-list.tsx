
'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JobApplication } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { ArrowUpDown, Globe, MapPin, Building, Briefcase as RoleIcon, ChevronDown, CalendarDays, Notebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { APPLICATION_STATUSES } from '@/lib/types';
import type { ApplicationStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { CloseApplicationDialog } from './close-application-dialog';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { EditApplicationModal } from './edit-application-modal';

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
    const activeStatuses: ApplicationStatus[] = [
      'Screening with Recruiter',
      '1st Interview',
      '2nd Interview',
      '3rd Interview',
      'Task Stage',
      'Final Round',
      'Offer Received'
    ];
    const terminalStatuses: ApplicationStatus[] = ['No Offer', 'Rejected CV'];

    const allArchived = applications.filter(app => app.archived || terminalStatuses.includes(app.status));
    const archivedIds = new Set(allArchived.map(a => a.id));
    
    const allActive = applications.filter(app => activeStatuses.includes(app.status) && !archivedIds.has(app.id));
    const allApplied = applications.filter(app => app.status === 'Applied' && !archivedIds.has(app.id));

    return { applied: allApplied, active: allActive, archived: allArchived };
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
      
      const valA = aValue instanceof Date ? aValue.getTime() : aValue;
      const valB = bValue instanceof Date ? bValue.getTime() : bValue;

      if (valA < valB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => (
    <div
      onClick={() => handleSort(key)}
      className="flex items-center cursor-pointer text-[#121212] dark:text-muted-foreground hover:text-foreground transition-colors"
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
      <div className="rounded-lg border bg-card">
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
              <TableHead className="w-[150px] text-base font-bold text-[#121212] dark:text-muted-foreground">Location</TableHead>
              <TableHead className="w-[200px] text-base font-bold">
                <SortableHeader sortKey="status">Status</SortableHeader>
              </TableHead>
              {tableType === 'archived' && (
                <TableHead className="w-[150px] text-base font-bold text-[#121212] dark:text-muted-foreground">Notes</TableHead>
              )}
              <TableHead className="w-[100px] text-center text-base font-bold text-[#121212] dark:text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted(data).map(app => (
              <TableRow key={app.id} className="even:bg-muted/40">
                <TableCell className="font-medium"><Building className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.company}</TableCell>
                <TableCell><RoleIcon className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.role}</TableCell>
                <TableCell className="text-muted-foreground">
                   <CalendarDays className="h-4 w-4 text-muted-foreground inline-block mr-2"/>
                  {format(new Date(app.dateApplied), 'LLL d, yyyy')}
                </TableCell>
                <TableCell>
                  {app.location.toLowerCase() === 'remote' ? <Globe className="h-4 w-4 text-muted-foreground inline-block mr-2" /> : <MapPin className="h-4 w-4 text-muted-foreground inline-block mr-2" />}
                  {app.location}
                </TableCell>
                <TableCell>
                  <StatusDropdown application={app} />
                </TableCell>
                 {tableType === 'archived' && (
                    <TableCell>
                      {app.notes ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 cursor-default text-muted-foreground">
                                <Notebook className="h-4 w-4" />
                                <span className="truncate max-w-[100px]">{app.notes}</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                              <p className="text-sm">{app.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                         <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                  )}
                 <TableCell className="text-center">
                   <div className="flex items-center justify-center gap-1">
                     <EditApplicationModal application={app} />
                      {tableType !== 'archived' ? (
                       <CloseApplicationDialog application={app} />
                     ) : (
                        <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
                          Closed
                        </Badge>
                     )}
                   </div>
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <ScrollArea>
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-3 md:w-fit">
            <TabsTrigger value="active" className="w-full justify-start green-active-tab">Active</TabsTrigger>
            <TabsTrigger value="applied" className="w-full justify-start green-active-tab">Applied</TabsTrigger>
            <TabsTrigger value="archived" className="w-full justify-start green-active-tab">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">{renderTable(active, 'active')}</TabsContent>
        <TabsContent value="applied" className="mt-4">{renderTable(applied, 'applied')}</TabsContent>
        <TabsContent value="archived" className="mt-4">{renderTable(archived, 'archived')}</TabsContent>
      </Tabs>
    </ScrollArea>
  );
}
