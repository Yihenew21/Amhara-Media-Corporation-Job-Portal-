import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Building } from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  department: string;
  location: string;
  postedDate: string;
  description: string;
  requirements: string[];
  expiryDate?: string;
  isActive?: boolean;
}

const JobCard = ({
  id,
  title,
  department,
  location,
  postedDate,
  description,
  requirements,
  expiryDate = "2024-12-31",
  isActive = true,
}: JobCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpiringSoon = () => {
    const expiryTime = new Date(expiryDate).getTime();
    const now = new Date().getTime();
    const daysUntilExpiry = (expiryTime - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = () => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-medium hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="mr-1 h-4 w-4" />
              {department}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {isExpired() ? (
              <Badge variant="destructive">Expired</Badge>
            ) : isExpiringSoon() ? (
              <Badge variant="secondary" className="bg-warning text-warning-foreground">
                Expiring Soon
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-success text-success-foreground">
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          {location}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Requirements:</h4>
          <div className="flex flex-wrap gap-1">
            {requirements.slice(0, 3).map((req, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
            {requirements.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{requirements.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            Posted: {formatDate(postedDate)}
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            Expires: {formatDate(expiryDate)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex w-full space-x-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/jobs/${id}`}>View Details</Link>
          </Button>
          {!isExpired() && (
            <Button size="sm" className="flex-1" asChild>
              <Link to={`/jobs/${id}/apply`}>Apply Now</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;