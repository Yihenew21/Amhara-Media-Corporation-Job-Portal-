# JobFlow Amhara - Job Portal for Amhara Media Corporation

> A comprehensive job portal application built for Amhara Media Corporation, enabling efficient recruitment management and job application processes.

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.3-green.svg)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-teal.svg)](https://tailwindcss.com/)

## 🌟 Features

### 🔐 Authentication & Authorization

- Multi-role authentication (Job Seekers, HR Admins, Super Admins)
- Protected routes with role-based access control
- Secure user profile management
- Supabase Auth integration

### 💼 Job Management

- Complete job posting CRUD operations
- Advanced job filtering and search
- Job categorization by department and location
- Application deadline management with automatic expiry
- Job status tracking (Active/Inactive)
- Position-based application management
- Key responsibilities and detailed job descriptions

### 📝 Application System

- Streamlined job application process
- CV/Resume upload with file validation and viewing
- Cover letter support
- Application status tracking with real-time updates
- Duplicate application prevention
- Smart application visibility based on position availability

### 🏢 Admin Dashboard

- Comprehensive admin analytics with real-time data
- Job management interface with position tracking
- Application review and management with smart filtering
- User management (Super Admin & HR Manager roles)
- Advanced communication management system
- Data export capabilities

### 📧 Communication Management System

- **Email Templates**: Create, edit, and manage reusable email templates
- **Template Categories**: Status updates, interview invites, rejections, welcome messages
- **Bulk Communications**: Send emails to all applicants for specific jobs
- **Communication History**: Track all sent emails with delivery status
- **Smart Filtering**: Hide applications when positions are filled
- **Real-time Updates**: Live communication tracking and status updates

### 📊 Analytics & Reporting

- Real-time recruitment metrics
- Department-wise statistics
- Application status breakdowns
- Monthly trend analysis
- Exportable reports (CSV)

### 🎨 User Experience

- Responsive design for all devices
- Dark/Light theme support
- Modern UI with shadcn/ui components
- Intuitive navigation and user flows
- Loading states and error handling

## 🛠 Technology Stack

### Frontend

- **React 18.3.1** - UI library
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and development server
- **TailwindCSS** - Styling framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Server state management
- **React Router** - Client-side routing

### Backend & Database

- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security (RLS)** - Data security
- **Supabase Storage** - File storage for CVs

### Development & Testing

- **Vitest** - Testing framework
- **Testing Library** - React component testing
- **ESLint** - Code linting
- **TypeScript** - Static type checking

### Deployment

- **Docker** - Containerization
- **Nginx** - Web server and reverse proxy
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd jobflow-amhara
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database setup**

   - Run the migration files in your Supabase SQL editor:

   ```sql
   -- Execute: supabase/migrations/20250909135203_fcfc1f5b-77da-447c-a6cf-aeafeed2e568.sql
   -- Execute: add-communication-tables.sql (for communication management)
   ```

5. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📱 Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ErrorBoundary.tsx
│   ├── AdvancedJobFilters.tsx
│   └── SEO.tsx
├── pages/              # Application pages
│   ├── admin/          # Admin dashboard pages
│   │   ├── Communications.tsx  # Communication management
│   │   ├── ApplicationManagement.tsx
│   │   ├── AdminManagement.tsx
│   │   └── ...
│   ├── Home.tsx
│   ├── Jobs.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx
│   ├── useJobs.tsx
│   ├── useNotifications.tsx
│   └── useExport.tsx
├── services/           # API services
│   └── jobService.ts
├── lib/                # Utilities and helpers
│   ├── errors.ts
│   └── utils.ts
├── types/              # TypeScript type definitions
├── integrations/       # External service integrations
│   └── supabase/
└── test/               # Test setup and utilities
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Lint code
npm run type-check       # TypeScript type checking
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose up --build
```

### Production

```bash
# Build and run production containers
docker-compose -f docker-compose.yml up --build -d
```

The application will be available at `http://localhost:3000`

## 👥 User Roles & Permissions

### Job Seekers

- Browse and search jobs
- Apply for positions
- Track application status
- Manage profile

### HR Managers

- Manage job postings
- Review applications
- Update application status
- Access analytics
- Send notifications and bulk communications
- Manage email templates
- Add and manage other admin users

### Super Admins

- All HR Manager permissions
- Manage admin users and roles
- System-wide analytics
- Export data
- Full system administration

## 📧 Communication Management

The system includes a comprehensive communication management system:

### Email Templates

- **Application Received**: Automatic confirmation emails
- **Interview Invitations**: Structured interview scheduling
- **Status Updates**: Application progress notifications
- **Rejection Notices**: Professional rejection communications
- **Welcome Messages**: New employee onboarding

### Communication Features

- **Template Management**: Create, edit, and organize email templates
- **Bulk Communications**: Send emails to all applicants for specific jobs
- **Communication History**: Track all sent emails with delivery status
- **Smart Filtering**: Automatically hide applications when positions are filled
- **Real-time Tracking**: Monitor email delivery and status

### Database Integration

- All communications are stored in the database
- Complete audit trail of all email activities
- Integration with job applications and user profiles
- Role-based access control for communication management

_Note: Email sending is currently simulated for development. Integrate with your preferred email service (SendGrid, AWS SES, etc.) for production._

## 🔒 Security Features

- Row Level Security (RLS) policies
- Role-based access control
- Secure file uploads
- Input validation and sanitization
- HTTPS enforcement (production)
- Security headers via Nginx

## 🚀 Performance Optimizations

- Code splitting with lazy loading
- Image optimization
- Gzip compression
- CDN-ready static assets
- Efficient database queries
- Caching strategies

## 🆕 Recent Updates & Improvements

### Communication Management System

- ✅ **Complete Email Template System**: Create, edit, delete, and manage email templates
- ✅ **Bulk Communication**: Send emails to all applicants for specific jobs
- ✅ **Communication History**: Track all sent emails with delivery status
- ✅ **Database Integration**: All communications stored with full audit trail

### Job Management Enhancements

- ✅ **Position Tracking**: Jobs now support multiple positions with smart application filtering
- ✅ **Key Responsibilities**: Detailed job descriptions with key responsibilities
- ✅ **Automatic Expiry**: Jobs automatically expire after deadline
- ✅ **Real-time Statistics**: Home page displays real data from backend

### Application Management

- ✅ **Smart Visibility**: Applications hidden when positions are filled
- ✅ **CV Viewing**: Admins can view applicant CVs directly
- ✅ **Real Email Integration**: Display actual user emails (ready for auth integration)
- ✅ **Enhanced Filtering**: Better application categorization and management

### Admin Dashboard Improvements

- ✅ **Real-time Data**: All statistics now show actual data from database
- ✅ **HR Manager Role**: New role with specific permissions
- ✅ **Enhanced User Management**: Better admin user management with role-based access
- ✅ **Improved UI/UX**: Better loading states, error handling, and user feedback

### Technical Improvements

- ✅ **Database Optimization**: Better queries and data fetching
- ✅ **Error Handling**: Comprehensive error handling throughout the application
- ✅ **Loading States**: Skeleton loaders and better user feedback
- ✅ **Code Quality**: Improved TypeScript types and code organization

## 🧪 Testing

The project includes comprehensive testing:

- Unit tests for utilities and hooks
- Component tests for UI elements
- Integration tests for user flows
- Error boundary testing

Run tests with:

```bash
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Amhara Media Corporation for the opportunity
- The open-source community for the amazing tools
- Contributors and testers

---

**Built with ❤️ for Amhara Media Corporation**
