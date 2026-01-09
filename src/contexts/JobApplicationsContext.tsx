'use client';

import type { JobApplication, ApplicationStatus } from '@/lib/types';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';

// Omit ID and userId, as they will be handled automatically
type NewApplication = Omit<JobApplication, 'id' | 'userId' | 'status' >;

interface JobApplicationsContextType {
  applications: JobApplication[];
  isLoading: boolean;
  addApplication: (application: NewApplication) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
}

const JobApplicationsContext = createContext<JobApplicationsContextType | undefined>(undefined);

export const JobApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firestore, user } = useFirebase();

  const jobApplicationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Query the subcollection for the logged-in user
    return collection(firestore, `users/${user.uid}/jobApplications`);
  }, [firestore, user]);

  // The raw data from Firestore includes Timestamps
  const { data: rawApplications, isLoading } = useCollection<Omit<JobApplication, 'dateApplied'> & { dateApplied: Timestamp }>(jobApplicationsQuery);

  // Memoize the conversion from Timestamp to Date
  const applications = useMemo(() => {
    if (!rawApplications) return [];
    return rawApplications.map(app => ({
      ...app,
      // Safely convert Timestamp to Date
      dateApplied: app.dateApplied.toDate(),
    }));
  }, [rawApplications]);


  const addApplication = useCallback((application: NewApplication) => {
    if (!user || !firestore) return;

    // Create the full application object, including the user's ID
    const newApplication: Omit<JobApplication, 'id'> = {
      ...application,
      userId: user.uid, // Associate the application with the current user
      status: 'Applied',
    };
    
    // Get a reference to the user's specific subcollection
    const collectionRef = collection(firestore, `users/${user.uid}/jobApplications`);
    addDocumentNonBlocking(collectionRef, newApplication);

  }, [firestore, user]);

  const updateApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    if (!user || !firestore) return;
    // Get a reference to the document within the user's subcollection
    const docRef = doc(firestore, `users/${user.uid}/jobApplications`, id);
    updateDocumentNonBlocking(docRef, { status });
  }, [firestore, user]);

  return (
    <JobApplicationsContext.Provider value={{ applications: applications || [], isLoading, addApplication, updateApplicationStatus }}>
      {children}
    </JobApplicationsContext.Provider>
  );
};

export const useJobApplications = () => {
  const context = useContext(JobApplicationsContext);
  if (context === undefined) {
    throw new Error('useJobApplications must be used within a JobApplicationsProvider');
  }
  return context;
};
