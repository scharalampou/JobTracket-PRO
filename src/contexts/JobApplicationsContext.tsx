'use client';

import type { JobApplication, ApplicationStatus } from '@/lib/types';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, Timestamp, addDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// Omit fields that are handled automatically
type NewApplicationData = Omit<JobApplication, 'id' | 'uid' | 'status' | 'archived' | 'notes'>;
type UpdatedApplicationData = Omit<JobApplication, 'id' | 'uid' | 'status' | 'archived' | 'notes' >;


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

  // This query is now correctly scoped to the user's specific subcollection.
  const jobApplicationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Correctly point to the subcollection within the logged-in user's document.
    return collection(firestore, `users/${user.uid}/jobApplications`);
  }, [firestore, user]);

  const { data: rawApplications, isLoading } = useCollection<Omit<JobApplication, 'dateApplied'> & { dateApplied: Timestamp }>(jobApplicationsQuery);

  const applications = useMemo(() => {
    if (!rawApplications) return [];
    return rawApplications.map(app => ({
      ...app,
      // Convert Firestore Timestamp to JS Date object.
      dateApplied: app.dateApplied.toDate(),
    }));
  }, [rawApplications]);


  const addApplication = useCallback(async (application: NewApplicationData) => {
    if (!user || !firestore) return;

    // This data structure now omits the `uid` because ownership is determined by the document path.
    const newApplication: Omit<JobApplication, 'id' | 'uid'> = {
      ...application,
      jobDescriptionUrl: application.jobDescriptionUrl || '',
      status: 'Applied',
      archived: false,
      notes: '',
      dateApplied: new Date(application.dateApplied),
    };
    
    // Correctly reference the user's subcollection.
    const collectionRef = collection(firestore, `users/${user.uid}/jobApplications`);
    addDocumentNonBlocking(collectionRef, {
        ...newApplication,
        dateApplied: Timestamp.fromDate(newApplication.dateApplied),
    });

  }, [firestore, user]);

  const updateApplication = useCallback(async (id: string, data: Partial<UpdatedApplicationData>) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/jobApplications`, id);
    const updateData: any = { ...data };
    if (data.dateApplied) {
        updateData.dateApplied = Timestamp.fromDate(data.dateApplied);
    }
    
    updateDocumentNonBlocking(docRef, updateData);
  }, [firestore, user]);

  const updateApplicationStatus = useCallback(async (id: string, status: ApplicationStatus) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/jobApplications`, id);
    updateDocumentNonBlocking(docRef, { status });
  }, [firestore, user]);

  const archiveApplication = useCallback(async (id: string, notes?: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `users/${user.uid}/jobApplications`, id);
    const finalNotes = notes && notes.trim() ? notes.trim() : 'N/A';
    updateDocumentNonBlocking(docRef, { archived: true, notes: finalNotes, status: 'No Offer' });
  }, [firestore, user]);


  return (
    <JobApplicationsContext.Provider value={{ applications, isLoading, addApplication, updateApplication, updateApplicationStatus, archiveApplication }}>
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
