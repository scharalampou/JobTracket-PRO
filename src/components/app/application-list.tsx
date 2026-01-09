'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JobApplication } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { ArrowUpDown, Globe, MapPin, Building, Briefcase as RoleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

type SortKey = keyof JobApplication | '';

export function ApplicationList() {
  const { applications } = useJobApplications();
  const [sortKey, setSortKey] = useState<SortKey>('dateApplied');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { active, archived } = useMemo(() => {
    const archivedStatuses = ['No Offer', 'Ghosted', 'Accepted'];
    const activeApps = applications.filter(app => !archivedStatuses.includes(app.status));
    const archivedApps = applications.filter(app => archivedStatuses.includes(app.status));
    return { active: activeApps, archived: archivedApps };
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
      if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const renderTable = (data: JobApplication[]) => {
    if (data.length === 0) {
      return <div className="text-center text-muted-foreground py-10">No applications to display.</div>
    }
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button variant="ghost" onClick={() => handleSort('company')}>
                  Company <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('role')}>
                  Role <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[150px]">
                <Button variant="ghost" onClick={() => handleSort('dateApplied')}>
                  Date Applied <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[200px]">Location</TableHead>
              <TableHead className="w-[150px]">
                <Button variant="ghost" onClick={() => handleSort('status')}>
                  Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted(data).map(app => (
              <TableRow key={app.id}>
                <TableCell className="font-medium"><Building className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.company}</TableCell>
                <TableCell><RoleIcon className="h-4 w-4 text-muted-foreground inline-block mr-2"/>{app.role}</TableCell>
                <TableCell>{format(app.dateApplied, 'P')}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {app.location.toLowerCase() === 'remote' ? <Globe className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                  {app.location}
                </TableCell>
                <TableCell>
                  <StatusBadge status={app.status} />
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
      <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived/Rejected</TabsTrigger>
      </TabsList>
      <TabsContent value="active">{renderTable(active)}</TabsContent>
      <TabsContent value="archived">{renderTable(archived)}</TabsContent>
    </Tabs>
  );
}
