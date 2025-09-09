import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExportData {
  jobs: any[];
  applications: any[];
  users: any[];
  analytics: any;
}

export const useExport = () => {
  const [loading, setLoading] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJobsReport = async () => {
    try {
      setLoading(true);
      
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          department,
          location,
          employment_type,
          posted_date,
          expiry_date,
          is_active,
          salary_range,
          experience_level
        `)
        .order('posted_date', { ascending: false });

      if (error) throw error;

      const formattedJobs = jobs?.map(job => ({
        'Job ID': job.id,
        'Title': job.title,
        'Department': job.department,
        'Location': job.location,
        'Employment Type': job.employment_type,
        'Posted Date': new Date(job.posted_date).toLocaleDateString(),
        'Expiry Date': job.expiry_date ? new Date(job.expiry_date).toLocaleDateString() : 'No expiry',
        'Status': job.is_active ? 'Active' : 'Inactive',
        'Salary Range': job.salary_range || 'Not specified',
        'Experience Level': job.experience_level || 'Not specified',
      })) || [];

      exportToCSV(formattedJobs, `jobs_report_${new Date().toISOString().split('T')[0]}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting jobs:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    } finally {
      setLoading(false);
    }
  };

  const exportApplicationsReport = async () => {
    try {
      setLoading(true);
      
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_date,
          cover_letter,
          cv_file_name,
          jobs!inner(title, department),
          profiles!inner(first_name, last_name)
        `)
        .order('applied_date', { ascending: false });

      if (error) throw error;

      const formattedApplications = applications?.map(app => ({
        'Application ID': app.id,
        'Job Title': app.jobs.title,
        'Department': app.jobs.department,
        'Candidate Name': `${app.profiles.first_name} ${app.profiles.last_name}`,
        'Status': app.status,
        'Applied Date': new Date(app.applied_date).toLocaleDateString(),
        'Has Cover Letter': app.cover_letter ? 'Yes' : 'No',
        'CV Uploaded': app.cv_file_name ? 'Yes' : 'No',
      })) || [];

      exportToCSV(formattedApplications, `applications_report_${new Date().toISOString().split('T')[0]}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting applications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsReport = async () => {
    try {
      setLoading(true);
      
      // Generate comprehensive analytics report
      const [jobsData, applicationsData, profilesCount] = await Promise.all([
        supabase.from('jobs').select('*'),
        supabase.from('applications').select('*'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);

      const analyticsData = {
        'Report Generated': new Date().toLocaleDateString(),
        'Total Jobs': jobsData.data?.length || 0,
        'Active Jobs': jobsData.data?.filter(j => j.is_active).length || 0,
        'Total Applications': applicationsData.data?.length || 0,
        'Total Users': profilesCount.count || 0,
        'Applications This Month': applicationsData.data?.filter(app => 
          new Date(app.applied_date).getMonth() === new Date().getMonth()
        ).length || 0,
        'Jobs This Month': jobsData.data?.filter(job => 
          new Date(job.posted_date).getMonth() === new Date().getMonth()
        ).length || 0,
      };

      exportToCSV([analyticsData], `analytics_report_${new Date().toISOString().split('T')[0]}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    } finally {
      setLoading(false);
    }
  };

  return {
    exportJobsReport,
    exportApplicationsReport,
    exportAnalyticsReport,
    loading,
  };
};