# Amhara Media Corporation Job Portal

A comprehensive job portal system built for Amhara Media Corporation, featuring modern web technologies and a complete recruitment workflow.

## 🚀 Features

### For Job Seekers
- **Browse Jobs** - Advanced search and filtering capabilities
- **Apply Online** - Upload CV and cover letter
- **Track Applications** - Real-time status updates
- **Email Notifications** - Automatic updates on application progress
- **User Dashboard** - Manage profile and view application history

### For HR Administrators
- **Job Management** - Create, edit, and manage job postings
- **Application Review** - Review candidates with AI assessment tools
- **Communication Center** - Send emails using professional templates
- **Analytics Dashboard** - View recruitment metrics and reports
- **Export Reports** - Download data in CSV format

### For Super Administrators
- **All HR Features** - Complete HR management capabilities
- **Admin Management** - Create and manage administrator accounts
- **System Analytics** - Comprehensive system-wide reports
- **User Management** - Oversee all system users
- **Full System Control** - Complete administrative access

## 🔐 Admin Login Credentials

### Super Administrator
- **Email:** `superadmin@amharamedia.com`
- **Password:** `SuperAdmin123!`
- **Access:** Full system control

### HR Administrator  
- **Email:** `hradmin@amharamedia.com`
- **Password:** `HRAdmin123!`
- **Access:** HR management features

## 🛠 Technology Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Build Tool:** Vite
- **State Management:** React Query
- **Routing:** React Router DOM

## 📋 Complete Workflow

### 1. Job Seeker Journey
1. **Register** → Create account with personal details
2. **Browse Jobs** → Search and filter available positions
3. **Apply** → Upload CV and submit cover letter
4. **Track Progress** → Monitor application status
5. **Receive Updates** → Get email notifications
6. **Interview** → Participate in hiring process

### 2. HR Administrator Workflow
1. **Login** → Access admin dashboard
2. **Post Jobs** → Create new job opportunities
3. **Review Applications** → Evaluate candidates with AI assistance
4. **Update Status** → Change application status (auto-emails sent)
5. **Schedule Interviews** → Send interview invitations
6. **Make Decisions** → Accept or reject candidates
7. **Generate Reports** → Export analytics and data

### 3. Super Administrator Workflow
1. **System Oversight** → Monitor all system activities
2. **Manage Admins** → Add/remove administrator accounts
3. **View Analytics** → Access comprehensive system reports
4. **Configure System** → Manage system-wide settings
5. **Export Data** → Generate complete system reports

## 🗄 Database Schema

### Core Tables
- **profiles** - User profile information
- **jobs** - Job postings and details
- **applications** - Job applications with status tracking
- **admin_users** - Administrator accounts and roles

### Security Features
- **Row Level Security (RLS)** - Enabled on all tables
- **Role-based Access Control** - Different permissions per user type
- **Secure File Storage** - CV uploads with access controls
- **Authentication** - Supabase Auth with email/password

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for production)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Usage
1. **Visit the application** at `http://localhost:8080`
2. **Register as a job seeker** or **login as admin** using provided credentials
3. **Explore features** based on your user role
4. **Test the complete workflow** from job posting to hiring

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop** - Full feature set with optimal layout
- **Tablet** - Adapted interface for medium screens  
- **Mobile** - Touch-friendly interface with collapsible navigation

## 🎨 Design System

- **Brand Colors** - Red primary with professional gray tones
- **Typography** - Clean, readable font hierarchy
- **Components** - Consistent UI components via shadcn/ui
- **Animations** - Smooth transitions and micro-interactions
- **Accessibility** - WCAG compliant design patterns

## 🔧 Development Features

- **TypeScript** - Full type safety throughout
- **ESLint** - Code quality and consistency
- **Hot Reload** - Instant development feedback
- **Component Library** - Reusable UI components
- **Mock Data** - Development-friendly sample data

## 📊 System Capabilities

### Job Management
- ✅ Create, edit, delete job postings
- ✅ Set application deadlines
- ✅ Manage job status (active/inactive)
- ✅ Department and location categorization

### Application Processing
- ✅ CV file upload and storage
- ✅ Cover letter submission
- ✅ Status tracking (Applied → Review → Interview → Decision)
- ✅ Duplicate application prevention

### Communication System
- ✅ Automated email notifications
- ✅ Professional email templates
- ✅ Bulk communication tools
- ✅ Interview invitation system

### Analytics & Reporting
- ✅ Application metrics and trends
- ✅ Department performance analytics
- ✅ User registration statistics
- ✅ CSV export functionality

### AI Assessment (Mock)
- ✅ CV analysis and scoring
- ✅ Skills matching algorithms
- ✅ Candidate recommendations
- ✅ Hiring decision support

## 🌟 Production Considerations

For production deployment:
1. **Configure Supabase** - Set up production database
2. **Email Service** - Integrate with SendGrid/AWS SES
3. **File Storage** - Configure secure file handling
4. **Domain Setup** - Connect custom domain
5. **SSL Certificate** - Enable HTTPS
6. **Monitoring** - Set up error tracking and analytics

---

**Built with ❤️ for Amhara Media Corporation**