import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  posted_date: string;
  expiry_date: string;
  description: string;
  requirements: string;
  key_responsibilities?: string;
  employment_type?: string;
  experience_level?: string;
  salary_range?: string;
  benefits?: string;
  is_active: boolean;
  number_of_positions?: number;
}

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string;
  cv_file_path: string;
  status: "applied" | "under_review" | "interview" | "rejected" | "accepted";
  applied_date: string;
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        // Fetch from Supabase
        const { data, error: supabaseError } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .order("posted_date", { ascending: false });

        if (supabaseError) {
          console.error("Error fetching jobs:", supabaseError);
          setError("Failed to fetch jobs");
          setJobs([]);
        } else {
          // Filter out expired jobs (but don't update database on public pages)
          const currentDate = new Date();
          const activeJobs = (data || []).filter(
            (job) =>
              !job.expiry_date || new Date(job.expiry_date) >= currentDate
          );

          setJobs(activeJobs);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to fetch jobs");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      console.log("Fetching job with ID:", id);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching job:", error);
        return null;
      }

      console.log("Found job in database:", data);
      return data;
    } catch (err) {
      console.error("Error fetching job:", err);
      return null;
    }
  };

  const applyToJob = async (
    jobId: string,
    coverLetter: string,
    cvFile: File
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "You must be logged in to apply" };
      }

      // Upload CV file to Supabase Storage
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `${user.id}/${jobId}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, cvFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        return { success: false, error: "Failed to upload CV" };
      }

      // Create application record
      const { data, error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          user_id: user.id,
          cover_letter: coverLetter,
          cv_file_name: cvFile.name,
          cv_file_path: uploadData.path,
          status: "applied",
        })
        .select()
        .single();

      if (error) {
        // If application creation fails, clean up uploaded file
        await supabase.storage.from("cvs").remove([fileName]);
        console.error("Application creation error:", error);
        return { success: false, error: "Failed to submit application" };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error applying to job:", error);
      return { success: false, error: "Failed to submit application" };
    }
  };

  const hasUserApplied = async (jobId: string): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("user_id", user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record found

      if (error) {
        console.error("Error checking application status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking application status:", error);
      return false;
    }
  };

  const getUserApplications = async (
    userId: string
  ): Promise<JobApplication[]> => {
    try {
      // In a real implementation, this would fetch user applications from Supabase
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          jobs (
            title,
            department,
            location
          )
        `
        )
        .eq("user_id", userId)
        .order("applied_date", { ascending: false });

      if (error) {
        console.warn("Supabase fetch failed, using mock data:", error);
        // Return mock applications for development
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching user applications:", error);
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
