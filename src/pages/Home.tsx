import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Building,
  Globe,
  Award,
  TrendingUp,
} from "lucide-react";
import JobCard from "@/components/JobCard";
import { useJobs } from "@/hooks/useJobs";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const { jobs, loading, error } = useJobs();
  const [stats, setStats] = useState([
    { icon: Briefcase, label: "Active Jobs", value: "0" },
    { icon: Users, label: "Registered Users", value: "0" },
    { icon: CheckCircle, label: "Successful Hires", value: "0" },
    { icon: Building, label: "Departments", value: "0" },
  ]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);

        // Fetch active jobs count
        const { count: activeJobsCount, error: jobsError } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        if (jobsError) throw jobsError;

        // Fetch total users count
        const { count: totalUsersCount, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (usersError) throw usersError;

        // Fetch successful hires (accepted applications)
        const { count: successfulHiresCount, error: hiresError } =
          await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("status", "accepted");

        if (hiresError) throw hiresError;

        // Fetch unique departments count
        const { data: departmentsData, error: departmentsError } =
          await supabase
            .from("jobs")
            .select("department")
            .eq("is_active", true);

        if (departmentsError) throw departmentsError;

        const uniqueDepartments = new Set(
          departmentsData?.map((job) => job.department) || []
        ).size;

        // Update stats with real data
        setStats([
          {
            icon: Briefcase,
            label: "Active Jobs",
            value: `${activeJobsCount || 0}`,
          },
          {
            icon: Users,
            label: "Registered Users",
            value: `${totalUsersCount || 0}`,
          },
          {
            icon: CheckCircle,
            label: "Successful Hires",
            value: `${successfulHiresCount || 0}`,
          },
          {
            icon: Building,
            label: "Departments",
            value: `${uniqueDepartments}`,
          },
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Keep default values on error
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Get the first 3 active jobs for featured section
  const featuredJobs = jobs.filter((job) => job.is_active).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-20 mb-10"
        style={{
          backgroundImage: "url(/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-black/10 text-primary border-primary/20 hover:text-white">
              Now Hiring - Join Our Team
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl text-white">
              Build Your Career with{" "}
              <span className="text-gradient">Amhara Media Corporation</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
              Discover exciting career opportunities in media, technology, and
              communications. Join Ethiopia's leading media organization and
              make a difference in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/jobs">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Jobs
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8"
                asChild
              >
                <Link to="/about">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsLoading
              ? // Loading skeleton for stats
                [...Array(4)].map((_, index) => (
                  <Card key={index} className="text-center shadow-soft">
                    <CardContent className="pt-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg hero-gradient mb-4">
                        <div className="h-6 w-6 bg-white/20 animate-pulse rounded" />
                      </div>
                      <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4 mx-auto" />
                    </CardContent>
                  </Card>
                ))
              : stats.map((stat, index) => (
                  <Card key={index} className="text-center shadow-soft">
                    <CardContent className="pt-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg hero-gradient mb-4">
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Featured Job Opportunities
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore our latest job openings across various departments and
              find your perfect role.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, i) => (
                <Card key={i} className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted animate-pulse rounded w-20" />
                        <div className="h-6 bg-muted animate-pulse rounded w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  Unable to load featured jobs
                </p>
              </div>
            ) : featuredJobs.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  No active job postings at the moment
                </p>
              </div>
            ) : (
              featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  department={job.department}
                  location={job.location}
                  postedDate={job.posted_date}
                  description={job.description}
                  requirements={job.requirements.split("\n").filter(Boolean)}
                  keyResponsibilities={
                    job.key_responsibilities
                      ? job.key_responsibilities.split("\n").filter(Boolean)
                      : []
                  }
                  expiryDate={job.expiry_date}
                  isActive={job.is_active}
                  numberOfPositions={job.number_of_positions}
                />
              ))
            )}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/jobs">
                View All Jobs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Why Choose Amhara Media Corporation?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join a dynamic organization that values innovation, creativity,
              and professional growth.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg hero-gradient mb-2">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Career Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advance your career with comprehensive training programs,
                  mentorship opportunities, and clear progression paths.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg hero-gradient mb-2">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Impact & Purpose</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Make a meaningful difference by contributing to Ethiopia's
                  media landscape and informing communities across the region.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg hero-gradient mb-2">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Benefits & Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enjoy competitive benefits, flexible work arrangements, and a
                  collaborative culture that celebrates diversity and
                  innovation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="shadow-medium hero-gradient text-white">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of professionals who have built successful
                careers with us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8"
                  asChild
                >
                  <Link to="/register">
                    <Users className="mr-2 h-5 w-5" />
                    Create Account
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  asChild
                >
                  <Link to="/jobs">Browse Opportunities</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
