import { supabase } from '@/integrations/supabase/client';
import { handleApiError, retryWithBackoff, logError } from '@/lib/errors';
import type { Job, SearchFilters, PaginatedResponse } from '@/types';

export class JobService {
  /**
   * Fetch all jobs with optional filters and pagination
   */
  static async getJobs(
    filters?: SearchFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Job>> {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        applications:job_applications(count)
      `, { count: 'exact' })
      .eq('status', 'published');

    // Apply filters
    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,company.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }
    
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }
    
    if (filters?.company) {
      query = query.ilike('company', `%${filters.company}%`);
    }
    
    if (filters?.salary_min) {
      query = query.gte('salary_min', filters.salary_min);
    }
    
    if (filters?.salary_max) {
      query = query.lte('salary_max', filters.salary_max);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      const appError = handleApiError(error);
      logError(appError, { method: 'getJobs', filters, page, limit });
      throw appError;
    }

    return {
      data: (data || []).map((job: any) => ({
        ...job,
        applications_count: job.applications[0]?.count || 0
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  /**
   * Fetch a single job by ID
   */
  static async getJobById(id: string): Promise<Job> {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          applications:job_applications(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        const appError = handleApiError(error);
        logError(appError, { method: 'getJobById', jobId: id });
        throw appError;
      }
      
      if (!data) {
        const notFoundError = new Error('Job not found');
        logError(notFoundError, { method: 'getJobById', jobId: id });
        throw handleApiError(notFoundError);
      }

      return {
        ...data,
        applications_count: data.applications[0]?.count || 0
      };
    });
  }

  /**
   * Create a new job posting
   */
  static async createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'applications_count'>): Promise<Job> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        const appError = handleApiError(error);
        logError(appError, { method: 'createJob', jobData });
        throw appError;
      }
      
      return data;
    } catch (error) {
      const appError = handleApiError(error);
      logError(appError, { method: 'createJob', jobData });
      throw appError;
    }
  }

  /**
   * Update an existing job
   */
  static async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a job
   */
  static async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get jobs created by a specific user
   */
  static async getJobsByCreator(creatorId: string): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        applications:job_applications(count)
      `)
      .eq('created_by', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((job: any) => ({
      ...job,
      applications_count: job.applications[0]?.count || 0
    }));
  }

  /**
   * Get featured/recommended jobs
   */
  static async getFeaturedJobs(limit = 6): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        applications:job_applications(count)
      `)
      .eq('status', 'published')
      .gte('application_deadline', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((job: any) => ({
      ...job,
      applications_count: job.applications[0]?.count || 0
    }));
  }

  /**
   * Search jobs by skills/requirements
   */
  static async searchJobsBySkills(skills: string[]): Promise<Job[]> {
    if (!skills.length) return [];

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        applications:job_applications(count)
      `)
      .eq('status', 'published')
      .containedBy('requirements', skills);

    if (error) throw error;

    return (data || []).map((job: any) => ({
      ...job,
      applications_count: job.applications[0]?.count || 0
    }));
  }

  /**
   * Get job statistics
   */
  static async getJobStats() {
    const { data: totalJobs, error: totalError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true });

    const { data: activeJobs, error: activeError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('application_deadline', new Date().toISOString());

    if (totalError || activeError) {
      throw totalError || activeError;
    }

    return {
      total: totalJobs?.length || 0,
      active: activeJobs?.length || 0
    };
  }
}
