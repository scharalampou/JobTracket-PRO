'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { Briefcase, FileText, Handshake, Users } from 'lucide-react';

export function Dashboard() {
  const { applications } = useJobApplications();

  const stats = useMemo(() => {
    const total = applications.length;
    const interviewStages = ['Recruiter Call', 'Technical Interview', 'Final Round', 'Offer', 'Accepted'];
    const inInterview = applications.filter(app => interviewStages.includes(app.status)).length;
    
    const companiesInterviewed = new Set(
      applications
        .filter(app => interviewStages.includes(app.status))
        .map(app => app.company)
    ).size;

    const locationData = applications.reduce((acc, app) => {
      const location = app.location === 'Remote' ? 'Remote' : app.location.split(',').pop()?.trim() || 'Other';
      const existing = acc.find(item => item.name === location);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: location, count: 1 });
      }
      return acc;
    }, [] as { name: string; count: number }[]).sort((a,b) => b.count - a.count);

    return { total, inInterview, companiesInterviewed, locationData };
  }, [applications]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <CardTitle className="text-sm font-medium">Final Stage</CardTitle>
          <Handshake className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{applications.filter(a => a.status === 'Final Round').length}</div>
          <p className="text-xs text-muted-foreground">Applications in final stages</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Applications by Location</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.locationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--secondary))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
