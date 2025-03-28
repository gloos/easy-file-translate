
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
type TranslationStatus = 'queued' | 'processing' | 'translating' | 'completed' | 'error';

export type TranslationJob = {
  id: string;
  userId: string;
  username?: string;
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
  addJob: (job: Omit<TranslationJob, 'id' | 'userId' | 'uploadDate' | 'status'>) => Promise<string>;
  updateJobStatus: (jobId: string, status: TranslationStatus, error?: string) => Promise<void>;
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
  const { user, isAdmin } = useAuth();
  const [jobs, setJobs] = useState<TranslationJob[]>([]);

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('translation_jobs')
        .select('*');
      
      // If not admin, only fetch own jobs
      if (!isAdmin()) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }
      
      if (data) {
        // Transform the data to match our TranslationJob type
        const transformedJobs: TranslationJob[] = data.map(job => ({
          id: job.id,
          userId: job.user_id,
          fileName: job.file_name,
          fileSize: job.file_size,
          sourceLanguage: job.source_language,
          targetLanguage: job.target_language,
          status: job.status as TranslationStatus,
          uploadDate: new Date(job.upload_date),
          completedDate: job.completed_date ? new Date(job.completed_date) : undefined,
          error: job.error || undefined
        }));
        
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error in fetchJobs:', error);
    }
  };

  // Fetch jobs whenever user changes
  useEffect(() => {
    fetchJobs();
    
    // Set up realtime subscription
    if (user) {
      const channel = supabase
        .channel('translation_jobs_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'translation_jobs'
          },
          () => {
            fetchJobs();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Get jobs for the current user (or all jobs for admin)
  const getUserJobs = () => {
    // Sort by upload date, newest first
    return [...jobs].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  };

  // Add a new job
  const addJob = async (jobData: Omit<TranslationJob, 'id' | 'userId' | 'uploadDate' | 'status'>) => {
    if (!user) {
      throw new Error('User must be logged in to add a job');
    }
    
    try {
      // Insert the job into Supabase
      const { data, error } = await supabase
        .from('translation_jobs')
        .insert({
          user_id: user.id,
          file_name: jobData.fileName,
          file_size: jobData.fileSize,
          source_language: jobData.sourceLanguage,
          target_language: jobData.targetLanguage,
          status: 'queued'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding job:', error);
        throw error;
      }
      
      // Simulate job processing with timeouts
      if (data) {
        simulateJobProcessing(data.id);
        return data.id;
      }
      
      throw new Error('Failed to add job');
    } catch (error) {
      console.error('Error in addJob:', error);
      throw error;
    }
  };

  // Update the status of a job
  const updateJobStatus = async (jobId: string, status: TranslationStatus, error?: string) => {
    try {
      const updateData: {
        status: TranslationStatus;
        error?: string;
        completed_date?: string;
      } = { status };
      
      if (error) {
        updateData.error = error;
      }
      
      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString();
      }
      
      const { error: supabaseError } = await supabase
        .from('translation_jobs')
        .update(updateData)
        .eq('id', jobId);
      
      if (supabaseError) {
        console.error('Error updating job status:', supabaseError);
      }
    } catch (error) {
      console.error('Error in updateJobStatus:', error);
    }
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
