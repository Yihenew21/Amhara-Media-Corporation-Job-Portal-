import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
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
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch jobs stats
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, department, location, posted_date, expiry_date, is_active');

      if (jobsError) throw jobsError;

      // Fetch applications count
      const { count: applicationsCount, error: applicationsError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      if (applicationsError) throw applicationsError;

      // Fetch users count (only for super admin)
      let usersCount = 0;
      if (isSuperAdmin) {
        const { count, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;
        usersCount = count || 0;
      }

      // Calculate stats
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(job => job.is_active).length || 0;

      setStats({
        totalJobs,
        activeJobs,
        totalApplications: applicationsCount || 0,
        totalUsers: usersCount,
      });

      // Set recent jobs (last 5)
      const sortedJobs = jobs?.sort((a, b) => 
        new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime()
      ).slice(0, 5) || [];

      setRecentJobs(sortedJobs);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
            Welcome back, {profile?.first_name || 'Admin'}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Super Administrator' : 'HR Administrator'} Dashboard
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
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Total applications received
              </p>
            </CardContent>
          </Card>

          {isSuperAdmin && (
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
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
              <p className="text-xs text-muted-foreground">
                From last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
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
                        <Badge variant={job.is_active ? "default" : "secondary"}>
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
                          <Button variant="outline" size="sm">
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
              <h2 className="text-2xl font-bold">Application Management</h2>
              <Button asChild>
                <Link to="/admin/applications">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Applications
                </Link>
              </Button>
            </div>
            
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Manage Applications</h3>
                  <p className="text-muted-foreground mb-4">
                    Review and manage job applications from candidates
                  </p>
                  <Button asChild>
                    <Link to="/admin/applications">
                      View Application Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="users">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    User management interface coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;