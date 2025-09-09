import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, User, Briefcase, LogIn, UserPlus, LogOut } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg hero-gradient">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Amhara Media Corporation
            </h1>
            <p className="text-xs text-muted-foreground">Job Portal</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/jobs") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Jobs
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Admin Dashboard
            </Link>
          )}
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/contact") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {loading ? (
            <div className="w-20 h-8 bg-muted animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.first_name || user.email}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-3">
            <Link
              to="/"
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              to="/about"
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-3 border-t space-y-2">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Welcome, {profile?.first_name || user.email}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      signOut();
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;