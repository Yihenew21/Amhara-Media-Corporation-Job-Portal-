import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Calendar,
  Search,
  Filter,
} from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'hr_manager';
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
  user_email: string;
}

const AdminManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "admin" as 'admin' | 'hr_manager' | 'super_admin',
    password: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchTerm, roleFilter]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          profiles!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Simulate getting user emails (in production, this would be done via a server function)
      const adminsWithEmails = (adminData || []).map((admin, index) => ({
        ...admin,
        user_email: `admin${index + 1}@amharamedia.com`, // Simulated email
      }));

      setAdmins(adminsWithEmails);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(
        (admin) =>
          `${admin.profiles.first_name} ${admin.profiles.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((admin) => admin.role === roleFilter);
    }

    setFilteredAdmins(filtered);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real application, this would be done via a server function
      // For demo purposes, we'll simulate the process
      
      toast({
        title: "Feature Demo",
        description: "In production, this would create a new admin user and send an invitation email.",
      });
      
      setShowAddDialog(false);
      setNewAdminData({
        email: "",
        firstName: "",
        lastName: "",
        role: "admin",
        password: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create admin user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateAdminRole = async (adminId: string, newRole: string) => {
    try {
      // In production, this would update the database
      console.log(`Updating admin ${adminId} to role ${newRole}`);

      toast({
        title: "Success",
        description: "Admin role updated successfully. (Demo mode)",
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin role:', error);
      toast({
        title: "Error",
        description: "Failed to update admin role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove this admin? This action cannot be undone.")) {
      return;
    }

    try {
      // In production, this would delete from database
      console.log(`Deleting admin ${adminId}`);

      toast({
        title: "Success",
        description: "Admin user removed successfully. (Demo mode)",
      });

      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="h-4 w-4 text-red-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'hr_manager':
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'hr_manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
              <p className="text-muted-foreground">
                Manage administrator accounts and permissions
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Administrator</DialogTitle>
                  <DialogDescription>
                    Create a new admin account and send an invitation email.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newAdminData.firstName}
                        onChange={(e) => setNewAdminData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newAdminData.lastName}
                        onChange={(e) => setNewAdminData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newAdminData.role} onValueChange={(value: any) => setNewAdminData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr_manager">HR Manager</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="super_admin">Super Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Will be sent via email"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Create Admin</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Search & Filter Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="hr_manager">HR Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Admins List */}
        <div className="space-y-4">
          {filteredAdmins.length === 0 ? (
            <Card className="text-center py-12 shadow-soft">
              <CardContent>
                <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No admins found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== "all" 
                    ? "Try adjusting your search criteria." 
                    : "No admin users have been created yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAdmins.map((admin) => (
              <Card key={admin.id} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {admin.profiles.first_name} {admin.profiles.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{admin.user_email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(admin.role)}
                          <Badge className={getRoleColor(admin.role)}>
                            {admin.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Created {formatDate(admin.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-1 h-4 w-4" />
                          {admin.user_email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Select 
                        value={admin.role} 
                        onValueChange={(value) => updateAdminRole(admin.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr_manager">HR Manager</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteAdmin(admin.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;