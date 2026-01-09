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
import { getRedirectResult, signInWithGoogle } from '@/firebase/auth/service';
import { useFirebase } from '@/firebase/provider';
import { LogIn } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

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
      <div className="flex flex-1 items-center justify-center">
        <p>{message}</p>
      </div>
    </div>
  );
}


export default function Home() {
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useFirebase();
  // isCheckingRedirect will be true on initial mount until we've processed any potential redirect.
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);


  useEffect(() => {
    // This effect runs once on mount to handle any pending sign-in redirects.
    const handleRedirect = async () => {
      try {
        await getRedirectResult(auth, firestore);
      } catch (error) {
        // This can happen if the user is not coming from a redirect (e.g. auth/no-auth-event)
        // We can safely ignore those, but log others.
         if ((error as any).code !== 'auth/no-auth-event') {
            console.error("Error handling redirect result:", error);
         }
      } finally {
        // Once we've checked, we can stop showing the "Signing in..." message.
        // The onAuthStateChanged listener will then correctly report the user status.
        setIsCheckingRedirect(false);
      }
    };
    handleRedirect();
  }, [auth, firestore]);


  // Show a loading screen while checking for a redirect or while the user state is initially loading.
  if (isCheckingRedirect || isUserLoading) {
    const message = isCheckingRedirect ? "Finalizing sign in..." : "Loading user...";
    return <LoadingScreen message={message} />;
  }

  const handleSignIn = () => {
    signInWithGoogle(auth, firestore);
  };


  const renderUnauthenticatedView = () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <Logo className="h-16 w-16" />
      <h2 className="text-2xl font-bold tracking-tight">Welcome to JobTracker</h2>
      <p className="max-w-md text-muted-foreground">
        Sign in to manage your job applications, track your progress, and stay organized in your job search.
      </p>
      <Button onClick={handleSignIn}>
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
      {user ? renderAuthenticatedView() : renderUnauthenticatedView()}
    </div>
  );
}
