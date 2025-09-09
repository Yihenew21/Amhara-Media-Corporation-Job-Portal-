import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-medium text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button className="flex-1" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Unauthorized;