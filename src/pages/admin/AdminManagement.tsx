import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  UserPlus,
  User,
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
  role: "super_admin" | "admin" | "hr_manager";
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
  const { profile, isSuperAdmin } = useAuth();

  // Helper functions for role-based permissions
  const canAddAdmins = () => {
    return isSuperAdmin || profile?.role === "hr_manager";
  };

  const canEditAdmin = (admin: AdminUser) => {
    // Super admin can edit anyone, HR admins can edit non-super-admins, regular admins can only edit themselves
    if (isSuperAdmin) return true;
    if (profile?.role === "hr_manager" && admin.role !== "super_admin")
      return true;
    if (profile?.user_id === admin.user_id) return true;
    return false;
  };

  const canDeleteAdmin = (admin: AdminUser) => {
    // Only super admin can delete admins, and cannot delete themselves
    return isSuperAdmin && profile?.user_id !== admin.user_id;
  };

  const canChangeRole = (admin: AdminUser) => {
    // Only super admin can change roles, and cannot change their own role
    return isSuperAdmin && profile?.user_id !== admin.user_id;
  };

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [newAdminData, setNewAdminData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "admin" as "admin" | "hr_manager" | "super_admin",
    password: "",
  });
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
      // Fetch admin users using separate queries to avoid 400 errors
      const { data: adminData, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (adminData && adminData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(adminData.map((admin) => admin.user_id))];

        // Fetch profiles data
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        // Fetch user emails from auth.users (this requires a server function in production)
        // For now, we'll create a mapping of user IDs to emails
        const userEmailMap: { [key: string]: string } = {};

        // In a real application, you'd call a server function to get emails
        // For now, we'll use a placeholder that shows the user ID
        userIds.forEach((userId) => {
          userEmailMap[userId] = `user-${userId.slice(-8)}@example.com`;
        });

        // Combine the data
        const adminsWithProfiles = adminData.map((admin) => {
          const profile = profiles?.find(
            (profile) => profile.user_id === admin.user_id
          ) || {
            first_name: "Unknown",
            last_name: "User",
          };

          return {
            ...admin,
            profiles: profile,
            user_email:
              userEmailMap[admin.user_id] ||
              `user-${admin.user_id.slice(-8)}@example.com`,
          };
        });

        setAdmins(adminsWithProfiles);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
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
          `${admin.profiles.first_name} ${admin.profiles.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
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
        description:
          "In production, this would create a new admin user and send an invitation email.",
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
      const { error } = await supabase
        .from("admin_users")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", adminId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin role updated to ${newRole.replace("_", " ")}.`,
      });

      fetchAdmins();
    } catch (error) {
      console.error("Error updating admin role:", error);
      toast({
        title: "Error",
        description: "Failed to update admin role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAdmin = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", adminToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin user removed successfully.",
      });

      setShowDeleteDialog(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Error",
        description: "Failed to remove admin user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditProfileDialog = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setProfileData({
      firstName: admin.profiles.first_name || "",
      lastName: admin.profiles.last_name || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowEditProfileDialog(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingAdmin) return;

    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", editingAdmin.user_id);

      if (profileError) throw profileError;

      // Update password if provided
      if (
        profileData.newPassword &&
        profileData.newPassword === profileData.confirmPassword
      ) {
        if (profile?.user_id === editingAdmin.user_id) {
          // Update current user's own password
          const { error: passwordError } = await supabase.auth.updateUser({
            password: profileData.newPassword,
          });

          if (passwordError) throw passwordError;
        } else if (isSuperAdmin) {
          // Super admin can reset other users' passwords using admin API
          try {
            const { error: resetError } =
              await supabase.auth.admin.updateUserById(editingAdmin.user_id, {
                password: profileData.newPassword,
              });

            if (resetError) throw resetError;
          } catch (error) {
            console.error("Error resetting password:", error);
            toast({
              title: "Error",
              description: "Failed to reset password. Please try again.",
              variant: "destructive",
            });
            return;
          }
        } else {
          // Regular admins cannot change other users' passwords
          toast({
            title: "Info",
            description: "Only super admins can reset other users' passwords.",
          });
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      setShowEditProfileDialog(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return <ShieldCheck className="h-4 w-4 text-red-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "hr_manager":
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "hr_manager":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Management
              </h1>
              <p className="text-muted-foreground">
                Manage administrator accounts and permissions
              </p>
            </div>
            {canAddAdmins() && (
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
                          onChange={(e) =>
                            setNewAdminData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={newAdminData.lastName}
                          onChange={(e) =>
                            setNewAdminData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
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
                        onChange={(e) =>
                          setNewAdminData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newAdminData.role}
                        onValueChange={(value: any) =>
                          setNewAdminData((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr_manager">HR Manager</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="super_admin">
                            Super Administrator
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Temporary Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newAdminData.password}
                        onChange={(e) =>
                          setNewAdminData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Will be sent via email"
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Create Admin
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
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
                    : "No admin users have been created yet."}
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
                            {admin.profiles.first_name}{" "}
                            {admin.profiles.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {admin.user_email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(admin.role)}
                          <Badge className={getRoleColor(admin.role)}>
                            {admin.role.replace("_", " ").toUpperCase()}
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
                      {canChangeRole(admin) && (
                        <Select
                          value={admin.role}
                          onValueChange={(value) =>
                            updateAdminRole(admin.id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hr_manager">
                              HR Manager
                            </SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="super_admin">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {canEditAdmin(admin) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditProfileDialog(admin)}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      )}

                      {canDeleteAdmin(admin) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAdmin(admin)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Profile Dialog */}
        <Dialog
          open={showEditProfileDialog}
          onOpenChange={setShowEditProfileDialog}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information and password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Show password fields for current user's own profile or for super admin editing others */}
              {(profile?.user_id === editingAdmin?.user_id || isSuperAdmin) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      {profile?.user_id === editingAdmin?.user_id
                        ? "Current Password"
                        : "Admin Password (for verification)"}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder={
                        profile?.user_id === editingAdmin?.user_id
                          ? "Enter current password to change password"
                          : "Enter your admin password to reset user password"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {profile?.user_id === editingAdmin?.user_id
                        ? "New Password"
                        : "New Password for User"}
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      placeholder={
                        profile?.user_id === editingAdmin?.user_id
                          ? "Leave empty to keep current password"
                          : "Enter new password for this user"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {profile?.user_id === editingAdmin?.user_id
                        ? "Confirm New Password"
                        : "Confirm New Password for User"}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder={
                        profile?.user_id === editingAdmin?.user_id
                          ? "Confirm new password"
                          : "Confirm new password for this user"
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Update Profile
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditProfileDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Admin Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Admin</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove{" "}
                {adminToDelete?.profiles?.first_name}{" "}
                {adminToDelete?.profiles?.last_name} as an admin? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAdmin}>
                Delete Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminManagement;
