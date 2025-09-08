import { Link } from "react-router-dom";
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

// Mock data for demonstration
const featuredJobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Information Technology",
    location: "Addis Ababa, Ethiopia",
    postedDate: "2024-01-15",
    expiryDate: "2024-02-15",
    description: "We are looking for an experienced software engineer to join our growing tech team. You will be responsible for developing and maintaining our digital platforms.",
    requirements: ["React", "Node.js", "5+ years experience", "TypeScript"],
    isActive: true,
  },
  {
    id: "2", 
    title: "Content Producer",
    department: "Media Production",
    location: "Bahir Dar, Ethiopia",
    postedDate: "2024-01-20",
    expiryDate: "2024-02-20",
    description: "Join our creative team as a content producer. You will work on various media projects including documentaries, news segments, and digital content.",
    requirements: ["Video Production", "Adobe Creative Suite", "Storytelling", "3+ years experience"],
    isActive: true,
  },
  {
    id: "3",
    title: "Marketing Specialist",
    department: "Marketing & Communications",
    location: "Addis Ababa, Ethiopia", 
    postedDate: "2024-01-18",
    expiryDate: "2024-02-18",
    description: "We're seeking a dynamic marketing specialist to develop and execute marketing campaigns that enhance our brand presence across various channels.",
    requirements: ["Digital Marketing", "Social Media", "Analytics", "Communication Skills"],
    isActive: true,
  },
];

const stats = [
  { icon: Briefcase, label: "Active Jobs", value: "45+" },
  { icon: Users, label: "Registered Users", value: "2,500+" },
  { icon: CheckCircle, label: "Successful Hires", value: "180+" },
  { icon: Building, label: "Departments", value: "12+" },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted py-20">
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Now Hiring - Join Our Team
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              Build Your Career with{" "}
              <span className="text-gradient">Amhara Media Corporation</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Discover exciting career opportunities in media, technology, and communications. 
              Join Ethiopia's leading media organization and make a difference in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/jobs">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Jobs
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" asChild>
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
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-soft">
                <CardContent className="pt-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg hero-gradient mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
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
              Explore our latest job openings across various departments and find your perfect role.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} {...job} />
            ))}
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
              Join a dynamic organization that values innovation, creativity, and professional growth.
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
                  Advance your career with comprehensive training programs, mentorship opportunities, 
                  and clear progression paths.
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
                  Make a meaningful difference by contributing to Ethiopia's media landscape and 
                  informing communities across the region.
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
                  Enjoy competitive benefits, flexible work arrangements, and a collaborative 
                  culture that celebrates diversity and innovation.
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
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of professionals who have built successful careers with us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                  <Link to="/register">
                    <Users className="mr-2 h-5 w-5" />
                    Create Account
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                  <Link to="/jobs">
                    Browse Opportunities
                  </Link>
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