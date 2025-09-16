import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { ArrowLeft, Save } from "lucide-react";
import type { Job } from "@/types";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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
    is_active: true,
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

  // Helper function to check if a value is in predefined lists
  const isCustomValue = (field: string, value: string) => {
    const lists = {
      department: departments,
      location: locations,
      experience_level: experienceLevels,
    };
    return !lists[field as keyof typeof lists].includes(value);
  };

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const jobData = {
            title: data.title || "",
            description: data.description || "",
            requirements: data.requirements || "",
            key_responsibilities: data.key_responsibilities || "",
            location: data.location || "",
            department: data.department || "",
            employment_type: data.employment_type || "full-time",
            salary_range: data.salary_range || "",
            experience_level: data.experience_level || "",
            expiry_date: data.expiry_date ? data.expiry_date.split("T")[0] : "",
            is_active: data.is_active ?? true,
            number_of_positions: data.number_of_positions || 1,
          };

          setFormData(jobData);

          // Check if any values are custom (not in predefined lists)
          const customValues = {
            location: isCustomValue("location", data.location || ""),
            department: isCustomValue("department", data.department || ""),
            experience_level: isCustomValue(
              "experience_level",
              data.experience_level || ""
            ),
          };

          setSelectedOther(customValues);

          // Set custom inputs for values that are not in predefined lists
          setCustomInputs({
            location: customValues.location ? data.location || "" : "",
            department: customValues.department ? data.department || "" : "",
            experience_level: customValues.experience_level
              ? data.experience_level || ""
              : "",
          });
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again.",
          variant: "destructive",
        });
        navigate("/admin/jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate, toast]);

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
        throw new Error("You must be logged in to edit jobs");
      }

      // Check if user is admin
      const { data: adminCheck, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (adminError) {
        console.error("Admin check error:", adminError);
        throw new Error(
          `Admin check failed: ${adminError.message}. Please contact an administrator.`
        );
      }

      if (!adminCheck) {
        throw new Error(
          "You are not set up as an administrator. Please contact an administrator."
        );
      }

      const jobData = {
        ...formData,
        expiry_date: formData.expiry_date
          ? new Date(formData.expiry_date).toISOString()
          : null,
        salary_range: formData.salary_range || null,
        experience_level: formData.experience_level || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", id);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      toast({
        title: "Success!",
        description: "Job updated successfully.",
      });

      navigate("/admin/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/jobs")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Job</h1>
              <p className="text-muted-foreground">
                Update the job posting details
              </p>
            </div>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g., Senior Software Developer"
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

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select
                      value={
                        selectedOther.location ? "other" : formData.location
                      }
                      onValueChange={(value) =>
                        handleSelectChange("location", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
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
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={formData.salary_range}
                      onChange={(e) =>
                        handleInputChange("salary_range", e.target.value)
                      }
                      placeholder="e.g., $50,000 - $70,000"
                    />
                  </div>

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
                    <Label htmlFor="number_of_positions">
                      Number of Positions
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="is_active">Status</Label>
                    <Select
                      value={formData.is_active ? "active" : "inactive"}
                      onValueChange={(value) =>
                        handleInputChange("is_active", value === "active")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
                    rows={6}
                    required
                  />
                </div>

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
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">
                    Requirements & Qualifications
                  </Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) =>
                      handleInputChange("requirements", e.target.value)
                    }
                    placeholder="List the required skills, experience, education, and qualifications..."
                    rows={6}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/jobs")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Job
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditJob;
