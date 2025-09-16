import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useJobs } from "@/hooks/useJobs";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const JobApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const { getJobById, applyToJob, hasUserApplied } = useJobs();
  const { toast } = useToast();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isAdmin) {
      navigate("/admin");
      return;
    }

    fetchJobAndApplicationStatus();
  }, [id, user, isAdmin]);

  const fetchJobAndApplicationStatus = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [jobData, applicationStatus] = await Promise.all([
        getJobById(id),
        hasUserApplied(id),
      ]);

      setJob(jobData);
      setHasApplied(applicationStatus);
    } catch (error) {
      console.error("Error fetching job data:", error);
      toast({
        title: "Error",
        description: "Failed to load job details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setCvFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cvFile) {
      toast({
        title: "CV Required",
        description: "Please upload your CV to apply for this position.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await applyToJob(id, coverLetter, cvFile);

      if (result.success) {
        toast({
          title: "Application submitted successfully!",
          description:
            "We'll review your application and get back to you soon.",
        });
        setHasApplied(true);
      } else {
        toast({
          title: "Application failed",
          description:
            result.error || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Application failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Job not found</h2>
            <p className="text-muted-foreground mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Other Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasApplied) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-2xl">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link to={`/jobs/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job Details
              </Link>
            </Button>
          </div>

          <Card className="text-center shadow-medium">
            <CardContent className="py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-4">
                Application Submitted!
              </h1>
              <p className="text-muted-foreground mb-6">
                You have already applied for this position. We'll review your
                application and contact you if you're selected for the next
                stage.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to="/jobs">Browse Other Jobs</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/jobs/${id}`}>View Job Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" asChild>
              <Link to={`/jobs/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job Details
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Apply for Position
          </h1>
          <p className="text-muted-foreground">{job.title}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information (Pre-filled) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Personal Information
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={profile?.first_name || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={profile?.last_name || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={user?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={profile?.phone || "Not provided"}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CV Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Upload Your CV *</h3>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                        <div className="space-y-2">
                          <Label htmlFor="cv-upload" className="cursor-pointer">
                            <span className="text-primary hover:underline">
                              Click to upload your CV
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              or drag and drop
                            </span>
                          </Label>
                          <Input
                            id="cv-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <p className="text-xs text-muted-foreground">
                            PDF, DOC, or DOCX (max 5MB)
                          </p>
                        </div>
                      </div>
                      {cvFile && (
                        <div className="mt-4 p-3 bg-muted rounded-lg flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-2" />
                          <span className="text-sm font-medium">
                            {cvFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCvFile(null)}
                            className="ml-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-2">
                    <Label htmlFor="cover-letter">
                      Cover Letter (Optional)
                    </Label>
                    <Textarea
                      id="cover-letter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !cvFile}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Job Summary Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Position
                  </h4>
                  <p className="font-medium">{job.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Department
                  </h4>
                  <p>{job.department}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Location
                  </h4>
                  <p>{job.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Employment Type
                  </h4>
                  <p className="capitalize">
                    {job.employment_type.replace("_", " ")}
                  </p>
                </div>
                {job.salary_range && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Salary Range
                    </h4>
                    <p>{job.salary_range}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Application Tips:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Ensure your CV is up-to-date</li>
                  <li>• Tailor your cover letter to this role</li>
                  <li>• Double-check all information before submitting</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplication;
