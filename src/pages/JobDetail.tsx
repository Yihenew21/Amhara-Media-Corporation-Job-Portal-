import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

// Mock job data - In real app, this would come from your backend
const jobData = {
  id: "1",
  title: "Senior Software Engineer",
  department: "Information Technology",
  location: "Addis Ababa, Ethiopia",
  postedDate: "2024-01-15",
  expiryDate: "2024-02-15",
  description: `We are looking for an experienced software engineer to join our growing tech team. You will be responsible for developing and maintaining our digital platforms, working with modern technologies like React, Node.js, and cloud services.

As a Senior Software Engineer at Amhara Media Corporation, you will play a crucial role in building scalable web applications that serve millions of users across Ethiopia and beyond. You'll work closely with cross-functional teams including designers, product managers, and other engineers to deliver high-quality software solutions.

Key responsibilities include architecting and implementing new features, optimizing application performance, mentoring junior developers, and ensuring code quality through reviews and testing. You'll also have the opportunity to influence technical decisions and contribute to our engineering culture.`,
  requirements: [
    "Bachelor's degree in Computer Science or related field",
    "5+ years of experience in software development",
    "Proficiency in React, Node.js, and TypeScript",
    "Experience with cloud platforms (AWS, Azure, or GCP)",
    "Strong understanding of database design and optimization",
    "Experience with Docker and containerization",
    "Knowledge of CI/CD pipelines and DevOps practices",
    "Excellent problem-solving and communication skills",
    "Experience with agile development methodologies",
    "Understanding of software security best practices"
  ],
  responsibilities: [
    "Design and develop scalable web applications using modern technologies",
    "Collaborate with product teams to translate requirements into technical solutions",
    "Write clean, maintainable, and well-documented code",
    "Participate in code reviews and ensure quality standards",
    "Mentor junior developers and provide technical guidance",
    "Optimize application performance and scalability",
    "Stay up-to-date with emerging technologies and industry trends",
    "Participate in architectural decisions and technical planning"
  ],
  benefits: [
    "Competitive salary and performance bonuses",
    "Health insurance for employee and family",
    "Professional development opportunities",
    "Flexible working hours and remote work options",
    "Modern office environment with latest technology",
    "Annual leave and sick leave benefits",
    "Transportation allowance",
    "Career advancement opportunities"
  ],
  isActive: true,
};

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { getJobById, applyToJob, hasUserApplied } = useJobs();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      setLoading(true);
      const jobData = await getJobById(id);
      setJob(jobData);
      
      if (jobData && user) {
        const applied = await hasUserApplied(id);
        setHasApplied(applied);
      }
      
      setLoading(false);
    };

    fetchJob();
  }, [id, getJobById, hasUserApplied, user]);

  const handleApply = () => {
    if (!user) {
      navigate('/login');
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
          description: "We'll review your application and get back to you soon.",
        });
        setShowApplicationModal(false);
        setHasApplied(true);
      } else {
        toast({
          title: "Application failed",
          description: result.error || "Failed to submit application. Please try again.",
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
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
    return new Date(jobData.expiryDate) < new Date();
  };

  const daysUntilExpiry = () => {
    const expiryTime = new Date(jobData.expiryDate).getTime();
    const now = new Date().getTime();
    return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
  };

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
                <h1 className="text-3xl font-bold mb-3">{jobData.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    {jobData.department}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    {jobData.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Posted {formatDate(jobData.postedDate)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isExpired() ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <>
                      <Badge variant="secondary" className="bg-success text-success-foreground">
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
            {!isExpired() && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="flex-1 sm:flex-none" asChild>
                  <Link to={`/jobs/${id}/apply`}>
                    <Users className="mr-2 h-5 w-5" />
                    Apply for this Position
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/register">
                    Create Account to Apply
                  </Link>
                </Button>
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
                  {jobData.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Responsibilities */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Key Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {jobData.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Requirements & Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {jobData.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-3 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply */}
            {!isExpired() && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Apply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" asChild>
                    <Link to={`/jobs/${id}/apply`}>
                      Apply Now
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Application deadline: {formatDate(jobData.expiryDate)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Benefits & Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {jobData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="mr-2 h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">About Amhara Media Corporation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Amhara Media Corporation is a leading media organization in Ethiopia, 
                  committed to delivering quality news, entertainment, and educational content 
                  to our diverse audience.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/about">
                    Learn More About Us
                  </Link>
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