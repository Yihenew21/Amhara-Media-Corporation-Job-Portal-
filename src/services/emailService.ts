interface EmailConfig {
  provider: "resend" | "sendgrid" | "nodemailer" | "mock";
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

interface EmailData {
  to: string | string[];
  subject: string;
  content: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      switch (this.config.provider) {
        case "resend":
          return await this.sendViaResend(emailData);
        case "sendgrid":
          return await this.sendViaSendGrid(emailData);
        case "nodemailer":
          return await this.sendViaNodemailer(emailData);
        case "mock":
          return await this.sendViaMock(emailData);
        default:
          throw new Error(
            `Unsupported email provider: ${this.config.provider}`
          );
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async sendViaResend(emailData: EmailData): Promise<EmailResult> {
    if (!this.config.apiKey) {
      throw new Error("Resend API key is required");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          emailData.from ||
          `${this.config.fromName || "Amhara Media Corporation"} <${
            this.config.fromEmail || "noreply@amharamedia.com"
          }>`,
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: emailData.html || this.convertTextToHtml(emailData.content),
        reply_to: emailData.replyTo,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send email via Resend");
    }

    return {
      success: true,
      messageId: result.id,
    };
  }

  private async sendViaSendGrid(emailData: EmailData): Promise<EmailResult> {
    if (!this.config.apiKey) {
      throw new Error("SendGrid API key is required");
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: Array.isArray(emailData.to)
              ? emailData.to.map((email) => ({ email }))
              : [{ email: emailData.to }],
            subject: emailData.subject,
          },
        ],
        from: {
          email:
            emailData.from ||
            this.config.fromEmail ||
            "noreply@amharamedia.com",
          name: this.config.fromName || "Amhara Media Corporation",
        },
        content: [
          {
            type: "text/html",
            value: emailData.html || this.convertTextToHtml(emailData.content),
          },
        ],
        reply_to: emailData.replyTo ? { email: emailData.replyTo } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SendGrid error: ${errorText}`);
    }

    return {
      success: true,
      messageId: response.headers.get("X-Message-Id") || undefined,
    };
  }

  private async sendViaNodemailer(emailData: EmailData): Promise<EmailResult> {
    // This would typically be handled by a backend service
    // For now, we'll simulate the API call
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        content: emailData.content,
        html: emailData.html,
        from: emailData.from,
        replyTo: emailData.replyTo,
        config: this.config,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send email via Nodemailer");
    }

    return {
      success: true,
      messageId: result.messageId,
    };
  }

  private async sendViaMock(emailData: EmailData): Promise<EmailResult> {
    // Simulate email sending for development/testing
    console.log("📧 Mock Email Sent:", {
      to: emailData.to,
      subject: emailData.subject,
      content: emailData.content,
      timestamp: new Date().toISOString(),
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };
  }

  private convertTextToHtml(text: string): string {
    // Convert plain text to HTML
    return text
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>");
  }

  // Method to send bulk emails with rate limiting
  async sendBulkEmails(
    emails: EmailData[],
    options: {
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (sent: number, total: number) => void;
    } = {}
  ): Promise<{ success: number; failed: number; results: EmailResult[] }> {
    const { batchSize = 5, delayBetweenBatches = 1000, onProgress } = options;
    const results: EmailResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Process emails in batches
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      // Send batch emails in parallel
      const batchPromises = batch.map((email) => this.sendEmail(email));
      const batchResults = await Promise.allSettled(batchPromises);

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
          if (result.value.success) {
            successCount++;
          } else {
            failedCount++;
          }
        } else {
          results.push({
            success: false,
            error: result.reason?.message || "Unknown error",
          });
          failedCount++;
        }
      });

      // Report progress
      if (onProgress) {
        onProgress(i + batch.length, emails.length);
      }

      // Delay between batches to avoid rate limiting
      if (i + batchSize < emails.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }
}

// Create email service instance based on environment configuration
const createEmailService = (): EmailService => {
  const provider = (import.meta.env.VITE_EMAIL_PROVIDER ||
    "mock") as EmailConfig["provider"];

  const config: EmailConfig = {
    provider,
    apiKey: import.meta.env.VITE_EMAIL_API_KEY,
    fromEmail:
      import.meta.env.VITE_EMAIL_FROM_EMAIL || "noreply@amharamedia.com",
    fromName:
      import.meta.env.VITE_EMAIL_FROM_NAME || "Amhara Media Corporation",
    smtpHost: import.meta.env.VITE_SMTP_HOST,
    smtpPort: import.meta.env.VITE_SMTP_PORT
      ? parseInt(import.meta.env.VITE_SMTP_PORT)
      : undefined,
    smtpUser: import.meta.env.VITE_SMTP_USER,
    smtpPassword: import.meta.env.VITE_SMTP_PASSWORD,
  };

  return new EmailService(config);
};

export const emailService = createEmailService();
export type { EmailData, EmailResult, EmailConfig };

