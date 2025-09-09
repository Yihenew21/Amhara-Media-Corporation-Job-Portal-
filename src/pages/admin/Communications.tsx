import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'status_update' | 'interview_invite' | 'rejection' | 'welcome';
}

interface CommunicationHistory {
  id: string;
  recipient: string;
  subject: string;
  content: string;
  type: 'email' | 'sms';
  status: 'sent' | 'delivered' | 'failed';
  sent_at: string;
}

const Communications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("compose");
  const [loading, setLoading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  
  // Email composition state
  const [emailData, setEmailData] = useState({
    recipients: "",
    subject: "",
    content: "",
    template: "",
  });

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: "1",
      name: "Application Received",
      subject: "Application Received - {{jobTitle}}",
      content: "Dear {{candidateName}},\n\nThank you for your application for the {{jobTitle}} position at Amhara Media Corporation. We have received your application and will review it carefully.\n\nWe will contact you within 5-7 business days regarding the next steps.\n\nBest regards,\nHR Team\nAmhara Media Corporation",
      type: "status_update"
    },
    {
      id: "2", 
      name: "Interview Invitation",
      subject: "Interview Invitation - {{jobTitle}}",
      content: "Dear {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{jobTitle}} position.\n\nInterview Details:\nDate: {{interviewDate}}\nTime: {{interviewTime}}\nLocation: {{interviewLocation}}\n\nPlease confirm your attendance by replying to this email.\n\nBest regards,\nHR Team\nAmhara Media Corporation",
      type: "interview_invite"
    },
    {
      id: "3",
      name: "Application Status Update",
      subject: "Application Update - {{jobTitle}}",
      content: "Dear {{candidateName}},\n\nWe wanted to update you on the status of your application for the {{jobTitle}} position.\n\nYour application is currently {{status}}. {{additionalInfo}}\n\nThank you for your continued interest in Amhara Media Corporation.\n\nBest regards,\nHR Team",
      type: "status_update"
    },
    {
      id: "4",
      name: "Welcome Message",
      subject: "Welcome to Amhara Media Corporation!",
      content: "Dear {{candidateName}},\n\nWelcome to the Amhara Media Corporation family! We are excited to have you join our team.\n\nYour first day details:\nStart Date: {{startDate}}\nReporting Time: {{reportingTime}}\nLocation: {{workLocation}}\n\nWe look forward to working with you.\n\nBest regards,\nHR Team\nAmhara Media Corporation",
      type: "welcome"
    }
  ]);

  // Communication history state
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationHistory[]>([
    {
      id: "1",
      recipient: "john.doe@email.com",
      subject: "Application Received - Software Engineer",
      content: "Thank you for your application...",
      type: "email",
      status: "delivered",
      sent_at: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      recipient: "jane.smith@email.com", 
      subject: "Interview Invitation - Content Producer",
      content: "We are pleased to invite you...",
      type: "email",
      status: "sent",
      sent_at: "2024-01-14T14:20:00Z"
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
    type: "status_update" as EmailTemplate['type'],
  });

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Email Sent Successfully!",
        description: `Email sent to ${emailData.recipients.split(',').length} recipient(s).`,
      });

      // Add to communication history
      const newCommunication: CommunicationHistory = {
        id: Date.now().toString(),
        recipient: emailData.recipients,
        subject: emailData.subject,
        content: emailData.content,
        type: "email",
        status: "sent",
        sent_at: new Date().toISOString(),
      };

      setCommunicationHistory(prev => [newCommunication, ...prev]);

      // Reset form
      setEmailData({
        recipients: "",
        subject: "",
        content: "",
        template: "",
      });

    } catch (error) {
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
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailData(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        template: templateId,
      }));
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const template: EmailTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
    };

    setTemplates(prev => [...prev, template]);
    
    toast({
      title: "Template Created",
      description: "Email template has been saved successfully.",
    });

    setShowTemplateDialog(false);
    setNewTemplate({
      name: "",
      subject: "",
      content: "",
      type: "status_update",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">
            Send emails and manage communication with candidates
          </p>
        </div>

        {/* Communication Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                        onChange={(e) => setEmailData(prev => ({ ...prev, recipients: e.target.value }))}
                        placeholder="email1@example.com, email2@example.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate multiple emails with commas
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template">Use Template</Label>
                      <Select value={emailData.template} onValueChange={handleTemplateSelect}>
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
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      id="content"
                      value={emailData.content}
                      onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Type your message here..."
                      className="min-h-[200px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {{`candidateName`}}, {{`jobTitle`}}, etc. for dynamic content
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
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
                <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
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
                        Create a reusable email template for common communications.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTemplate} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input
                            id="templateName"
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="templateType">Type</Label>
                          <Select value={newTemplate.type} onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="status_update">Status Update</SelectItem>
                              <SelectItem value="interview_invite">Interview Invite</SelectItem>
                              <SelectItem value="rejection">Rejection</SelectItem>
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
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateContent">Content</Label>
                        <Textarea
                          id="templateContent"
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                          className="min-h-[150px]"
                          required
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">Create Template</Button>
                        <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <Card key={template.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                        <Badge variant="outline">
                          {template.type.replace('_', ' ').toUpperCase()}
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
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <div className="space-y-4">
                  {communicationHistory.map((comm) => (
                    <div key={comm.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{comm.subject}</span>
                          <Badge className={getStatusColor(comm.status)}>
                            {comm.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To: {comm.recipient}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {comm.content}
                        </p>
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
                      Send an email to all applicants for a specific job posting.
                    </p>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select job" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job1">Software Engineer</SelectItem>
                          <SelectItem value="job2">Content Producer</SelectItem>
                          <SelectItem value="job3">Marketing Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">
                        <Send className="mr-2 h-4 w-4" />
                        Send Bulk Email
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Status Update Notifications</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatically notify candidates when their application status changes.
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