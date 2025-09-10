"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit3,
  Trash2,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  Download,
  Calendar,
  Mail,
  Phone,
  User,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  jobTitle?: string;
  role: "Admin" | "Manager" | "User" | "Developer";
  memberSince: string;
  status: "Active" | "Inactive";
  lastLogin?: string;
}

const UserManagement: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        console.log('UserManagement: Fetching users from API...');
        const response = await apiClient.getUsers();
        console.log('UserManagement: API response received:', response);
        
        // Handle different possible response formats
        let usersArray = [];
        if (Array.isArray(response)) {
          usersArray = response;
        } else if (response?.data && Array.isArray(response.data)) {
          usersArray = response.data;
        } else if (response?.users && Array.isArray(response.users)) {
          usersArray = response.users;
        } else if (response?.result && Array.isArray(response.result)) {
          usersArray = response.result;
        } else {
          console.warn('UserManagement: Unexpected response format:', response);
          usersArray = [];
        }
        
        console.log('UserManagement: Extracted users array:', usersArray);
        
        // Transform API response to match our User interface
        const transformedUsers: User[] = usersArray.map((apiUser: any) => {
          // Ensure status is properly typed based on 'active' field
          const userStatus = apiUser.active === true ? 'Active' as const : 'Inactive' as const;
          
          // Map userRole to our role format
          const userRole = (() => {
            const role = apiUser.userRole || apiUser.role;
            if (role && typeof role === 'string') {
              const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
              return ['Admin', 'Manager', 'User', 'Developer'].includes(normalizedRole) ? normalizedRole : 'User';
            }
            return 'User';
          })() as 'Admin' | 'Manager' | 'User' | 'Developer';
          
          // Create full name from firstName and lastName
          const fullName = `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || 'Unknown User';
          
          // Format member since date
          const memberSince = (() => {
            const createdAt = apiUser.createdAt || apiUser.created_at;
            if (createdAt) {
              return new Date(createdAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            }
            return new Date().toLocaleDateString();
          })();
          
          return {
            id: String(apiUser.id || Math.random()),
            firstName: apiUser.firstName || 'Unknown',
            lastName: apiUser.lastName || '',
            fullName: fullName,
            email: apiUser.email || 'no-email@example.com',
            jobTitle: apiUser.jobTitle || undefined,
            role: userRole,
            memberSince: memberSince,
            status: userStatus,
            lastLogin: apiUser.lastLogin || undefined,
          };
        });
        
        console.log('UserManagement: Transformed users:', transformedUsers);
        setUsers(transformedUsers);
        
        toast({
          title: "Users Loaded",
          description: `Successfully loaded ${transformedUsers.length} users.`,
        });
      } catch (error: any) {
        console.error('UserManagement: Error fetching users:', error);
        console.error('UserManagement: Error details:', {
          message: error.message,
          status: error.status,
          details: error.details
        });
        
        toast({
          title: "Error Loading Users",
          description: error.message || "Failed to load users from the server.",
          variant: "destructive",
        });
        
        // Set empty array on error
        setUsers([]);
        
        // For debugging: let's also check if there's a network connectivity issue
        console.log('UserManagement: Checking if API endpoint is reachable...');
        try {
          const testResponse = await fetch(window.location.origin + '/api/health');
          console.log('UserManagement: Health check response:', testResponse.status);
        } catch (healthError) {
          console.error('UserManagement: Health check failed:', healthError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    router.push("/user-creation");
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditFormData({...user});
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast({
        title: "User Deleted",
        description: `${user.fullName} has been deleted successfully.`,
      });
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      )
    );
    toast({
      title: "Status Updated",
      description: `${user.fullName} is now ${newStatus}.`,
    });
  };

  const handleEditFormChange = (field: keyof User, value: string) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
        fullName: field === 'firstName' || field === 'lastName' 
          ? `${field === 'firstName' ? value : editFormData.firstName} ${field === 'lastName' ? value : editFormData.lastName}`
          : editFormData.fullName
      });
    }
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      try {
        console.log('UserManagement: Updating user:', editFormData);
        
        // Prepare user data for API
        const userData = {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          jobTitle: editFormData.jobTitle,
          userRole: editFormData.role, // Map our 'role' to API's 'userRole'
          active: editFormData.status === 'Active' // Map our 'status' to API's 'active' boolean
        };
        
        const response = await apiClient.updateUser(editFormData.id, userData);
        console.log('UserManagement: User updated successfully:', response);
        
        // Update local state
        setUsers(prev => 
          prev.map(u => 
            u.id === editFormData.id ? editFormData : u
          )
        );
        
        toast({
          title: "User Updated",
          description: `${editFormData.fullName} has been updated successfully.`,
        });
        
        setShowEditModal(false);
        setEditFormData(null);
      } catch (error: any) {
        console.error('UserManagement: Error updating user:', error);
        toast({
          title: "Error Updating User",
          description: error.message || "Failed to update user. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportUsers = () => {
    toast({
      title: "Export Started",
      description: "User data is being exported to CSV...",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Admin</Badge>;
      case "manager":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Manager</Badge>;
      case "supervisor":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Supervisor</Badge>;
      case "user":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const roles = ["Admin", "Manager", "User", "Developer"];
  const statuses = ["Active", "Inactive"];

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-16"
          }`}
        >
          <TopBar onSidebarToggle={toggleSidebar} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center text-white text-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      User Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage system users, roles, and permissions
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleExportUsers}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                  <Button 
                    onClick={handleCreateUser}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add User</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Users
                    </CardTitle>
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    All registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Users
                    </CardTitle>
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.status === "Active").length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Inactive Users
                    </CardTitle>
                    <UserX className="w-5 h-5 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.status === "Inactive").length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Inactive accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Administrators
                    </CardTitle>
                    <UserCheck className="w-5 h-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(u => u.role === "Admin").length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    System admins
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Users ({filteredUsers.length})
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage all system users and their permissions
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.jobTitle || user.role}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {user.email}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.jobTitle ? `Job: ${user.jobTitle}` : `Role: ${user.role}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(user.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                    {user.status === "Active" ? (
                                      <>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No users found matching your criteria
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  User Details
                </h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {selectedUser.jobTitle || selectedUser.role}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedUser.email}</span>
                  </div>
                </div>

                {selectedUser.jobTitle && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{selectedUser.jobTitle}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedUser.memberSince}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                  <div className="mt-1">
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={() => handleEditUser(selectedUser)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleToggleStatus(selectedUser)}
                >
                  {selectedUser.status === "Active" ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit User
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={editFormData.firstName}
                        onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        value={editFormData.lastName}
                        onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={editFormData.email}
                      onChange={(e) => handleEditFormChange('email', e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Title
                  </Label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={editFormData.jobTitle || ''}
                      onChange={(e) => handleEditFormChange('jobTitle', e.target.value)}
                      placeholder="Enter job title"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </Label>
                    <div className="mt-1">
                      <Select value={editFormData.role} onValueChange={(value) => handleEditFormChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </Label>
                    <div className="mt-1">
                      <Select value={editFormData.status} onValueChange={(value) => handleEditFormChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default UserManagement;
