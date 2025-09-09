import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, MapPin, Building, Calendar, Briefcase, SlidersHorizontal } from "lucide-react";
import JobCard from "@/components/JobCard";
import { useJobs } from "@/hooks/useJobs";

// Mock job data
const allJobs = [
  {
    id: "1",
    title: "Senior Software Engineer",
    department: "Information Technology",
    location: "Addis Ababa, Ethiopia",
    postedDate: "2024-01-15",
    expiryDate: "2024-02-15",
    description: "We are looking for an experienced software engineer to join our growing tech team. You will be responsible for developing and maintaining our digital platforms, working with modern technologies like React, Node.js, and cloud services.",
    requirements: ["React", "Node.js", "5+ years experience", "TypeScript", "AWS", "Docker"],
    isActive: true,
  },
  {
    id: "2",
    title: "Content Producer",
    department: "Media Production",
    location: "Bahir Dar, Ethiopia",
    postedDate: "2024-01-20",
    expiryDate: "2024-02-20",
    description: "Join our creative team as a content producer. You will work on various media projects including documentaries, news segments, and digital content creation for our multiple platforms.",
    requirements: ["Video Production", "Adobe Creative Suite", "Storytelling", "3+ years experience", "Broadcasting"],
    isActive: true,
  },
  {
    id: "3",
    title: "Marketing Specialist",
    department: "Marketing & Communications",
    location: "Addis Ababa, Ethiopia",
    postedDate: "2024-01-18",
    expiryDate: "2024-02-18",
    description: "We're seeking a dynamic marketing specialist to develop and execute marketing campaigns that enhance our brand presence across various channels including digital, print, and broadcast media.",
    requirements: ["Digital Marketing", "Social Media", "Analytics", "Communication Skills", "Campaign Management"],
    isActive: true,
  },
  {
    id: "4",
    title: "Broadcast Journalist",
    department: "News & Current Affairs",
    location: "Gondar, Ethiopia",
    postedDate: "2024-01-22",
    expiryDate: "2024-02-22",
    description: "We are looking for a talented broadcast journalist to join our news team. You will research, write, and present news stories for television and radio broadcasts.",
    requirements: ["Journalism Degree", "Broadcasting Experience", "Research Skills", "Communication", "Ethics"],
    isActive: true,
  },
  {
    id: "5",
    title: "Graphic Designer",
    department: "Creative Services",
    location: "Addis Ababa, Ethiopia",
    postedDate: "2024-01-25",
    expiryDate: "2024-02-25",
    description: "Join our creative team as a graphic designer. You will create visual content for various media including print, digital, and broadcast platforms.",
    requirements: ["Adobe Creative Suite", "Typography", "Brand Design", "2+ years experience", "Portfolio"],
    isActive: true,
  },
  {
    id: "6",
    title: "HR Coordinator",
    department: "Human Resources",
    location: "Addis Ababa, Ethiopia",
    postedDate: "2024-01-12",
    expiryDate: "2024-02-12",
    description: "We are seeking an HR coordinator to support our human resources team in recruitment, employee relations, and administrative tasks.",
    requirements: ["HR Experience", "Communication Skills", "Organizational Skills", "MS Office", "Problem Solving"],
    isActive: true,
  },
];

const departments = [
  "All Departments",
  "Information Technology",
  "Media Production",
  "Marketing & Communications",
  "News & Current Affairs",
  "Creative Services",
  "Human Resources",
];

const locations = [
  "All Locations",
  "Addis Ababa, Ethiopia",
  "Bahir Dar, Ethiopia",
  "Gondar, Ethiopia",
];

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("All Types");
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState("All Levels");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [remoteOnly, setRemoteOnly] = useState(false);
  const { jobs, loading, error } = useJobs();
  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    setFilteredJobs(jobs);
  }, [jobs]);

  const handleSearch = () => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.requirements.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter((job) => job.department === selectedDepartment);
    }

    // Filter by location
    if (selectedLocation !== "All Locations") {
      filtered = filtered.filter((job) => job.location === selectedLocation);
    }

    // Filter by employment type
    if (selectedEmploymentType !== "All Types") {
      filtered = filtered.filter((job) => job.employment_type === selectedEmploymentType);
    }

    // Filter by experience level
    if (selectedExperienceLevel !== "All Levels") {
      filtered = filtered.filter((job) => job.experience_level === selectedExperienceLevel);
    }

    // Filter by salary range
    if (salaryRange.min || salaryRange.max) {
      filtered = filtered.filter((job) => {
        if (!job.salary_range) return false;
        // Simple salary range filtering (in production, this would be more sophisticated)
        const salaryText = job.salary_range.toLowerCase();
        return salaryText.includes('etb') || salaryText.includes('birr');
      });
    }

    // Filter remote jobs
    if (remoteOnly) {
      filtered = filtered.filter((job) => 
        job.location.toLowerCase().includes('remote') || 
        job.description.toLowerCase().includes('remote')
      );
    }
    setFilteredJobs(filtered);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedDepartment("All Departments");
    setSelectedLocation("All Locations");
    setSelectedEmploymentType("All Types");
    setSelectedExperienceLevel("All Levels");
    setSalaryRange({ min: "", max: "" });
    setRemoteOnly(false);
    setFilteredJobs(jobs);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Job Opportunities
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover your next career opportunity with Amhara Media Corporation
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Search & Filter Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by job title, skills, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Building className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Departments">All Departments</SelectItem>
                    {[...new Set(jobs.map(job => job.department))].map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <MapPin className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Locations">All Locations</SelectItem>
                    {[...new Set(jobs.map(job => job.location))].map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Employment Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Types">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                <Search className="mr-2 h-4 w-4" />
                Search Jobs
              </Button>
              <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {loading ? "Loading..." : filteredJobs.length === jobs.length 
                ? `All Jobs (${filteredJobs.length})`
                : `Search Results (${filteredJobs.length})`
              }
            </h2>
            <Badge variant="outline" className="text-sm">
              <Calendar className="mr-1 h-3 w-3" />
              Updated Daily
            </Badge>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
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
            ))}
          </div>
        ) : error ? (
          <Card className="text-center py-12 shadow-soft">
            <CardContent>
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error loading jobs</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="text-center py-12 shadow-soft">
            <CardContent>
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all available positions.
              </p>
              <Button onClick={handleReset}>View All Jobs</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id}
                id={job.id}
                title={job.title}
                department={job.department}
                location={job.location}
                postedDate={job.posted_date}
                description={job.description}
                requirements={job.requirements.split('\n').filter(Boolean)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;