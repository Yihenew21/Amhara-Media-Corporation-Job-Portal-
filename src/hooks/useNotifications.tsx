import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailNotification {
  id: string;
  recipient_email: string;
  subject: string;
  content: string;
  template_type: 'application_received' | 'status_update' | 'interview_invite' | 'welcome';
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  application_id?: string;
  job_id?: string;
}

export const useNotifications = () => {
  const [loading, setLoading] = useState(false);

  const sendApplicationReceivedEmail = async (
    recipientEmail: string,
    candidateName: string,
    jobTitle: string,
    applicationId: string
  ) => {
    try {
      setLoading(true);
      
      const subject = `Application Received - ${jobTitle}`;
      const content = `Dear ${candidateName},

Thank you for your application for the ${jobTitle} position at Amhara Media Corporation. 

We have received your application and will review it carefully. Our HR team will contact you within 5-7 business days regarding the next steps in our recruitment process.

In the meantime, feel free to explore other opportunities on our job portal or learn more about our organization.

Best regards,
HR Team
Amhara Media Corporation

---
This is an automated message. Please do not reply to this email.`;

      // In production, this would integrate with an email service like SendGrid, AWS SES, etc.
      // For demo purposes, we'll simulate the email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Email sent:', { recipientEmail, subject, content });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    } finally {
      setLoading(false);
    }
  };

  const sendStatusUpdateEmail = async (
    recipientEmail: string,
    candidateName: string,
    jobTitle: string,
    newStatus: string,
    additionalInfo?: string
  ) => {
    try {
      setLoading(true);
      
      const subject = `Application Update - ${jobTitle}`;
      const statusMessages = {
        under_review: 'is currently under review by our hiring team',
        interview: 'has been selected for the interview stage. We will contact you soon with interview details',
        accepted: 'has been accepted! Congratulations, we would like to offer you this position',
        rejected: 'has been reviewed. Unfortunately, we have decided to move forward with other candidates'
      };

      const statusMessage = statusMessages[newStatus as keyof typeof statusMessages] || `status has been updated to ${newStatus}`;
      
      const content = `Dear ${candidateName},

We wanted to update you on the status of your application for the ${jobTitle} position.

Your application ${statusMessage}.

${additionalInfo || ''}

Thank you for your interest in Amhara Media Corporation.

Best regards,
HR Team
Amhara Media Corporation

---
This is an automated message. Please do not reply to this email.`;

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Status update email sent:', { recipientEmail, subject, content });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending status update email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    } finally {
      setLoading(false);
    }
  };

  const sendInterviewInviteEmail = async (
    recipientEmail: string,
    candidateName: string,
    jobTitle: string,
    interviewDetails: {
      date: string;
      time: string;
      location: string;
      interviewer?: string;
    }
  ) => {
    try {
      setLoading(true);
      
      const subject = `Interview Invitation - ${jobTitle}`;
      const content = `Dear ${candidateName},

We are pleased to invite you for an interview for the ${jobTitle} position at Amhara Media Corporation.

Interview Details:
📅 Date: ${interviewDetails.date}
🕐 Time: ${interviewDetails.time}
📍 Location: ${interviewDetails.location}
${interviewDetails.interviewer ? `👤 Interviewer: ${interviewDetails.interviewer}` : ''}

Please confirm your attendance by replying to this email or calling our HR department at +251 58 220 0456.

We look forward to meeting you and discussing this exciting opportunity.

Best regards,
HR Team
Amhara Media Corporation

---
Please reply to confirm your attendance.`;

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Interview invite sent:', { recipientEmail, subject, content });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending interview invite:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeEmail = async (
    recipientEmail: string,
    candidateName: string,
    jobTitle: string,
    startDetails: {
      startDate: string;
      reportingTime: string;
      location: string;
      supervisor?: string;
    }
  ) => {
    try {
      setLoading(true);
      
      const subject = `Welcome to Amhara Media Corporation!`;
      const content = `Dear ${candidateName},

Welcome to the Amhara Media Corporation family! We are excited to have you join our team as a ${jobTitle}.

Your First Day Details:
📅 Start Date: ${startDetails.startDate}
🕐 Reporting Time: ${startDetails.reportingTime}
📍 Location: ${startDetails.location}
${startDetails.supervisor ? `👤 Supervisor: ${startDetails.supervisor}` : ''}

What to Bring:
• Valid ID (Passport or National ID)
• Bank account details for payroll setup
• Emergency contact information
• Any required documents mentioned during the interview

We have prepared an orientation program to help you settle in quickly and meet your new colleagues.

Welcome aboard!

Best regards,
HR Team
Amhara Media Corporation`;

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Welcome email sent:', { recipientEmail, subject, content });
      
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendApplicationReceivedEmail,
    sendStatusUpdateEmail,
    sendInterviewInviteEmail,
    sendWelcomeEmail,
    loading,
  };
};