
'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { Briefcase, FileText, Handshake, Users } from 'lucide-react';
import type { ApplicationStatus } from '@/lib/types';

export function Dashboard() {
  const { applications } = useJobApplications();

  const stats = useMemo(() => {
    const nonArchived = applications.filter(app => !app.archived);
    const total = nonArchived.length;

    const interviewStages: ApplicationStatus[] = [
      'Screening with Recruiter', 
      '1st Interview', 
      '2nd Interview', 
      '3rd Interview',
      'Task Stage',
      'Final Round', 
      'Offer Received'
    ];
    const inInterview = nonArchived.filter(app => interviewStages.includes(app.status)).length;
    
    const companiesInterviewed = new Set(
      nonArchived
        .filter(app => interviewStages.includes(app.status))
        .map(app => app.company)
    ).size;

    return { total, inInterview, companiesInterviewed };
  }, [applications]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="items-center pb-2">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-2xl font-bold">{stats.inInterview}</div>
          <p className="text-xs text-muted-foreground">Active Interviews</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="items-center pb-2">
          <Handshake className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-2xl font-bold">{applications.filter(a => a.status === 'Final Round' && !a.archived).length}</div>
          <p className="text-xs text-muted-foreground">Final Stages</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="items-center pb-2">
          <Users className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-2xl font-bold">{stats.companiesInterviewed}</div>
          <p className="text-xs text-muted-foreground">Companies Interviewed</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="items-center pb-2">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total Applications</p>
        </CardContent>
      </Card>
    </div>
  );
}
