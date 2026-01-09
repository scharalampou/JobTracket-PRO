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

// Omit fields that are handled automatically or in specific actions
type NewApplicationData = Omit<JobApplication, 'id' | 'userId' | 'status' | 'archived' | 'notes'>;
type UpdatedApplicationData = Omit<JobApplication, 'id' | 'userId' | 'status' | 'archived' | 'notes'>;

interface JobApplicationsContextType {
  applications: JobApplication[];
  isLoading: boolean;
  addApplication: (application: NewApplicationData) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  archiveApplication: (id: string, notes?: string) => void;
  updateApplication: (id: string, data: Partial<UpdatedApplicationData>) => void;
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


  const addApplication = useCallback((application: NewApplicationData) => {
    if (!user || !firestore) return;

    const newApplication: Omit<JobApplication, 'id'> = {
      ...application,
      userId: user.uid,
      status: 'Applied',
      archived: false,
      notes: '',
    };
    
    const collectionRef = collection(firestore, `users/${user.uid}/jobApplications`);
    addDocumentNonBlocking(collectionRef, newApplication);

  }, [firestore, user]);

  const updateApplication = useCallback((id: string, data: Partial<UpdatedApplicationData>) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/jobApplications`, id);
    updateDocumentNonBlocking(docRef, data);
  }, [firestore, user]);

  const updateApplicationStatus = useCallback((id: string, status: ApplicationStatus) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/jobApplications`, id);
    updateDocumentNonBlocking(docRef, { status });
  }, [firestore, user]);

  const archiveApplication = useCallback((id: string, notes?: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/jobApplications`, id);
    const finalNotes = notes && notes.trim() ? notes.trim() : 'N/A';
    updateDocumentNonBlocking(docRef, { archived: true, notes: finalNotes });
  }, [firestore, user]);


  return (
    <JobApplicationsContext.Provider value={{ applications: applications || [], isLoading, addApplication, updateApplication, updateApplicationStatus, archiveApplication }}>
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
