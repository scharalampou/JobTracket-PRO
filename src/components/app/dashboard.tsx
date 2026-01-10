
'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { Briefcase, FileText, Handshake, Users } from 'lucide-react';
import type { ApplicationStatus } from '@/lib/types';

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
    
    const inInterview = applications.filter(app => interviewStages.includes(app.status) && !app.archived).length;
    
    const companiesInterviewed = new Set(
      applications
        .filter(app => app.status !== 'Applied' && app.status !== 'Rejected CV')
        .map(app => app.company)
    ).size;

    return { total, inInterview, companiesInterviewed };
  }, [applications]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex items-center justify-center pb-2">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-[#4DAA57]">{stats.inInterview}</div>
          <CardTitle className="pt-3">Active Interviews</CardTitle>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-center pb-2">
          <Handshake className="h-10 w-10 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-[#4DAA57]">{applications.filter(a => a.status === 'Final Round' && !a.archived).length}</div>
          <CardTitle className="pt-3">Final Stages</CardTitle>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex items-center justify-center pb-2">
          <Users className="h-10 w-10 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-[#4DAA57]">{stats.companiesInterviewed}</div>
          <CardTitle className="pt-3">Companies Interviewed</CardTitle>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex items-center justify-center pb-2">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-[#4DAA57]">{stats.total}</div>
          <CardTitle className="pt-3">Total Applications</CardTitle>
        </CardContent>
      </Card>
    </div>
  );
}
