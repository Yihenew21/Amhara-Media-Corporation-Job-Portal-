import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Send,
  ExternalLink,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Jobs", href: "/jobs" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const jobCategories = [
    { name: "Information Technology", href: "/jobs?department=Information Technology" },
    { name: "Media Production", href: "/jobs?department=Media Production" },
    { name: "Marketing & Communications", href: "/jobs?department=Marketing & Communications" },
    { name: "News & Current Affairs", href: "/jobs?department=News & Current Affairs" },
  ];

  const resources = [
    { name: "Career Tips", href: "/resources/career-tips" },
    { name: "Interview Guide", href: "/resources/interview-guide" },
    { name: "Resume Builder", href: "/resources/resume-builder" },
    { name: "Salary Guide", href: "/resources/salary-guide" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Accessibility", href: "/accessibility" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/amharamedia" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/amharamedia" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/amharamedia" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/amharamedia" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/amharamedia" },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg hero-gradient">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Amhara Media Corporation
                </h3>
                <p className="text-sm text-muted-foreground">Job Portal</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ethiopia's leading media organization, connecting talented professionals 
              with exciting career opportunities in media, technology, and communications.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4 text-primary" />
                Bahir Dar, Ethiopia
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                +251 58 220 0123
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                careers@amharamedia.com
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  asChild
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-sm font-semibold text-foreground pt-4">Job Categories</h4>
            <ul className="space-y-2">
              {jobCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>




          {/* Follow Us */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground pt-4">Follow Us</h4>
            <p className="text-sm text-muted-foreground">
              Stay connected with us on social media for the latest updates and news.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                  asChild
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="container py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Amhara Media Corporation. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>Made with ❤️ in Ethiopia</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Powered by Modern Technology</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <p className="text-xs text-muted-foreground">
              Built with modern technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;