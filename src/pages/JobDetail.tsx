import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useJobs, Job } from "@/hooks/useJobs";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Building,
  Users,
  CheckCircle,
  Share2,
  BookmarkPlus,
  Upload,
  FileText,
  DollarSign,
  Briefcase,
} from "lucide-react";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAdmin } = useAuth();
  const { getJobById, applyToJob, hasUserApplied } = useJobs();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      console.log("JobDetail: Fetching job with ID:", id);
      setLoading(true);
      const jobData = await getJobById(id);
      console.log("JobDetail: Received job data:", jobData);
      setJob(jobData);

      if (jobData && user) {
        try {
          const applied = await hasUserApplied(id);
          setHasApplied(applied);
        } catch (error) {
          console.warn("Error checking application status:", error);
          setHasApplied(false);
        }
      }

      setLoading(false);
    };

    fetchJob();
  }, [id]); // Only depend on id to prevent infinite loop

  const handleApply = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!job || !cvFile) return;

    setIsSubmitting(true);

    try {
      const result = await applyToJob(job.id, coverLetter, cvFile);

      if (result.success) {
        toast({
          title: "Application submitted successfully!",
          description:
            "We'll review your application and get back to you soon.",
        });
        setShowApplicationModal(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isExpired = () => {
    if (!job || !job.expiry_date) return false;
    // Create date objects and compare only the date part (ignore time)
    const expiryDate = new Date(job.expiry_date);
    const today = new Date();

    // Set time to start of day for both dates to compare only dates
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return expiryDate < today;
  };

  const daysUntilExpiry = () => {
    if (!job || !job.expiry_date) return 0;
    const expiryDate = new Date(job.expiry_date);
    const today = new Date();

    // Set time to start of day for both dates
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-64 bg-muted rounded" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-48 bg-muted rounded" />
                <div className="h-48 bg-muted rounded" />
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen py-8">
        <div className="container max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
        </div>

        {/* Job Header */}
        <Card className="mb-8 shadow-medium">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    {job.department}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Posted {formatDate(job.posted_date)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isExpired() ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <>
                      <Badge
                        variant="secondary"
                        className="bg-success text-success-foreground"
                      >
                        Active
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {daysUntilExpiry()} days left
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Save Job
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isExpired() && !isAdmin && (
              <div className="flex flex-col sm:flex-row gap-3">
                {user ? (
                  <Button size="lg" className="flex-1 sm:flex-none" asChild>
                    <Link to={`/jobs/${id}/apply`}>
                      <Users className="mr-2 h-5 w-5" />
                      Apply for this Position
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="flex-1 sm:flex-none" asChild>
                      <Link to="/login">
                        <Users className="mr-2 h-5 w-5" />
                        Login to Apply
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/register">Create Account to Apply</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {job.description.split("\n\n").map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Responsibilities */}
            {job.key_responsibilities && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Key Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {job.key_responsibilities
                      .split("\n")
                      .filter(Boolean)
                      .map((responsibility, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="mr-3 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {responsibility}
                          </span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Requirements & Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {job.requirements
                    .split("\n")
                    .filter(Boolean)
                    .map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="mr-3 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {requirement}
                        </span>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply */}
            {!isExpired() && !isAdmin && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Apply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <Button className="w-full" asChild>
                      <Link to={`/jobs/${id}/apply`}>Apply Now</Link>
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <Link to="/login">Login to Apply</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/register">Create Account</Link>
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground text-center">
                    Application deadline: {formatDate(job.expiry_date)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits
                      .split("\n")
                      .filter(Boolean)
                      .map((benefit, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="mr-2 h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {benefit}
                          </span>
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Company Info */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">
                  About Amhara Media Corporation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Amhara Media Corporation is a leading media organization in
                  Ethiopia, committed to delivering quality news, entertainment,
                  and educational content to our diverse audience.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/about">Learn More About Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
