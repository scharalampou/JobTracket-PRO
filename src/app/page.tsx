'use client';

import { AddApplicationModal } from '@/components/app/add-application-modal';
import { ApplicationList } from '@/components/app/application-list';
import { Dashboard } from '@/components/app/dashboard';
import { MonthlyStatsChart } from '@/components/app/monthly-stats-chart';
import { Logo } from '@/components/app/logo';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { UserProfile } from '@/components/auth/UserProfile';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/firebase/auth/service';
import { useFirebase } from '@/firebase/provider';
import { LogIn } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();

  const renderUnauthenticatedView = () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <Logo className="h-16 w-16" />
      <h2 className="text-2xl font-bold tracking-tight">Welcome to JobTracker</h2>
      <p className="max-w-md text-muted-foreground">
        Sign in to manage your job applications, track your progress, and stay organized in your job search.
      </p>
      <Button onClick={() => signInWithGoogle(auth, firestore)}>
        <LogIn className="mr-2" /> Sign In with Google
      </Button>
    </div>
  );

  const renderAuthenticatedView = () => (
     <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Applications</h2>
          <ApplicationList />
        </div>
        <Dashboard />
        <div className="grid gap-4">
          <MonthlyStatsChart />
        </div>
      </main>
  );

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
          {user && <AddApplicationModal />}
          <UserProfile />
          <ThemeToggle />
        </div>
      </header>
      {isUserLoading ? (
        <div className="flex flex-1 items-center justify-center">
            <p>Loading...</p>
        </div>
      ) : user ? renderAuthenticatedView() : renderUnauthenticatedView()}
    </div>
  );
}
