'use client';

import type { JobApplication, ApplicationStatus } from '@/lib/types';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  type WithId,
} from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';

// Omit ID and userId, as they will be handled automatically
type NewApplication = Omit<JobApplication, 'id' | 'userId' | 'status' | 'dateApplied'>;

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
    return collection(firestore, `users/${user.uid}/jobApplications`);
  }, [firestore, user]);

  const { data: rawApplications, isLoading } = useCollection<Omit<JobApplication, 'dateApplied'> & { dateApplied: Timestamp }>(jobApplicationsQuery);

  const applications = useMemo(() => {
    if (!rawApplications) return [];
    return rawApplications.map(app => ({
      ...app,
      dateApplied: app.dateApplied.toDate(),
    }));
  }, [rawApplications]);


  const addApplication = useCallback((application: NewApplication) => {
    if (!user || !firestore) return;

    const newApplication: Omit<JobApplication, 'id'> = {
      ...application,
      userId: user.uid,
      status: 'Applied',
      dateApplied: new Date(),
    };
    
    const collectionRef = collection(firestore, `users/${user.uid}/jobApplications`);
    addDocumentNonBlocking(collectionRef, newApplication);

  }, [firestore, user]);

  const updateApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    if (!user || !firestore) return;
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
