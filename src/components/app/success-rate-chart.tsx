
'use client';

import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import type { ApplicationStatus } from '@/lib/types';
import { useTheme } from 'next-themes';

export function SuccessRateChart() {
  const { applications } = useJobApplications();
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const interviewStages: ApplicationStatus[] = [
      'Screening with Recruiter',
      '1st Interview',
      '2nd Interview',
      '3rd Interview',
      'Task Stage',
      'Final Round',
      'Offer Received',
    ];

    const totalApplications = applications.length;
    if (totalApplications === 0) {
      return [];
    }
    
    const totalInterviews = applications.filter(app => interviewStages.includes(app.status)).length;
    
    return [
      { name: 'Applications', value: totalApplications },
      { name: 'Interviews', value: totalInterviews },
    ];
  }, [applications]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))'];

  if (applications.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] w-full flex items-center justify-center">
                <p className="text-muted-foreground">No application data to display.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] w-full p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              cursor={{ fill: 'hsl(var(--secondary))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              }}
            />
            <Legend wrapperStyle={{fontSize: "14px"}}/>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                if (value === 0) return null; // Don't render label for segments with 0 value
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                  <text
                    x={x}
                    y={y}
                    fill={theme === 'dark' ? '#fff' : '#000'}
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    className="text-sm font-semibold"
                  >
                    {`${chartData[index].name} (${value})`}
                  </text>
                );
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

