'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export function LocationChart() {
  const { applications } = useJobApplications();

  const locationData = useMemo(() => {
    return applications.reduce((acc, app) => {
      const location = app.location === 'Remote' ? 'Remote' : app.location.split(',').pop()?.trim() || 'Other';
      const existing = acc.find(item => item.name === location);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: location, count: 1 });
      }
      return acc;
    }, [] as { name: string; count: number }[]).sort((a,b) => b.count - a.count);
  }, [applications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications by Location</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={locationData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
  );
}
