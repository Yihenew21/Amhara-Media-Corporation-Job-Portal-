import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIAssessment {
  id: string;
  application_id: string;
  cv_score: number;
  skills_match: number;
  experience_match: number;
  overall_score: number;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  created_at: string;
}

export const useAIAssessment = () => {
  const [loading, setLoading] = useState(false);

  const generateAssessment = async (applicationId: string, jobRequirements: string): Promise<AIAssessment | null> => {
    try {
      setLoading(true);
      
      // Mock AI assessment - in production this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
      
      const mockAssessment: AIAssessment = {
        id: `assessment_${Date.now()}`,
        application_id: applicationId,
        cv_score: Math.floor(Math.random() * 30) + 70, // 70-100
        skills_match: Math.floor(Math.random() * 40) + 60, // 60-100
        experience_match: Math.floor(Math.random() * 35) + 65, // 65-100
        overall_score: Math.floor(Math.random() * 25) + 75, // 75-100
        recommendations: [
          "Strong technical background with relevant experience",
          "Good communication skills demonstrated in cover letter",
          "Educational background aligns well with job requirements",
          "Previous work experience shows career progression"
        ],
        strengths: [
          "Technical expertise in required technologies",
          "Strong educational background",
          "Relevant industry experience",
          "Clear career progression"
        ],
        weaknesses: [
          "Could benefit from additional certification",
          "Limited experience with specific tools mentioned",
          "May need training in company-specific processes"
        ],
        created_at: new Date().toISOString(),
      };

      return mockAssessment;
    } catch (error) {
      console.error('Error generating AI assessment:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentByApplicationId = async (applicationId: string): Promise<AIAssessment | null> => {
    // Mock implementation - in production this would fetch from database
    return null;
  };

  return {
    generateAssessment,
    getAssessmentByApplicationId,
    loading,
  };
};