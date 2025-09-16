import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/useNotifications";
import { useExport } from "@/hooks/useExport";
import AIAssessmentCard from "@/components/AIAssessmentCard";
import {
  Search,
  Filter,
  Download,
  Eye,
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  FileText,
  Mail,
  Brain,
  Send,
} from "lucide-react";

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  cover_letter: string | null;
  cv_file_name: string | null;
  cv_file_path: string | null;
  status: "applied" | "under_review" | "interview" | "rejected" | "accepted";
  applied_date: string;
  job: {
    title: string;
    department: string;
  };
  profile: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
  user_email: string;
}

const ApplicationManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendStatusUpdateEmail, loading: emailLoading } = useNotifications();
  const { exportApplicationsReport, loading: exportLoading } = useExport();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupBy, setGroupBy] = useState<"none" | "job" | "department">("none");
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showAssessment, setShowAssessment] = useState<string | null>(null);
  const [showCVModal, setShowCVModal] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      console.log("Starting to fetch applications...");

      // Fetch applications first
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .order("applied_date", { ascending: false });

      if (appsError) {
        console.error("Error fetching applications:", appsError);
        throw appsError;
      }

      console.log("Fetched applications:", apps);

      if (!apps || apps.length === 0) {
        console.log("No applications found");
        setApplications([]);
        return;
      }

      // Get unique job IDs and user IDs
      const jobIds = [...new Set(apps.map((app) => app.job_id))];
      const userIds = [...new Set(apps.map((app) => app.user_id))];

      console.log("Job IDs:", jobIds);
      console.log("User IDs:", userIds);

      // Fetch jobs data
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, department, location, number_of_positions")
        .in("id", jobIds);

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
      }

      console.log("Fetched jobs:", jobs);

      // Fetch profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, phone")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      console.log("Fetched profiles:", profiles);

      // Fetch user emails from auth.users (this requires a server function in production)
      // For now, we'll create a mapping of user IDs to emails
      const userEmailMap: { [key: string]: string } = {};

      // In a real application, you'd call a server function to get emails
      // For now, we'll use a placeholder that shows the user ID
      userIds.forEach((userId) => {
        userEmailMap[userId] = `user-${userId.slice(-8)}@example.com`;
      });

      // Combine the data
      const transformedApplications = apps.map((app) => {
        const job = jobs?.find((job) => job.id === app.job_id) || {
          title: "Unknown Job",
          department: "Unknown Department",
          location: "Unknown Location",
        };

        const profile = profiles?.find(
          (profile) => profile.user_id === app.user_id
        ) || {
          first_name: "Unknown",
          last_name: "User",
          phone: null,
        };

        return {
          ...app,
          job,
          profile,
          user_email:
            userEmailMap[app.user_id] ||
            `user-${app.user_id.slice(-8)}@example.com`,
        };
      });

      // For now, show all applications until the number_of_positions field is added to the database
      // TODO: Re-enable position-based filtering after running the migration
      const filteredApplications = transformedApplications;

      // Future filtering logic (commented out until database migration is complete):
      /*
      const filteredApplications = transformedApplications.filter((app) => {
        const job = jobs?.find((job) => job.id === app.job_id);
        
        // If no job found or no position limit set, show all applications
        if (!job || !job.number_of_positions || job.number_of_positions === 0) {
          return true;
        }

        // Count accepted applications for this job
        const acceptedCount = transformedApplications.filter(
          (otherApp) =>
            otherApp.job_id === app.job_id && otherApp.status === "accepted"
        ).length;

        // Show applications if positions are not yet filled
        return acceptedCount < job.number_of_positions;
      });
      */

      console.log(
        "Filtered applications (positions not filled):",
        filteredApplications
      );
      setApplications(filteredApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: `Failed to fetch applications: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${app.profile.first_name} ${app.profile.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const groupApplications = () => {
    if (groupBy === "none") {
      return { "All Applications": filteredApplications };
    }

    const grouped: { [key: string]: Application[] } = {};

    filteredApplications.forEach((app) => {
      let groupKey: string;

      if (groupBy === "job") {
        groupKey = app.job.title;
      } else if (groupBy === "department") {
        groupKey = app.job.department;
      } else {
        groupKey = "All Applications";
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(app);
    });

    return grouped;
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const application = applications.find((app) => app.id === applicationId);
      if (!application) return;

      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      // Send status update email
      const candidateName = `${application.profile.first_name} ${application.profile.last_name}`;
      await sendStatusUpdateEmail(
        application.user_email,
        candidateName,
        application.job.title,
        newStatus
      );

      toast({
        title: "Success",
        description:
          "Application status updated and candidate notified via email.",
      });

      fetchApplications();
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportApplications = async () => {
    const result = await exportApplicationsReport();
    if (result.success) {
      toast({
        title: "Export Successful",
        description: "Applications report has been downloaded.",
      });
    } else {
      toast({
        title: "Export Failed",
        description: result.error || "Failed to export applications.",
        variant: "destructive",
      });
    }
  };

  const downloadCV = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast({
        title: "Error",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewCV = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(filePath, 60); // 60 seconds expiry

      if (error) throw error;

      setCvUrl(data.signedUrl);
      setShowCVModal(fileName);
    } catch (error) {
      console.error("Error viewing CV:", error);
      toast({
        title: "Error",
        description: "Failed to load CV for viewing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Application Management
              </h1>
              <p className="text-muted-foreground">
                Review and manage job applications from candidates
              </p>
            </div>
            <Button
              onClick={handleExportApplications}
              disabled={exportLoading}
              variant="outline"
            >
              {exportLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Search & Filter Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by job title, candidate name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={groupBy}
                onValueChange={(value: "none" | "job" | "department") =>
                  setGroupBy(value)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="job">Group by Job</SelectItem>
                  <SelectItem value="department">
                    Group by Department
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <Card className="text-center py-12 shadow-soft">
              <CardContent>
                <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No applications found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search criteria."
                    : "No applications have been submitted yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupApplications()).map(
              ([groupName, groupApplications]) => (
                <div key={groupName} className="space-y-4">
                  {groupBy !== "none" && (
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{groupName}</h2>
                      <Badge variant="outline" className="text-sm">
                        {groupApplications.length} application
                        {groupApplications.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-4">
                    {groupApplications.map((application) => (
                      <Card key={application.id} className="shadow-soft">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {application.job.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {application.job.department}
                                  </p>
                                  {groupBy === "department" && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {application.job.location}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  className={getStatusColor(application.status)}
                                >
                                  {application.status
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <User className="mr-2 h-4 w-4" />
                                  {application.profile.first_name}{" "}
                                  {application.profile.last_name}
                                </div>
                                <div className="flex items-center">
                                  <Mail className="mr-2 h-4 w-4" />
                                  {application.user_email}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Applied {formatDate(application.applied_date)}
                                </div>
                              </div>

                              {application.cover_letter && (
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="text-sm font-medium mb-1">
                                    Cover Letter:
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {application.cover_letter}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {application.cv_file_path && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      viewCV(
                                        application.cv_file_path!,
                                        application.cv_file_name!
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      downloadCV(
                                        application.cv_file_path!,
                                        application.cv_file_name!
                                      )
                                    }
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}

                              <Select
                                value={application.status}
                                onValueChange={(value) =>
                                  updateApplicationStatus(application.id, value)
                                }
                                disabled={emailLoading}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="applied">
                                    Applied
                                  </SelectItem>
                                  <SelectItem value="under_review">
                                    Under Review
                                  </SelectItem>
                                  <SelectItem value="interview">
                                    Interview
                                  </SelectItem>
                                  <SelectItem value="accepted">
                                    Accepted
                                  </SelectItem>
                                  <SelectItem value="rejected">
                                    Rejected
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setShowAssessment(
                                    showAssessment === application.id
                                      ? null
                                      : application.id
                                  )
                                }
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* AI Assessment */}
                          {showAssessment === application.id && (
                            <div className="mt-4 pt-4 border-t">
                              <AIAssessmentCard
                                applicationId={application.id}
                                jobRequirements="React, Node.js, TypeScript, 5+ years experience" // In production, get from job data
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* CV Viewing Modal */}
        {showCVModal && cvUrl && (
          <Dialog
            open={!!showCVModal}
            onOpenChange={() => setShowCVModal(null)}
          >
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>CV: {showCVModal}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={cvUrl}
                  className="w-full h-[60vh] border rounded"
                  title={`CV: ${showCVModal}`}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (showCVModal) {
                      const application = applications.find(
                        (app) => app.cv_file_name === showCVModal
                      );
                      if (application) {
                        downloadCV(
                          application.cv_file_path!,
                          application.cv_file_name!
                        );
                      }
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setShowCVModal(null)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;
