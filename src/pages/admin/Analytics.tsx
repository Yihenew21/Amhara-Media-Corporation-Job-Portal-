import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useExport } from "@/hooks/useExport";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
} from "lucide-react";

interface AnalyticsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalUsers: number;
  monthlyStats: {
    month: string;
    jobs: number;
    applications: number;
    users: number;
  }[];
  departmentStats: {
    department: string;
    jobCount: number;
    applicationCount: number;
  }[];
  applicationStatusStats: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

const Analytics = () => {
  const navigate = useNavigate();
  const { exportAnalyticsReport, exportJobsReport, loading: exportLoading } = useExport();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    monthlyStats: [],
    departmentStats: [],
    applicationStatusStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch jobs data
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      if (jobsError) throw jobsError;

      // Fetch applications data
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*');

      if (applicationsError) throw applicationsError;

      // Fetch users data
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Calculate basic stats
      const totalJobs = jobs?.length || 0;
      const activeJobs = jobs?.filter(job => job.is_active).length || 0;
      const totalApplications = applications?.length || 0;
      const totalUsers = usersCount || 0;

      // Generate monthly stats (mock data for demo)
      const monthlyStats = [
        { month: 'Jan', jobs: 12, applications: 45, users: 23 },
        { month: 'Feb', jobs: 15, applications: 67, users: 34 },
        { month: 'Mar', jobs: 18, applications: 89, users: 45 },
        { month: 'Apr', jobs: 22, applications: 123, users: 67 },
        { month: 'May', jobs: 25, applications: 156, users: 89 },
        { month: 'Jun', jobs: 28, applications: 189, users: 112 },
      ];

      // Calculate department stats
      const departmentCounts = jobs?.reduce((acc: any, job) => {
        acc[job.department] = (acc[job.department] || 0) + 1;
        return acc;
      }, {}) || {};

      const departmentStats = Object.entries(departmentCounts).map(([department, jobCount]) => {
        const applicationCount = applications?.filter(app => 
          jobs?.find(job => job.id === app.job_id)?.department === department
        ).length || 0;
        
        return {
          department,
          jobCount: jobCount as number,
          applicationCount,
        };
      });

      // Calculate application status stats
      const statusCounts = applications?.reduce((acc: any, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const applicationStatusStats = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: count as number,
        percentage: Math.round(((count as number) / totalApplications) * 100) || 0,
      }));

      setAnalytics({
        totalJobs,
        activeJobs,
        totalApplications,
        totalUsers,
        monthlyStats,
        departmentStats,
        applicationStatusStats,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <div className="flex items-center mb-4">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into recruitment performance
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={exportJobsReport}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Jobs
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={exportAnalyticsReport}
                disabled={exportLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalJobs}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalApplications}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +23% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeJobs}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                -5% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +18% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Monthly Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.monthlyStats.map((stat, index) => (
                      <div key={stat.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stat.month}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-blue-600">{stat.jobs} jobs</span>
                          <span className="text-green-600">{stat.applications} apps</span>
                          <span className="text-purple-600">{stat.users} users</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5" />
                    Application Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.applicationStatusStats.map((stat) => (
                      <div key={stat.status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(stat.status)}>
                            {stat.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{stat.count}</span>
                          <span className="text-xs text-muted-foreground">({stat.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.departmentStats.map((dept) => (
                    <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{dept.department}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dept.jobCount} jobs posted
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{dept.applicationCount}</div>
                        <p className="text-xs text-muted-foreground">applications</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Application Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.applicationStatusStats.find(s => s.status === 'accepted')?.count || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Hired</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.applicationStatusStats.find(s => s.status === 'interview')?.count || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Interviews</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analytics.applicationStatusStats.find(s => s.status === 'under_review')?.count || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Under Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Recruitment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Peak Application Days</h3>
                      <p className="text-sm text-muted-foreground">Monday and Tuesday see 40% more applications</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Average Time to Hire</h3>
                      <p className="text-sm text-muted-foreground">14 days from application to offer</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Most Popular Positions</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Software Engineer</span>
                        <span className="text-muted-foreground">45 applications</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Content Producer</span>
                        <span className="text-muted-foreground">38 applications</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Marketing Specialist</span>
                        <span className="text-muted-foreground">32 applications</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;