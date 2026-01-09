'use client';

import type { JobApplication, ApplicationStatus } from '@/lib/types';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import {
  useCollection,
  useFirebase,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, Timestamp, addDoc, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

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

  // The query now depends on the user's UID.
  const jobApplicationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'jobApplications');
    // Note: The Firestore rules will enforce that only the user's own applications are returned.
    // We will filter on the client-side for simplicity, but a where('uid', '==', user.uid) clause
    // would be more performant for large datasets.
  }, [firestore, user]);

  const { data: rawApplications, isLoading } = useCollection<Omit<JobApplication, 'dateApplied'> & { dateApplied: Timestamp }>(jobApplicationsQuery);

  const applications = useMemo(() => {
    if (!rawApplications || !user) return [];
    // Filter applications to only show those belonging to the current user.
    return rawApplications
      .filter(app => app.uid === user.uid)
      .map(app => ({
        ...app,
        dateApplied: app.dateApplied.toDate(),
    }));
  }, [rawApplications, user]);


  const addApplication = useCallback(async (application: NewApplicationData) => {
    if (!user || !firestore) return;

    const newApplication: Omit<JobApplication, 'id'> = {
      ...application,
      jobDescriptionUrl: application.jobDescriptionUrl || '',
      uid: user.uid, // Set the UID of the current user
      status: 'Applied',
      archived: false,
      notes: '',
      dateApplied: new Date(application.dateApplied),
    };
    
    const collectionRef = collection(firestore, `jobApplications`);
    try {
        await addDoc(collectionRef, {
            ...newApplication,
            dateApplied: Timestamp.fromDate(newApplication.dateApplied),
        });
    } catch (error: any) {
        console.error("Error adding document: ", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "Could not save application.",
        });
    }

  }, [firestore, user]);

  const updateApplication = useCallback(async (id: string, data: Partial<UpdatedApplicationData>) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `jobApplications`, id);
    const updateData: any = { ...data };
    if (data.dateApplied) {
        updateData.dateApplied = Timestamp.fromDate(data.dateApplied);
    }
    
    try {
      await updateDoc(docRef, updateData);
    } catch (error: any) {
      console.error("Error updating document: ", error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Could not update the application.',
      });
    }
  }, [firestore, user]);

  const updateApplicationStatus = useCallback(async (id: string, status: ApplicationStatus) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `jobApplications`, id);
    try {
      await updateDoc(docRef, { status });
    } catch (error: any) {
      console.error("Error updating status: ", error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Could not update status.',
      });
    }
  }, [firestore, user]);

  const archiveApplication = useCallback(async (id: string, notes?: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, `jobApplications`, id);
    const finalNotes = notes && notes.trim() ? notes.trim() : 'N/A';
    try {
      await updateDoc(docRef, { archived: true, notes: finalNotes, status: 'No Offer' });
    } catch (error: any)      {
      console.error("Error archiving application: ", error);
      toast({
        variant: 'destructive',
        title: 'Archive failed',
        description: error.message || 'Could not archive application.',
      });
    }
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
