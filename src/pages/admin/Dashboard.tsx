import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Building,
  BarChart3,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalUsers: number;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  posted_date: string;
  expiry_date: string | null;
  is_active: boolean;
  applications_count?: number;
}

const AdminDashboard = () => {
  const { profile, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [communicationsData, setCommunicationsData] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [contactStats, setContactStats] = useState<any>(null);
  const [recentContactMessages, setRecentContactMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch jobs stats
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select(
          "id, title, department, location, posted_date, expiry_date, is_active"
        );

      if (jobsError) throw jobsError;

      // Check for expired jobs and update them
      const currentDate = new Date();
      const expiredJobs = (jobs || []).filter(
        (job) =>
          job.expiry_date &&
          new Date(job.expiry_date) < currentDate &&
          job.is_active
      );

      // Update expired jobs to inactive
      if (expiredJobs.length > 0) {
        const expiredJobIds = expiredJobs.map((job) => job.id);
        const { error: updateError } = await supabase
          .from("jobs")
          .update({ is_active: false })
          .in("id", expiredJobIds);

        if (updateError) {
          console.error("Error updating expired jobs:", updateError);
        } else {
          console.log(`Automatically expired ${expiredJobs.length} jobs`);
        }
      }

      // Fetch applications count
      const { count: applicationsCount, error: applicationsError } =
        await supabase
          .from("applications")
          .select("*", { count: "exact", head: true });

      if (applicationsError) throw applicationsError;

      // Fetch users count (only for super admin)
      let usersCount = 0;
      if (isSuperAdmin) {
        const { count, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (usersError) throw usersError;
        usersCount = count || 0;
      }

      // Calculate stats
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter((job) => job.is_active).length || 0;

      setStats({
        totalJobs,
        activeJobs,
        totalApplications: applicationsCount || 0,
        totalUsers: usersCount,
      });

      // Set recent jobs (last 5)
      const sortedJobs =
        jobs
          ?.sort(
            (a, b) =>
              new Date(b.posted_date).getTime() -
              new Date(a.posted_date).getTime()
          )
          .slice(0, 5) || [];

      setRecentJobs(sortedJobs);

      // Fetch recent applications using separate queries to avoid 400 errors
      const { data: applications, error: applicationsDataError } =
        await supabase
          .from("applications")
          .select("*")
          .order("applied_date", { ascending: false })
          .limit(5);

      if (!applicationsDataError && applications && applications.length > 0) {
        // Get unique job IDs and user IDs
        const jobIds = [...new Set(applications.map((app) => app.job_id))];
        const userIds = [...new Set(applications.map((app) => app.user_id))];

        // Fetch jobs data
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, department")
          .in("id", jobIds);

        // Fetch profiles data
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        // Combine the data
        const transformedApplications = applications.map((app) => {
          const job = jobs?.find((job) => job.id === app.job_id) || {
            title: "Unknown Job",
            department: "Unknown Department",
          };

          const profile = profiles?.find(
            (profile) => profile.user_id === app.user_id
          ) || {
            first_name: "Unknown",
            last_name: "User",
          };

          return {
            ...app,
            jobs: job,
            profiles: profile,
          };
        });

        setRecentApplications(transformedApplications);
      } else {
        setRecentApplications([]);
      }

      // Fetch analytics data
      const analytics = {
        applicationsByStatus: {
          applied:
            applications?.filter((app) => app.status === "applied").length || 0,
          under_review:
            applications?.filter((app) => app.status === "under_review")
              .length || 0,
          interview:
            applications?.filter((app) => app.status === "interview").length ||
            0,
          accepted:
            applications?.filter((app) => app.status === "accepted").length ||
            0,
          rejected:
            applications?.filter((app) => app.status === "rejected").length ||
            0,
        },
        topDepartments:
          jobs?.reduce((acc: any, job) => {
            acc[job.department] = (acc[job.department] || 0) + 1;
            return acc;
          }, {}) || {},
      };
      setAnalyticsData(analytics);

      // Fetch admin users (for super admin and HR manager) using separate queries
      if (isSuperAdmin || profile?.role === "hr_manager") {
        const { data: admins, error: adminsError } = await supabase
          .from("admin_users")
          .select("*");

        if (!adminsError && admins && admins.length > 0) {
          // Get unique user IDs
          const userIds = [...new Set(admins.map((admin) => admin.user_id))];

          // Fetch profiles data
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, first_name, last_name")
            .in("user_id", userIds);

          // Combine the data
          const transformedAdmins = admins.map((admin) => {
            const profile = profiles?.find(
              (profile) => profile.user_id === admin.user_id
            ) || {
              first_name: "Unknown",
              last_name: "User",
            };

            return {
              ...admin,
              profiles: profile,
            };
          });

          setAdminUsers(transformedAdmins);
        } else {
          setAdminUsers([]);
        }
      }

      // Set communications data (placeholder for future email system)
      setCommunicationsData({
        pendingEmails: 0,
        sentToday: 0,
        templates: 0,
      });

      // Fetch contact messages data
      const { data: contactMessages, error: contactMessagesError } =
        await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false });

      if (!contactMessagesError && contactMessages) {
        // Calculate contact stats
        const total = contactMessages.length;
        const newMessages = contactMessages.filter(
          (m) => m.status === "new"
        ).length;
        const replied = contactMessages.filter(
          (m) => m.status === "replied"
        ).length;

        // Calculate this week's messages
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeek = contactMessages.filter(
          (m) => new Date(m.created_at) >= oneWeekAgo
        ).length;

        setContactStats({
          total,
          new: newMessages,
          replied,
          thisWeek,
        });

        // Set recent contact messages (last 5)
        setRecentContactMessages(contactMessages.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteJob = (job: Job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job deleted successfully.",
      });

      setShowDeleteDialog(false);
      setJobToDelete(null);
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.first_name || "Admin"}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? "Super Administrator" : "HR Administrator"}{" "}
            Dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} active positions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Applications
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-muted-foreground">
                Total applications received
              </p>
            </CardContent>
          </Card>

          {isSuperAdmin && (
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">From last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
            {(isSuperAdmin || profile?.role === "hr_manager") && (
              <TabsTrigger value="users">User Management</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Jobs</h2>
              <Button asChild>
                <Link to="/admin/jobs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {recentJobs.map((job) => (
                <Card key={job.id} className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Building className="mr-1 h-4 w-4" />
                            {job.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {formatDate(job.posted_date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={job.is_active ? "default" : "secondary"}
                        >
                          {job.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/jobs/${job.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/jobs/${job.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteJob(job)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" asChild>
                <Link to="/admin/jobs">View All Jobs</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Applications</h2>
              <Button asChild>
                <Link to="/admin/applications">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Applications
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {recentApplications.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Applications Yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        No applications have been submitted yet.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                recentApplications.map((application) => (
                  <Card key={application.id} className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">
                            {application.jobs?.title || "Unknown Job"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {application.profiles?.first_name}{" "}
                            {application.profiles?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Applied {formatDate(application.applied_date)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              application.status === "accepted"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : application.status === "interview"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {application.status.replace("_", " ")}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/admin/applications">View</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Analytics Overview</h2>
              <Button asChild>
                <Link to="/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Full Analytics
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Application Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.applicationsByStatus &&
                      Object.entries(analyticsData.applicationsByStatus).map(
                        ([status, count]) => (
                          <div
                            key={status}
                            className="flex items-center justify-between"
                          >
                            <span className="capitalize">
                              {status.replace("_", " ")}
                            </span>
                            <Badge variant="outline">{count as number}</Badge>
                          </div>
                        )
                      )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Top Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.topDepartments &&
                      Object.entries(analyticsData.topDepartments)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 5)
                        .map(([department, count]) => (
                          <div
                            key={department}
                            className="flex items-center justify-between"
                          >
                            <span>{department}</span>
                            <Badge variant="outline">
                              {count as number} jobs
                            </Badge>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="communications">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Communications Overview</h2>
              <Button asChild>
                <Link to="/admin/communications">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Manage Communications
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Pending Emails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {communicationsData?.pendingEmails || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Sent Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {communicationsData?.sentToday || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Emails sent</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {communicationsData?.templates || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available templates
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Contact Messages Overview</h2>
              <Button asChild>
                <Link to="/admin/contacts">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Manage Contact Messages
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contactStats?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time messages
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>New Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {contactStats?.new || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unread messages
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Replied</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {contactStats?.replied || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Messages with replies
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contactStats?.thisWeek || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Messages this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Contact Messages */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recent Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {recentContactMessages && recentContactMessages.length > 0 ? (
                  <div className="space-y-4">
                    {recentContactMessages.slice(0, 5).map((message) => (
                      <div
                        key={message.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                message.status === "new"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {message.status}
                            </Badge>
                            <h4 className="font-semibold">{message.subject}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            From: {message.name} ({message.email})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Department: {message.department} •{" "}
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/admin/contacts">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No contact messages yet
                    </h3>
                    <p className="text-muted-foreground">
                      Contact messages from users will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {(isSuperAdmin || profile?.role === "hr_manager") && (
            <TabsContent value="users">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Admin Users</h2>
                <Button asChild>
                  <Link to="/admin/users">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Admins
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {adminUsers.length === 0 ? (
                  <Card className="shadow-soft">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Admin Users
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          No administrator accounts found.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  adminUsers.map((admin) => (
                    <Card key={admin.id} className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">
                              {admin.profiles?.first_name}{" "}
                              {admin.profiles?.last_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {admin.role}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created {formatDate(admin.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                admin.role === "super_admin"
                                  ? "default"
                                  : admin.role === "admin"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {admin.role.replace("_", " ")}
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link to="/admin/users">Manage</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Delete Job Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job "{jobToDelete?.title}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteJob}>
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
