export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'job_seeker' | 'employer' | 'admin' | 'super_admin';
  phone?: string;
  location?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  location: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  application_deadline: string;
  status: 'draft' | 'published' | 'closed';
  created_by: string;
  created_at: string;
  updated_at: string;
  applications_count?: number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter?: string;
  resume_url: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  applied_at: string;
  reviewed_at?: string;
  notes?: string;
  job?: Job;
  user?: User;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience_years?: number;
  education_level?: string;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  logo_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface AIAssessment {
  id: string;
  application_id: string;
  assessment_data: {
    skills_match: number;
    experience_relevance: number;
    overall_score: number;
    strengths: string[];
    areas_for_improvement: string[];
    recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
  };
  created_at: string;
}

export interface Analytics {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
  total_users: number;
  monthly_applications: Array<{
    month: string;
    applications: number;
  }>;
  top_skills: Array<{
    skill: string;
    count: number;
  }>;
  application_status_breakdown: Array<{
    status: string;
    count: number;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  query?: string;
  location?: string;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  company?: string;
}
