"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { apiClient } from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Lock,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    username: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    role: "",
    active: true,
    createdAt: "",
    updatedAt: "",
    lastLogin: "",
    loginAttempts: 0,
    assignments: 0,
  });

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setEditedProfile({
        username: user.username || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        firstName: (user as any).firstName || "",
        lastName: (user as any).lastName || "",
        jobTitle: (user as any).jobTitle || "",
        role: user.role || "User",
        active: (user as any).active ?? true,
        createdAt: (user as any).createdAt || "",
        updatedAt: (user as any).updatedAt || "",
        lastLogin: (user as any).lastLogin || "",
        loginAttempts: (user as any).loginAttempts || 0,
        assignments: (user as any).assignments || 0,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) {
      console.error("No user ID available for update");
      return;
    }

    try {
      console.log("Saving profile:", editedProfile);
      
      // Call the API to update user profile
      const response = await apiClient.updateUserProfile(user.id.toString(), editedProfile);
      console.log("Profile updated successfully:", response);
      
      // Refresh user data from the database to get the latest info
      await refreshUser();
      console.log("User data refreshed from database");
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      // You might want to show an error message to the user here
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedProfile({
        username: user.username || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        firstName: (user as any).firstName || "",
        lastName: (user as any).lastName || "",
        jobTitle: (user as any).jobTitle || "",
        role: user.role || "User",
        active: (user as any).active ?? true,
        createdAt: (user as any).createdAt || "",
        updatedAt: (user as any).updatedAt || "",
        lastLogin: (user as any).lastLogin || "",
        loginAttempts: (user as any).loginAttempts || 0,
        assignments: (user as any).assignments || 0,
      });
    }
    setIsEditing(false);
  };

  const getInitials = (firstName: string = "", lastName: string = "", username: string = "") => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDisplayName = () => {
    if (editedProfile.firstName && editedProfile.lastName) {
      return `${editedProfile.firstName} ${editedProfile.lastName}`;
    }
    return editedProfile.username;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {getInitials(editedProfile.firstName, editedProfile.lastName, editedProfile.username)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{getDisplayName()}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{editedProfile.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{editedProfile.jobTitle}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} size="sm" variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Account Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Role:
                  </span>
                  <span className="font-semibold">{editedProfile.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Member Since:
                  </span>
                  <span>{formatDate(editedProfile.createdAt) || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Status:
                  </span>
                  <Badge className={editedProfile.active 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }>
                    {editedProfile.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <ScrollArea className="h-[400px] w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4 pb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-400">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editedProfile.firstName}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              firstName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-400">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editedProfile.lastName}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              lastName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-400">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editedProfile.username}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              username: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Mail className="w-5 h-5" />
                      <span>Contact</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-400">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editedProfile.email}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              email: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-400">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editedProfile.phone}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              phone: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-600 dark:text-gray-400">Job Title</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editedProfile.jobTitle}
                          onChange={(e) =>
                            setEditedProfile({
                              ...editedProfile,
                              jobTitle: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      Disabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Login Sessions</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage your active sessions across devices
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
