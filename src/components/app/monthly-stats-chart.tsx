'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import { format, startOfMonth } from 'date-fns';
import type { ApplicationStatus } from '@/lib/types';

export function MonthlyStatsChart() {
  const { applications } = useJobApplications();

  const monthlyData = useMemo(() => {
    const interviewStages: ApplicationStatus[] = [
      'Screening with Recruiter', 
      '1st Interview', 
      '2nd Interview', 
      '3rd Interview',
      'Task Stage',
      'Final Round', 
      'Offer Received'
    ];

    const dataByMonth = applications.reduce((acc, app) => {
      const month = format(startOfMonth(app.dateApplied), 'yyyy-MM');
      if (!acc[month]) {
        acc[month] = { name: format(startOfMonth(app.dateApplied), 'MMM yy'), applications: 0, interviews: 0 };
      }
      acc[month].applications++;
      if (interviewStages.includes(app.status)) {
        acc[month].interviews++;
      }
      return acc;
    }, {} as Record<string, { name: string; applications: number; interviews: number }>);

    return Object.values(dataByMonth).sort((a, b) => a.name.localeCompare(b.name));
  }, [applications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Application Stats</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            <Line type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={2} name="Applications" />
            <Line type="monotone" dataKey="interviews" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Interviews" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
