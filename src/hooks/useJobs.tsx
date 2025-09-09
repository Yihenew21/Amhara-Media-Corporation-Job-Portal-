import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  department: string;
  employment_type: string;
  salary_range: string | null;
  experience_level: string | null;
  posted_date: string;
  expiry_date: string | null;
  is_active: boolean;
}

export interface JobApplication {
  id: string;
  job_id: string;
  cover_letter: string | null;
  cv_file_name: string | null;
  cv_file_path: string | null;
  status: 'applied' | 'under_review' | 'interview' | 'rejected' | 'accepted';
  applied_date: string;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      if (error) {
        throw error;
      }

      setJobs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching job:', err);
      return null;
    }
  };

  const applyToJob = async (
    jobId: string, 
    coverLetter: string, 
    cvFile: File
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'You must be logged in to apply' };
      }

      // Upload CV file
      const fileName = `${user.id}/${Date.now()}-${cvFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, cvFile);

      if (uploadError) {
        throw uploadError;
      }

      // Create application record
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_id: jobId,
          cover_letter: coverLetter,
          cv_file_name: cvFile.name,
          cv_file_path: fileName,
        });

      if (applicationError) {
        // Clean up uploaded file if application creation fails
        await supabase.storage.from('cvs').remove([fileName]);
        throw applicationError;
      }

      return { success: true };
    } catch (err) {
      console.error('Error applying to job:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to submit application' 
      };
    }
  };

  const getUserApplications = async (): Promise<JobApplication[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []) as JobApplication[];
    } catch (err) {
      console.error('Error fetching applications:', err);
      return [];
    }
  };

  const hasUserApplied = async (jobId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single();

      return !error && !!data;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    getJobById,
    applyToJob,
    getUserApplications,
    hasUserApplied,
  };
};