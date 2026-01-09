'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { Briefcase, FileText, Handshake, Users } from 'lucide-react';
import { ApplicationStatus } from '@/lib/types';

export function Dashboard() {
  const { applications } = useJobApplications();

  const stats = useMemo(() => {
    const total = applications.length;
    const interviewStages: ApplicationStatus[] = [
      'Screening with Recruiter', 
      '1st Interview', 
      '2nd Interview', 
      '3rd Interview',
      'Task Stage',
      'Final Round', 
      'Offer Received'
    ];
    const inInterview = applications.filter(app => interviewStages.includes(app.status)).length;
    
    const companiesInterviewed = new Set(
      applications
        .filter(app => interviewStages.includes(app.status))
        .map(app => app.company)
    ).size;

    return { total, inInterview, companiesInterviewed };
  }, [applications]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inInterview}</div>
          <p className="text-xs text-muted-foreground">In an interview stage</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Final Stage</CardTitle>
          <Handshake className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applications.filter(a => a.status === 'Final Round').length}</div>
          <p className="text-xs text-muted-foreground">Applications in final stages</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Companies Interviewed</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.companiesInterviewed}</div>
          <p className="text-xs text-muted-foreground">Unique companies with interviews</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Across all stages</p>
        </CardContent>
      </Card>
    </div>
  );
}
