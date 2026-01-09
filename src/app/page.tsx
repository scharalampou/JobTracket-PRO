'use client';

import { AddApplicationModal } from '@/components/app/add-application-modal';
import { ApplicationList } from '@/components/app/application-list';
import { Dashboard } from '@/components/app/dashboard';
import { LocationChart } from '@/components/app/location-chart';
import { Logo } from '@/components/app/logo';
import { ThemeToggle } from '@/components/app/theme-toggle';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
            JobTracker Pro
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AddApplicationModal />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Dashboard />
        <ApplicationList />
        <LocationChart />
      </main>
    </div>
  );
}
