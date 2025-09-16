# Email Configuration Guide

This guide explains how to configure email sending in the JobFlow Amhara application.

## Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
# Choose email provider: 'resend', 'sendgrid', 'nodemailer', or 'mock' (for development)
VITE_EMAIL_PROVIDER=mock

# Email Provider Settings
# For Resend (https://resend.com)
VITE_EMAIL_API_KEY=your_resend_api_key

# For SendGrid (https://sendgrid.com)
# VITE_EMAIL_API_KEY=your_sendgrid_api_key

# For Nodemailer (SMTP)
# VITE_SMTP_HOST=smtp.gmail.com
# VITE_SMTP_PORT=587
# VITE_SMTP_USER=your_email@gmail.com
# VITE_SMTP_PASSWORD=your_app_password

# Email Settings
VITE_EMAIL_FROM_EMAIL=noreply@amharamedia.com
VITE_EMAIL_FROM_NAME=Amhara Media Corporation
```

## Email Providers

### 1. Resend (Recommended)

- **Website**: https://resend.com
- **Setup**:
  1. Sign up for a Resend account
  2. Get your API key from the dashboard
  3. Set `VITE_EMAIL_PROVIDER=resend`
  4. Set `VITE_EMAIL_API_KEY=your_resend_api_key`

### 2. SendGrid

- **Website**: https://sendgrid.com
- **Setup**:
  1. Sign up for a SendGrid account
  2. Create an API key
  3. Set `VITE_EMAIL_PROVIDER=sendgrid`
  4. Set `VITE_EMAIL_API_KEY=your_sendgrid_api_key`

### 3. Nodemailer (SMTP)

- **Setup**:
  1. Set `VITE_EMAIL_PROVIDER=nodemailer`
  2. Configure SMTP settings:
     - `VITE_SMTP_HOST` - SMTP server hostname
     - `VITE_SMTP_PORT` - SMTP server port (usually 587 or 465)
     - `VITE_SMTP_USER` - Your email username
     - `VITE_SMTP_PASSWORD` - Your email password or app password

### 4. Mock (Development)

- **Purpose**: For development and testing
- **Setup**: Set `VITE_EMAIL_PROVIDER=mock`
- **Behavior**: Logs emails to console instead of sending them

## Features

### Single Email Sending

- Send emails to individual recipients
- Support for multiple recipients (comma-separated)
- Template integration
- Real-time status tracking

### Bulk Email Sending

- Send emails to all applicants for a specific job
- Batch processing with rate limiting
- Progress tracking with visual progress bar
- Error handling for failed sends

### Email Templates

- Create and manage reusable email templates
- Support for different template types:
  - Status updates
  - Interview invitations
  - Rejection notices
  - Welcome messages
  - General communications

### Communication History

- Track all sent emails
- View delivery status
- Error message logging
- Filter by date, status, and type

## Usage

1. **Configure Email Provider**: Set up your preferred email provider using the environment variables above.

2. **Create Templates**: Go to the Communications page and create email templates for common use cases.

3. **Send Individual Emails**: Use the "Compose" tab to send emails to specific recipients.

4. **Send Bulk Emails**: Use the "Bulk Actions" tab to send emails to all applicants for a specific job.

5. **Monitor History**: Check the "History" tab to see all sent emails and their status.

## Security Notes

- Never commit API keys or passwords to version control
- Use environment variables for all sensitive configuration
- Consider using app-specific passwords for Gmail/Google Workspace
- Regularly rotate API keys and passwords

## Troubleshooting

### Common Issues

1. **"API key is required" error**

   - Ensure your API key is correctly set in the environment variables
   - Check that the API key has the necessary permissions

2. **"Failed to send email" error**

   - Verify your email provider configuration
   - Check your internet connection
   - Ensure the recipient email addresses are valid

3. **SMTP authentication failed**
   - Verify your SMTP credentials
   - Check if your email provider requires app-specific passwords
   - Ensure 2FA is properly configured if required

### Testing

Use the mock provider for development:

```env
VITE_EMAIL_PROVIDER=mock
```

This will log emails to the browser console instead of sending them, allowing you to test the functionality without actually sending emails.

