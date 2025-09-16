import { useState } from "react";
import {
  emailService,
  type EmailData,
  type EmailResult,
} from "@/services/emailService";
import { useToast } from "@/hooks/use-toast";

interface UseEmailOptions {
  onSuccess?: (result: EmailResult) => void;
  onError?: (error: string) => void;
}

export const useEmail = (options: UseEmailOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const { toast } = useToast();

  const sendEmail = async (emailData: EmailData): Promise<EmailResult> => {
    setIsLoading(true);
    try {
      const result = await emailService.sendEmail(emailData);

      if (result.success) {
        toast({
          title: "Email Sent Successfully!",
          description: `Email sent to ${
            Array.isArray(emailData.to) ? emailData.to.length : 1
          } recipient(s).`,
        });
        options.onSuccess?.(result);
      } else {
        toast({
          title: "Failed to Send Email",
          description:
            result.error || "An error occurred while sending the email.",
          variant: "destructive",
        });
        options.onError?.(result.error || "Unknown error");
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Email Sending Failed",
        description: errorMessage,
        variant: "destructive",
      });
      options.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendBulkEmails = async (
    emails: EmailData[],
    options: {
      batchSize?: number;
      delayBetweenBatches?: number;
    } = {}
  ) => {
    setIsLoading(true);
    setProgress({ sent: 0, total: emails.length });

    try {
      const result = await emailService.sendBulkEmails(emails, {
        ...options,
        onProgress: (sent, total) => {
          setProgress({ sent, total });
        },
      });

      if (result.success > 0) {
        toast({
          title: "Bulk Email Sent!",
          description: `Successfully sent ${result.success} out of ${emails.length} emails.`,
        });
      }

      if (result.failed > 0) {
        toast({
          title: "Some Emails Failed",
          description: `${result.failed} emails failed to send. Please check the communication history for details.`,
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Bulk Email Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: 0, failed: emails.length, results: [] };
    } finally {
      setIsLoading(false);
      setProgress({ sent: 0, total: 0 });
    }
  };

  return {
    sendEmail,
    sendBulkEmails,
    isLoading,
    progress,
  };
};

