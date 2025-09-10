import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  posted_date: string;
  expiry_date: string;
  description: string;
  requirements: string;
  employment_type?: string;
  experience_level?: string;
  salary_range?: string;
  responsibilities?: string;
  benefits?: string;
  is_active: boolean;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string;
  cv_file_path: string;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'hired';
  applied_at: string;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockJobs: Job[] = [
    {
      id: "1",
      title: "Senior Software Engineer",
      department: "Information Technology",
      location: "Addis Ababa, Ethiopia",
      posted_date: "2024-01-15",
      expiry_date: "2024-02-15",
      description: "We are looking for an experienced software engineer to join our growing tech team. You will be responsible for developing and maintaining our digital platforms, working with modern technologies like React, Node.js, and cloud services.",
      requirements: "React\nNode.js\n5+ years experience\nTypeScript\nAWS\nDocker",
      employment_type: "full-time",
      experience_level: "senior",
      salary_range: "80,000 - 120,000 ETB",
      responsibilities: "Design and develop scalable web applications\nCollaborate with product teams\nWrite clean, maintainable code\nParticipate in code reviews\nMentor junior developers",
      benefits: "Competitive salary\nHealth insurance\nProfessional development\nFlexible working hours\nModern office environment",
      is_active: true,
    },
    {
      id: "2",
      title: "Content Producer",
      department: "Media Production",
      location: "Bahir Dar, Ethiopia",
      posted_date: "2024-01-20",
      expiry_date: "2024-02-20",
      description: "Join our creative team as a content producer. You will work on various media projects including documentaries, news segments, and digital content creation for our multiple platforms.",
      requirements: "Video Production\nAdobe Creative Suite\nStorytelling\n3+ years experience\nBroadcasting",
      employment_type: "full-time",
      experience_level: "mid",
      salary_range: "50,000 - 70,000 ETB",
      is_active: true,
    },
    {
      id: "3",
      title: "Marketing Specialist",
      department: "Marketing & Communications",
      location: "Addis Ababa, Ethiopia",
      posted_date: "2024-01-18",
      expiry_date: "2024-02-18",
      description: "We're seeking a dynamic marketing specialist to develop and execute marketing campaigns that enhance our brand presence across various channels including digital, print, and broadcast media.",
      requirements: "Digital Marketing\nSocial Media\nAnalytics\nCommunication Skills\nCampaign Management",
      employment_type: "full-time",
      experience_level: "mid",
      salary_range: "45,000 - 65,000 ETB",
      is_active: true,
    },
    {
      id: "4",
      title: "Broadcast Journalist",
      department: "News & Current Affairs",
      location: "Gondar, Ethiopia",
      posted_date: "2024-01-22",
      expiry_date: "2024-02-22",
      description: "We are looking for a talented broadcast journalist to join our news team. You will research, write, and present news stories for television and radio broadcasts.",
      requirements: "Journalism Degree\nBroadcasting Experience\nResearch Skills\nCommunication\nEthics",
      employment_type: "full-time",
      experience_level: "mid",
      is_active: true,
    },
    {
      id: "5",
      title: "Graphic Designer",
      department: "Creative Services",
      location: "Addis Ababa, Ethiopia",
      posted_date: "2024-01-25",
      expiry_date: "2024-02-25",
      description: "Join our creative team as a graphic designer. You will create visual content for various media including print, digital, and broadcast platforms.",
      requirements: "Adobe Creative Suite\nTypography\nBrand Design\n2+ years experience\nPortfolio",
      employment_type: "full-time",
      experience_level: "mid",
      is_active: true,
    },
    {
      id: "6",
      title: "HR Coordinator",
      department: "Human Resources",
      location: "Addis Ababa, Ethiopia",
      posted_date: "2024-01-12",
      expiry_date: "2024-02-12",
      description: "We are seeking an HR coordinator to support our human resources team in recruitment, employee relations, and administrative tasks.",
      requirements: "HR Experience\nCommunication Skills\nOrganizational Skills\nMS Office\nProblem Solving",
      employment_type: "full-time",
      experience_level: "entry",
      is_active: true,
    },
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from Supabase first
        const { data, error: supabaseError } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('posted_date', { ascending: false });

        if (supabaseError) {
          console.warn('Supabase fetch failed, using mock data:', supabaseError);
          setJobs(mockJobs);
        } else {
          setJobs(data || mockJobs);
        }
      } catch (err) {
        console.warn('Error fetching jobs, using mock data:', err);
        setJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.warn('Supabase fetch failed, using mock data:', error);
        return mockJobs.find(job => job.id === id) || null;
      }

      return data;
    } catch (err) {
      console.warn('Error fetching job, using mock data:', err);
      return mockJobs.find(job => job.id === id) || null;
    }
  };

  const applyToJob = async (jobId: string, coverLetter: string, cvFile: File) => {
    try {
      // In a real implementation, this would upload the file and create the application
      console.log('Applying to job:', jobId, 'with cover letter:', coverLetter, 'and CV:', cvFile.name);
      
      // Mock success response
      return { success: true };
    } catch (error) {
      console.error('Error applying to job:', error);
      return { success: false, error: 'Failed to submit application' };
    }
  };

  const hasUserApplied = async (jobId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would check if the current user has applied
      console.log('Checking if user has applied to job:', jobId);
      
      // Mock response
      return false;
    } catch (error) {
      console.error('Error checking application status:', error);
      return false;
    }
  };

  const getUserApplications = async (userId: string): Promise<JobApplication[]> => {
    try {
      // In a real implementation, this would fetch user applications from Supabase
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            title,
            department,
            location
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch failed, using mock data:', error);
        // Return mock applications for development
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }
  };

  return {
    jobs,
    loading,
    error,
    getJobById,
    applyToJob,
    hasUserApplied,
    getUserApplications,
  };
};