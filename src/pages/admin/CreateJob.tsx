import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Plus } from "lucide-react";

const CreateJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    key_responsibilities: "",
    location: "",
    department: "",
    employment_type: "full-time",
    salary_range: "",
    experience_level: "",
    expiry_date: "",
    number_of_positions: 1,
  });

  // State for custom input fields
  const [customInputs, setCustomInputs] = useState({
    location: "",
    department: "",
    experience_level: "",
  });

  // State to track if "Other" is selected
  const [selectedOther, setSelectedOther] = useState({
    location: false,
    department: false,
    experience_level: false,
  });

  const departments = [
    "Information Technology",
    "Media Production",
    "Marketing & Communications",
    "News & Current Affairs",
    "Creative Services",
    "Human Resources",
    "Finance & Administration",
    "Engineering & Technical",
  ];

  const locations = [
    "Addis Ababa, Ethiopia",
    "Bahir Dar, Ethiopia",
    "Gondar, Ethiopia",
    "Hawassa, Ethiopia",
    "Mekelle, Ethiopia",
    "Dire Dawa, Ethiopia",
  ];

  const experienceLevels = [
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Executive Level",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomInputChange = (field: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [field]: value }));
    // Update the main form data with the custom value
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    if (value === "other") {
      // Set "Other" as selected and clear the form data
      setSelectedOther((prev) => ({ ...prev, [field]: true }));
      setFormData((prev) => ({ ...prev, [field]: "" }));
      setCustomInputs((prev) => ({ ...prev, [field]: "" }));
    } else {
      // Set a predefined value and clear "Other" selection
      setSelectedOther((prev) => ({ ...prev, [field]: false }));
      setFormData((prev) => ({ ...prev, [field]: value }));
      setCustomInputs((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate custom inputs when "Other" is selected
    if (selectedOther.department && !customInputs.department.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a custom department name.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (selectedOther.location && !customInputs.location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a custom location.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (
      selectedOther.experience_level &&
      !customInputs.experience_level.trim()
    ) {
      toast({
        title: "Validation Error",
        description: "Please enter a custom experience level.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create jobs");
      }

      console.log("Creating job for user:", user.id);

      // Check if user is admin
      const { data: adminCheck, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (adminError) {
        console.error("Admin check error:", adminError);
        if (adminError.code === "PGRST116") {
          throw new Error(
            "You are not set up as an administrator. Please run the admin setup script in Supabase SQL Editor or contact an administrator."
          );
        }
        throw new Error(
          `Admin check failed: ${adminError.message}. Please contact an administrator.`
        );
      }

      if (!adminCheck) {
        throw new Error(
          "You are not set up as an administrator. Please run the admin setup script in Supabase SQL Editor or contact an administrator."
        );
      }

      console.log("User is admin with role:", adminCheck.role);

      const jobData = {
        ...formData,
        posted_by: user.id,
        expiry_date: formData.expiry_date
          ? new Date(formData.expiry_date).toISOString()
          : null,
        salary_range: formData.salary_range || null,
        experience_level: formData.experience_level || null,
      };

      console.log("Job data to insert:", jobData);

      const { error } = await supabase.from("jobs").insert([jobData]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast({
        title: "Success!",
        description: "Job posted successfully.",
      });

      navigate("/admin/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/jobs")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
          <p className="text-muted-foreground">
            Post a new job opportunity for candidates to apply
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={
                      selectedOther.department ? "other" : formData.department
                    }
                    onValueChange={(value) =>
                      handleSelectChange("department", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other (Specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedOther.department && (
                    <Input
                      placeholder="Enter custom department"
                      value={customInputs.department}
                      onChange={(e) =>
                        handleCustomInputChange("department", e.target.value)
                      }
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={selectedOther.location ? "other" : formData.location}
                    onValueChange={(value) =>
                      handleSelectChange("location", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other (Specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedOther.location && (
                    <Input
                      placeholder="Enter custom location"
                      value={customInputs.location}
                      onChange={(e) =>
                        handleCustomInputChange("location", e.target.value)
                      }
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment_type">Employment Type *</Label>
                  <Select
                    value={formData.employment_type}
                    onValueChange={(value) =>
                      handleInputChange("employment_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select
                    value={
                      selectedOther.experience_level
                        ? "other"
                        : formData.experience_level
                    }
                    onValueChange={(value) =>
                      handleSelectChange("experience_level", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other (Specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedOther.experience_level && (
                    <Input
                      placeholder="Enter custom experience level"
                      value={customInputs.experience_level}
                      onChange={(e) =>
                        handleCustomInputChange(
                          "experience_level",
                          e.target.value
                        )
                      }
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary_range">Salary Range</Label>
                  <Input
                    id="salary_range"
                    value={formData.salary_range}
                    onChange={(e) =>
                      handleInputChange("salary_range", e.target.value)
                    }
                    placeholder="e.g. 25,000 - 40,000 ETB"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Application Deadline</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    handleInputChange("expiry_date", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_positions">Number of Positions</Label>
                <Input
                  id="number_of_positions"
                  type="number"
                  min="1"
                  value={formData.number_of_positions}
                  onChange={(e) =>
                    handleInputChange(
                      "number_of_positions",
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Provide a detailed description of the job role, responsibilities, and what the candidate will be doing..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* Key Responsibilities */}
              <div className="space-y-2">
                <Label htmlFor="key_responsibilities">
                  Key Responsibilities *
                </Label>
                <Textarea
                  id="key_responsibilities"
                  value={formData.key_responsibilities}
                  onChange={(e) =>
                    handleInputChange("key_responsibilities", e.target.value)
                  }
                  placeholder="List the main responsibilities and duties for this position. Separate each responsibility with a new line."
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements & Qualifications *
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  placeholder="List the required qualifications, skills, experience, and any other requirements. Separate each requirement with a new line."
                  className="min-h-[120px]"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Creating Job...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Job
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/jobs")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateJob;
