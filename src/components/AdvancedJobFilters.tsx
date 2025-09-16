import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Filter, X, Search } from 'lucide-react';

export interface JobFilters {
  query?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  postedWithin?: string;
  skills?: string[];
}

interface AdvancedJobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onReset: () => void;
  jobCount?: number;
}

const AdvancedJobFilters: React.FC<AdvancedJobFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  jobCount = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  const departments = [
    'Information Technology',
    'Media Production',
    'Marketing & Communications',
    'News & Current Affairs',
    'Creative Services',
    'Human Resources',
    'Finance & Administration',
    'Engineering & Technical',
  ];

  const locations = [
    'Addis Ababa, Ethiopia',
    'Bahir Dar, Ethiopia',
    'Gondar, Ethiopia',
    'Hawassa, Ethiopia',
    'Mekelle, Ethiopia',
    'Dire Dawa, Ethiopia',
  ];

  const employmentTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
  ];

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive Level' },
  ];

  const postedWithinOptions = [
    { value: '1', label: 'Last 24 hours' },
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
  ];

  const popularSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java',
    'Adobe Creative Suite', 'Video Production', 'Photography',
    'Digital Marketing', 'Social Media', 'Content Writing',
    'Journalism', 'Broadcasting', 'Research', 'Analytics',
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof JobFilters, value: any) => {
    // Convert 'all' back to undefined to clear the filter
    const filterValue = value === 'all' ? undefined : value;
    const updatedFilters = { ...localFilters, [key]: filterValue };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const toggleSkill = (skill: string) => {
    const currentSkills = localFilters.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    updateFilter('skills', updatedSkills);
  };

  const removeSkill = (skill: string) => {
    const currentSkills = localFilters.skills || [];
    updateFilter('skills', currentSkills.filter(s => s !== skill));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.query) count++;
    if (localFilters.department) count++;
    if (localFilters.location) count++;
    if (localFilters.employmentType) count++;
    if (localFilters.experienceLevel) count++;
    if (localFilters.salaryMin || localFilters.salaryMax) count++;
    if (localFilters.postedWithin) count++;
    if (localFilters.skills?.length) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Jobs
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {jobCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {jobCount} jobs found
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Less Filters
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  More Filters
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title, company, or keywords..."
            value={localFilters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={localFilters.department || 'all'}
              onValueChange={(value) => updateFilter('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={localFilters.location || 'all'}
              onValueChange={(value) => updateFilter('location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select
              value={localFilters.employmentType || 'all'}
              onValueChange={(value) => updateFilter('employmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {employmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience Level & Posted Within */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={localFilters.experienceLevel || 'all'}
                    onValueChange={(value) => updateFilter('experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any level</SelectItem>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Posted Within</Label>
                  <Select
                    value={localFilters.postedWithin || 'all'}
                    onValueChange={(value) => updateFilter('postedWithin', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any time</SelectItem>
                      {postedWithinOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-4">
                <Label>Salary Range (ETB)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="salary-min" className="text-sm">Min</Label>
                    <Input
                      id="salary-min"
                      type="number"
                      placeholder="0"
                      value={localFilters.salaryMin || ''}
                      onChange={(e) => updateFilter('salaryMin', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="salary-max" className="text-sm">Max</Label>
                    <Input
                      id="salary-max"
                      type="number"
                      placeholder="200,000"
                      value={localFilters.salaryMax || ''}
                      onChange={(e) => updateFilter('salaryMax', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Filter */}
            <div className="space-y-3">
              <Label>Skills</Label>
              
              {/* Selected Skills */}
              {localFilters.skills && localFilters.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {localFilters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Skill Options */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {popularSkills.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={localFilters.skills?.includes(skill) || false}
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <Label htmlFor={skill} className="text-sm cursor-pointer">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        {activeFiltersCount > 0 && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onReset}>
              Clear All Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedJobFilters;
