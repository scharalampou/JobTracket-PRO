import type {Metadata} from 'next';
import './globals.css';
import { JobApplicationsProvider } from '@/contexts/JobApplicationsContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'JobTracker Pro',
  description: 'Track your job applications with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <JobApplicationsProvider>
          {children}
          <Toaster />
        </JobApplicationsProvider>
      </body>
    </html>
  );
}
