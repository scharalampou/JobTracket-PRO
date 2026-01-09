'use client';

import { AddApplicationModal } from '@/components/app/add-application-modal';
import { ApplicationList } from '@/components/app/application-list';
import { Dashboard } from '@/components/app/dashboard';
import { MonthlyStatsChart } from '@/components/app/monthly-stats-chart';
import { Logo } from '@/components/app/logo';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { UserProfile } from '@/components/auth/UserProfile';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { useUser } from '@/firebase';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
            JobTracker
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <UserProfile />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p>{message}</p>
      </div>
    </div>
  );
}

// Explicitly define props to satisfy Next.js App Router requirements
// This prevents the "params are being enumerated" error.
export default function Home({ params, searchParams }: { params: {}; searchParams: {} }) {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <LoadingScreen message="Loading user data..." />;
  }

  const renderUnauthenticatedView = () => (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center">
           <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
           <CardDescription>
            Sign in or create an account to track your job applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailPasswordForm />
        </CardContent>
      </Card>
    </div>
  );

  const renderAuthenticatedView = () => (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Your Applications</h2>
        <ApplicationList />
      </div>
      <Separator />
      <div className="grid gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Statistics</h2>
        <Dashboard />
        <MonthlyStatsChart />
      </div>
    </main>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
            JobTracker Pro
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user && <AddApplicationModal />}
          <UserProfile />
          <ThemeToggle />
        </div>
      </header>
      {user ? renderAuthenticatedView() : renderUnauthenticatedView()}
    </div>
  );
}
