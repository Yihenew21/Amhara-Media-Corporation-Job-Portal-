import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAIAssessment, AIAssessment } from "@/hooks/useAIAssessment";
import {
  Brain,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Award,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface AIAssessmentCardProps {
  applicationId: string;
  jobRequirements: string;
  onAssessmentGenerated?: (assessment: AIAssessment) => void;
}

const AIAssessmentCard = ({ applicationId, jobRequirements, onAssessmentGenerated }: AIAssessmentCardProps) => {
  const { generateAssessment, loading } = useAIAssessment();
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);

  const handleGenerateAssessment = async () => {
    const result = await generateAssessment(applicationId, jobRequirements);
    if (result) {
      setAssessment(result);
      onAssessmentGenerated?.(result);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "default" as const, label: "Excellent" };
    if (score >= 80) return { variant: "secondary" as const, label: "Good" };
    if (score >= 70) return { variant: "outline" as const, label: "Fair" };
    return { variant: "destructive" as const, label: "Poor" };
  };

  if (!assessment) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            AI Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Generate AI Assessment</h3>
          <p className="text-muted-foreground mb-6">
            Use AI to analyze this candidate's CV and match it against job requirements.
          </p>
          <Button onClick={handleGenerateAssessment} disabled={loading}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Analyzing CV...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Assessment
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const scoreBadge = getScoreBadge(assessment.overall_score);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            AI Assessment
          </CardTitle>
          <Badge variant={scoreBadge.variant}>
            {scoreBadge.label} ({assessment.overall_score}%)
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center">
            <Target className="mr-2 h-4 w-4" />
            Score Breakdown
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">CV Quality</span>
              <div className="flex items-center space-x-2">
                <Progress value={assessment.cv_score} className="w-20" />
                <span className={`text-sm font-medium ${getScoreColor(assessment.cv_score)}`}>
                  {assessment.cv_score}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Skills Match</span>
              <div className="flex items-center space-x-2">
                <Progress value={assessment.skills_match} className="w-20" />
                <span className={`text-sm font-medium ${getScoreColor(assessment.skills_match)}`}>
                  {assessment.skills_match}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Experience Match</span>
              <div className="flex items-center space-x-2">
                <Progress value={assessment.experience_match} className="w-20" />
                <span className={`text-sm font-medium ${getScoreColor(assessment.experience_match)}`}>
                  {assessment.experience_match}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            Strengths
          </h4>
          <ul className="space-y-1">
            {assessment.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <CheckCircle className="mr-2 h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center text-yellow-600">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Areas for Improvement
          </h4>
          <ul className="space-y-1">
            {assessment.weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <AlertTriangle className="mr-2 h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                {weakness}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center text-blue-600">
            <Lightbulb className="mr-2 h-4 w-4" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {assessment.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <Lightbulb className="mr-2 h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>

        {/* Overall Recommendation */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Overall Recommendation:</span>
            <Badge variant={assessment.overall_score >= 85 ? "default" : assessment.overall_score >= 70 ? "secondary" : "outline"}>
              {assessment.overall_score >= 85 ? "Highly Recommended" : 
               assessment.overall_score >= 70 ? "Recommended" : "Consider"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssessmentCard;