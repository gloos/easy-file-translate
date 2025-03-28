
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Types
type TranslationStatus = 'queued' | 'processing' | 'translating' | 'completed' | 'error';

export type TranslationJob = {
  id: string;
  userId: string;
  username: string;
  fileName: string;
  fileSize: number;
  sourceLanguage: string;
  targetLanguage: string;
  status: TranslationStatus;
  uploadDate: Date;
  completedDate?: Date;
  error?: string;
};

type TranslationContextType = {
  jobs: TranslationJob[];
  getUserJobs: () => TranslationJob[];
  addJob: (job: Omit<TranslationJob, 'id' | 'uploadDate' | 'status'>) => void;
  updateJobStatus: (jobId: string, status: TranslationStatus, error?: string) => void;
  getLanguages: () => { source: string[], target: string[] };
};

// Mock source and target languages
const SOURCE_LANGUAGES = [
  'English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Dutch', 
  'Polish', 'Russian', 'Japanese', 'Chinese', 'Korean'
];

const TARGET_LANGUAGES = [
  'English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese', 'Dutch', 
  'Polish', 'Russian', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Turkish'
];

// Create context
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Provider component
export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<TranslationJob[]>([]);

  // Load jobs from localStorage on initial render
  useEffect(() => {
    const savedJobs = localStorage.getItem('translationJobs');
    if (savedJobs) {
      // Convert string dates back to Date objects
      const parsedJobs = JSON.parse(savedJobs).map((job: any) => ({
        ...job,
        uploadDate: new Date(job.uploadDate),
        completedDate: job.completedDate ? new Date(job.completedDate) : undefined
      }));
      setJobs(parsedJobs);
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('translationJobs', JSON.stringify(jobs));
  }, [jobs]);

  // Get jobs for the current user (or all jobs for admin)
  const getUserJobs = () => {
    if (!user) return [];
    
    // Admin can see all jobs
    if (user.role === 'admin') {
      return [...jobs].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    }
    
    // Regular users can only see their own jobs
    return jobs
      .filter(job => job.userId === user.id)
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  };

  // Add a new job
  const addJob = (jobData: Omit<TranslationJob, 'id' | 'uploadDate' | 'status'>) => {
    const newJob: TranslationJob = {
      ...jobData,
      id: Date.now().toString(),
      uploadDate: new Date(),
      status: 'queued'
    };
    
    setJobs(prevJobs => [...prevJobs, newJob]);
    
    // Simulate job processing with timeouts
    simulateJobProcessing(newJob.id);
    
    return newJob.id;
  };

  // Update the status of a job
  const updateJobStatus = (jobId: string, status: TranslationStatus, error?: string) => {
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status,
            error,
            completedDate: status === 'completed' ? new Date() : job.completedDate
          };
        }
        return job;
      })
    );
  };

  // Simulate job processing
  const simulateJobProcessing = (jobId: string) => {
    // Processing stage
    setTimeout(() => {
      updateJobStatus(jobId, 'processing');
      
      // Translating stage
      setTimeout(() => {
        updateJobStatus(jobId, 'translating');
        
        // Set a random completion time between 5-15 seconds
        const completionTime = 5000 + Math.random() * 10000;
        
        // Final stage - randomly complete or error
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% chance of success
          
          if (success) {
            updateJobStatus(jobId, 'completed');
          } else {
            updateJobStatus(
              jobId, 
              'error', 
              'Translation service error. Please try again.'
            );
          }
        }, completionTime);
      }, 3000); // 3 seconds for processing
    }, 2000); // 2 seconds for queued
  };

  // Get available languages
  const getLanguages = () => {
    return {
      source: SOURCE_LANGUAGES,
      target: TARGET_LANGUAGES
    };
  };

  return (
    <TranslationContext.Provider value={{ jobs, getUserJobs, addJob, updateJobStatus, getLanguages }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use the translation context
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
