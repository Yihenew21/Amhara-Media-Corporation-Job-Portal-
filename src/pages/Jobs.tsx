import { useState, useEffect } from "react";
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
import {
  Search,
  Filter,
  MapPin,
  Building,
  Calendar,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import JobCard from "@/components/JobCard";
import { useJobs } from "@/hooks/useJobs";
import AdvancedJobFilters, {
  JobFilters,
} from "@/components/AdvancedJobFilters";

const Jobs = () => {
  const [filters, setFilters] = useState<JobFilters>({});
  const { jobs, loading, error } = useJobs();
  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    setFilteredJobs(jobs);
  }, [jobs]);

  const handleSearch = () => {
    let filtered = jobs;

    // Text query
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q) ||
          job.requirements.toLowerCase().includes(q)
      );
    }

    if (filters.department) {
      filtered = filtered.filter(
        (job) => job.department === filters.department
      );
    }

    if (filters.location) {
      filtered = filtered.filter((job) => job.location === filters.location);
    }

    if (filters.employmentType) {
      filtered = filtered.filter(
        (job) => job.employment_type === filters.employmentType
      );
    }

    if (filters.experienceLevel) {
      filtered = filtered.filter(
        (job) => job.experience_level === filters.experienceLevel
      );
    }

    if (filters.salaryMin) {
      filtered = filtered.filter((job) => {
        // If job has salary_range like "x - y ETB", attempt to parse min value
        if (!job.salary_range) return true;
        const match = String(job.salary_range).match(/(\d[\d,]*)/);
        const min = match ? Number(match[1].replace(/,/g, "")) : 0;
        return min >= (filters.salaryMin as number);
      });
    }

    if (filters.salaryMax) {
      filtered = filtered.filter((job) => {
        if (!job.salary_range) return true;
        const nums = String(job.salary_range).match(/(\d[\d,]*)/g);
        const max =
          nums && nums.length > 1
            ? Number(nums[1].replace(/,/g, ""))
            : Number(nums?.[0]?.replace(/,/g, "") || 0);
        return max <= (filters.salaryMax as number);
      });
    }

    // Posted within X days
    if (filters.postedWithin) {
      const days = Number(filters.postedWithin);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(
        (job) => new Date(job.posted_date).getTime() >= cutoff
      );
    }

    // Skills
    if (filters.skills && filters.skills.length) {
      filtered = filtered.filter((job) => {
        const req = job.requirements.toLowerCase();
        return filters.skills!.some((s) => req.includes(s.toLowerCase()));
      });
    }

    setFilteredJobs(filtered);
  };

  const handleReset = () => {
    setFilters({});
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
        <div className="mb-8">
          <AdvancedJobFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleReset}
            jobCount={filteredJobs.length}
          />
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSearch} className="flex-1 sm:flex-none">
              <Search className="mr-2 h-4 w-4" />
              Search Jobs
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 sm:flex-none"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {loading
                ? "Loading..."
                : filteredJobs.length === jobs.length
                ? `All Jobs (${filteredJobs.length})`
                : `Search Results (${filteredJobs.length})`}
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
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
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
                Try adjusting your search criteria or browse all available
                positions.
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
