import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useEmail } from "@/hooks/useEmail";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Send,
  Mail,
  MessageSquare,
  Users,
  FileText,
  Calendar,
  Search,
  Plus,
  Eye,
  Trash2,
  Edit,
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type:
    | "status_update"
    | "interview_invite"
    | "rejection"
    | "welcome"
    | "general";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface CommunicationHistory {
  id: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  content: string;
  type: "email" | "sms";
  status: "sent" | "delivered" | "failed" | "pending";
  sent_by?: string;
  job_id?: string;
  application_id?: string;
  template_id?: string;
  sent_at: string;
  delivered_at?: string;
  error_message?: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
}

interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_date: string;
  user_email?: string;
  user_name?: string;
}

const Communications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    sendEmail,
    sendBulkEmails,
    isLoading: emailLoading,
    progress,
  } = useEmail();
  const [activeTab, setActiveTab] = useState("compose");
  const [loading, setLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );

  // Bulk actions state
  const [selectedBulkJob, setSelectedBulkJob] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Email composition state
  const [emailData, setEmailData] = useState({
    recipients: "",
    subject: "",
    content: "",
    template: "",
  });

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Communication history state
  const [communicationHistory, setCommunicationHistory] = useState<
    CommunicationHistory[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    type: "status_update" as EmailTemplate["type"],
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchTemplates();
    fetchCommunicationHistory();
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive",
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchCommunicationHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from("communication_history")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setCommunicationHistory(data || []);
    } catch (error) {
      console.error("Error fetching communication history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch communication history",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, department, location")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase.from("applications").select(`
          id,
          user_id,
          job_id,
          status,
          applied_date,
          profiles!inner(first_name, last_name)
        `);

      if (error) throw error;

      // Transform the data to include user names
      const transformedApplications = (data || []).map((app: any) => ({
        id: app.id,
        user_id: app.user_id,
        job_id: app.job_id,
        status: app.status,
        applied_date: app.applied_date,
        user_name: `${app.profiles.first_name || ""} ${
          app.profiles.last_name || ""
        }`.trim(),
        user_email: `user-${app.user_id.slice(-8)}@example.com`, // Placeholder email
      }));

      setApplications(transformedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recipients = emailData.recipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (recipients.length === 0) {
        toast({
          title: "No Recipients",
          description: "Please enter at least one email address.",
          variant: "destructive",
        });
        return;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Send email via email service
      const emailResult = await sendEmail({
        to: recipients,
        subject: emailData.subject,
        content: emailData.content,
        from: "noreply@amharamedia.com",
      });

      // Save to communication history with actual send status
      const communicationRecords = recipients.map((recipient) => ({
        recipient_email: recipient,
        subject: emailData.subject,
        content: emailData.content,
        type: "email" as const,
        status: emailResult.success
          ? ("delivered" as const)
          : ("failed" as const),
        sent_by: user.id,
        template_id: emailData.template || null,
        error_message: emailResult.error || null,
      }));

      const { error } = await supabase
        .from("communication_history")
        .insert(communicationRecords);

      if (error) throw error;

      // Refresh communication history
      await fetchCommunicationHistory();

      // Reset form
      setEmailData({
        recipients: "",
        subject: "",
        content: "",
        template: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to Send Email",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setEmailData((prev) => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        template: templateId,
      }));
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("email_templates").insert({
        name: newTemplate.name,
        subject: newTemplate.subject,
        content: newTemplate.content,
        type: newTemplate.type,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Template Created",
        description: "Email template has been saved successfully.",
      });

      // Refresh templates
      await fetchTemplates();

      setShowTemplateDialog(false);
      setNewTemplate({
        name: "",
        subject: "",
        content: "",
        type: "status_update",
      });
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
    });
    setShowEditTemplateDialog(true);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: newTemplate.content,
          type: newTemplate.type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTemplate.id);

      if (error) throw error;

      toast({
        title: "Template Updated",
        description: "Email template has been updated successfully.",
      });

      // Refresh templates
      await fetchTemplates();

      setShowEditTemplateDialog(false);
      setEditingTemplate(null);
      setNewTemplate({
        name: "",
        subject: "",
        content: "",
        type: "status_update",
      });
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully.",
      });

      // Refresh templates
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBulkEmail = async (
    jobId: string,
    subject: string,
    content: string
  ) => {
    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get applications for the selected job
      const jobApplications = applications.filter(
        (app) => app.job_id === jobId
      );

      if (jobApplications.length === 0) {
        toast({
          title: "No Applications",
          description: "No applications found for this job.",
          variant: "destructive",
        });
        return;
      }

      // Prepare email data for bulk sending
      const emailData = jobApplications.map((app) => ({
        to: app.user_email || `user-${app.user_id.slice(-8)}@example.com`,
        subject: subject,
        content: content,
        from: "noreply@amharamedia.com",
      }));

      // Send bulk emails
      const bulkResult = await sendBulkEmails(emailData, {
        batchSize: 5, // Send 5 emails at a time
        delayBetweenBatches: 1000, // 1 second delay between batches
      });

      // Create communication records for each applicant with actual send status
      const communicationRecords = jobApplications.map((app, index) => {
        const emailResult = bulkResult.results[index];
        return {
          recipient_email:
            app.user_email || `user-${app.user_id.slice(-8)}@example.com`,
          recipient_name: app.user_name,
          subject: subject,
          content: content,
          type: "email" as const,
          status: emailResult?.success
            ? ("delivered" as const)
            : ("failed" as const),
          sent_by: user.id,
          job_id: jobId,
          application_id: app.id,
          error_message: emailResult?.error || null,
        };
      });

      const { error } = await supabase
        .from("communication_history")
        .insert(communicationRecords);

      if (error) throw error;

      // Refresh communication history
      await fetchCommunicationHistory();
    } catch (error) {
      console.error("Error sending bulk email:", error);
      toast({
        title: "Failed to Send Bulk Email",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">
            Send emails and manage communication with candidates
          </p>
        </div>

        {/* Communication Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
          </TabsList>

          {/* Compose Email Tab */}
          <TabsContent value="compose">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Compose Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="recipients">Recipients</Label>
                      <Input
                        id="recipients"
                        value={emailData.recipients}
                        onChange={(e) =>
                          setEmailData((prev) => ({
                            ...prev,
                            recipients: e.target.value,
                          }))
                        }
                        placeholder="email1@example.com, email2@example.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple emails with commas
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template">Use Template</Label>
                      <Select
                        value={emailData.template ?? ""}
                        onValueChange={handleTemplateSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailData.subject}
                      onChange={(e) =>
                        setEmailData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="Email subject"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={emailData.content}
                      onChange={(e) =>
                        setEmailData((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Type your message here..."
                      className="min-h-[200px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Use placeholders like candidateName, jobTitle, etc. for
                      dynamic content
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || emailLoading}
                    className="w-full"
                  >
                    {loading || emailLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Email
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Email Templates</h2>
                <Dialog
                  open={showTemplateDialog}
                  onOpenChange={setShowTemplateDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Email Template</DialogTitle>
                      <DialogDescription>
                        Create a reusable email template for common
                        communications.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input
                            id="templateName"
                            value={newTemplate.name}
                            onChange={(e) =>
                              setNewTemplate((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="templateType">Type</Label>
                          <Select
                            value={newTemplate.type}
                            onValueChange={(value: any) =>
                              setNewTemplate((prev) => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="status_update">
                                Status Update
                              </SelectItem>
                              <SelectItem value="interview_invite">
                                Interview Invite
                              </SelectItem>
                              <SelectItem value="rejection">
                                Rejection
                              </SelectItem>
                              <SelectItem value="welcome">Welcome</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateSubject">Subject</Label>
                        <Input
                          id="templateSubject"
                          value={newTemplate.subject}
                          onChange={(e) =>
                            setNewTemplate((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateContent">Content</Label>
                        <Textarea
                          id="templateContent"
                          value={newTemplate.content}
                          onChange={(e) =>
                            setNewTemplate((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          className="min-h-[150px]"
                          required
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          Create Template
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowTemplateDialog(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Edit Template Dialog */}
                <Dialog
                  open={showEditTemplateDialog}
                  onOpenChange={setShowEditTemplateDialog}
                >
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Email Template</DialogTitle>
                      <DialogDescription>
                        Update the email template details.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTemplate} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="editTemplateName">
                            Template Name
                          </Label>
                          <Input
                            id="editTemplateName"
                            value={newTemplate.name}
                            onChange={(e) =>
                              setNewTemplate((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editTemplateType">Type</Label>
                          <Select
                            value={newTemplate.type}
                            onValueChange={(value: any) =>
                              setNewTemplate((prev) => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="status_update">
                                Status Update
                              </SelectItem>
                              <SelectItem value="interview_invite">
                                Interview Invite
                              </SelectItem>
                              <SelectItem value="rejection">
                                Rejection
                              </SelectItem>
                              <SelectItem value="welcome">Welcome</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editTemplateSubject">Subject</Label>
                        <Input
                          id="editTemplateSubject"
                          value={newTemplate.subject}
                          onChange={(e) =>
                            setNewTemplate((prev) => ({
                              ...prev,
                              subject: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editTemplateContent">Content</Label>
                        <Textarea
                          id="editTemplateContent"
                          value={newTemplate.content}
                          onChange={(e) =>
                            setNewTemplate((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          className="min-h-[150px]"
                          required
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Template"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowEditTemplateDialog(false);
                            setEditingTemplate(null);
                            setNewTemplate({
                              name: "",
                              subject: "",
                              content: "",
                              type: "status_update",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {templatesLoading ? (
                  // Loading skeleton
                  [...Array(4)].map((_, i) => (
                    <Card key={i} className="shadow-soft">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-6 bg-muted animate-pulse rounded" />
                          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                          <div className="h-4 bg-muted animate-pulse rounded" />
                          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : templates.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Templates Found
                    </h3>
                    <p className="text-muted-foreground">
                      Create your first email template to get started.
                    </p>
                  </div>
                ) : (
                  templates.map((template) => (
                    <Card key={template.id} className="shadow-soft">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {template.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {template.subject}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {template.type.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {template.content}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            Use Template
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                          <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                          <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                        </div>
                        <div className="h-3 bg-muted animate-pulse rounded w-20" />
                      </div>
                    ))}
                  </div>
                ) : communicationHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No Communication History
                    </h3>
                    <p className="text-muted-foreground">
                      Your sent emails and communications will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communicationHistory.map((comm) => (
                      <div
                        key={comm.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{comm.subject}</span>
                            <Badge className={getStatusColor(comm.status)}>
                              {comm.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            To: {comm.recipient_email}
                            {comm.recipient_name && ` (${comm.recipient_name})`}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {comm.content}
                          </p>
                          {comm.error_message && (
                            <p className="text-sm text-red-600">
                              Error: {comm.error_message}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(comm.sent_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Actions Tab */}
          <TabsContent value="bulk">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Bulk Communications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Send to All Applicants</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send an email to all applicants for a specific job
                      posting.
                    </p>
                    <div className="flex gap-2">
                      <Select
                        value={selectedBulkJob}
                        onValueChange={setSelectedBulkJob}
                      >
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Select job" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title} - {job.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!selectedBulkJob) {
                            toast({
                              title: "No Job Selected",
                              description: "Please select a job first.",
                              variant: "destructive",
                            });
                            return;
                          }
                          const job = jobs.find(
                            (j) => j.id === selectedBulkJob
                          );
                          if (job) {
                            handleBulkEmail(
                              selectedBulkJob,
                              `Update on ${job.title} Position`,
                              `Dear Applicant,\n\nWe would like to provide you with an update regarding your application for the ${job.title} position.\n\nBest regards,\nAmhara Media Corporation HR Team`
                            );
                          }
                        }}
                        disabled={loading || emailLoading}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Bulk Email
                      </Button>
                    </div>
                    {selectedBulkJob && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {
                            applications.filter(
                              (app) => app.job_id === selectedBulkJob
                            ).length
                          }{" "}
                          applicants will receive this email
                        </p>
                        {emailLoading && progress.total > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Sending emails...</span>
                              <span>
                                {progress.sent} / {progress.total}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    (progress.sent / progress.total) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">
                      Status Update Notifications
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatically notify candidates when their application
                      status changes.
                    </p>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Configure Auto-Notifications
                    </Button>
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

export default Communications;
