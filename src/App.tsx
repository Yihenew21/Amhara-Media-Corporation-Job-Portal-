import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/Dashboard";
import JobManagement from "./pages/admin/JobManagement";
import CreateJob from "./pages/admin/CreateJob";
import EditJob from "./pages/admin/EditJob";
import ApplicationManagement from "./pages/admin/ApplicationManagement";
import AdminManagement from "./pages/admin/AdminManagement";
import Analytics from "./pages/admin/Analytics";
import Communications from "./pages/admin/Communications";
import ContactManagement from "./pages/admin/ContactManagement";
import JobApplication from "./pages/JobApplication";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <div className="min-h-screen bg-background">
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* User Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Job Application */}
                  <Route
                    path="/jobs/:id/apply"
                    element={
                      <ProtectedRoute>
                        <JobApplication />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/jobs"
                    element={
                      <ProtectedRoute requireAdmin>
                        <JobManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/jobs/new"
                    element={
                      <ProtectedRoute requireAdmin>
                        <CreateJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/jobs/:id/edit"
                    element={
                      <ProtectedRoute requireAdmin>
                        <EditJob />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/applications"
                    element={
                      <ProtectedRoute requireAdmin>
                        <ApplicationManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requireHRManager>
                        <AdminManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute requireAdmin>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/communications"
                    element={
                      <ProtectedRoute requireAdmin>
                        <Communications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/contacts"
                    element={
                      <ProtectedRoute requireAdmin>
                        <ContactManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
