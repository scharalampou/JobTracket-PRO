'use client';

import { initialApplications } from '@/lib/data';
import type { JobApplication } from '@/lib/types';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface JobApplicationsContextType {
  applications: JobApplication[];
  addApplication: (application: Omit<JobApplication, 'id' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: JobApplication['status']) => void;
}

const JobApplicationsContext = createContext<JobApplicationsContextType | undefined>(undefined);

export const JobApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);

  const addApplication = useCallback((application: Omit<JobApplication, 'id' | 'status'>) => {
    const newApplication: JobApplication = {
      ...application,
      id: Date.now().toString(), // Use timestamp for a more unique ID
      status: 'Applied',
    };
    setApplications(prev => [newApplication, ...prev]);
  }, []);

  const updateApplicationStatus = useCallback((id: string, status: JobApplication['status']) => {
    setApplications(prev => prev.map(app => (app.id === id ? { ...app, status } : app)));
  }, []);

  return (
    <JobApplicationsContext.Provider value={{ applications, addApplication, updateApplicationStatus }}>
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
