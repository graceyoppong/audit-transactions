"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  UserPlus,
  Mail,
  User,
  Lock,
  Save,
  Phone,
  Briefcase,
  Shield,
} from "lucide-react";

interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  jobTitle: string;
  userRole: string;
  password: string;
  confirmPassword: string;
}

const UserCreation: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    username: "",
    jobTitle: "",
    userRole: "Admin",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user selects
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!formData.userRole) {
      newErrors.userRole = "Role is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        username: formData.username,
        jobTitle: formData.jobTitle,
        userRole: formData.userRole,
        assignments: 0,
        active: true
      };
      
      await apiClient.createUser(userData);

      toast({
        title: "Success!",
        description: `User ${formData.firstName} ${formData.lastName} has been created successfully.`,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        username: "",
        jobTitle: "",
        userRole: "Admin",
        password: "",
        confirmPassword: ""
      });
      setErrors({});

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
          <TopBar onSidebarToggle={toggleSidebar} />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Create New User
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Add a new user to the system with their role and permissions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    User Information
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please fill in all required fields to create a new user account
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {/* First Name */}
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          First Name *
                        </Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="e.g., Yaa"
                            className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Name *
                        </Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="e.g., Horlali"
                            className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                      </div>

                      {/* Username */}
                      <div>
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Username *
                        </Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="e.g., grace"
                            className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.username && (
                          <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number *
                        </Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g., +233123658"
                            className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address *
                        </Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="user@bankdash.com"
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>

                      {/* Job Title */}
                      <div>
                        <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Job Title *
                        </Label>
                        <div className="relative mt-1">
                          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="jobTitle"
                            name="jobTitle"
                            type="text"
                            value={formData.jobTitle}
                            onChange={handleInputChange}
                            placeholder="e.g., Software Developer, Manager, Analyst"
                            className={`pl-10 ${errors.jobTitle ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.jobTitle && (
                          <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>
                        )}
                      </div>

                      {/* Role */}
                      <div>
                        <Label htmlFor="userRole" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Role *
                        </Label>
                        <div className="mt-1">
                          <Select value={formData.userRole} onValueChange={(value) => handleSelectChange('userRole', value)}>
                            <SelectTrigger className={`${errors.userRole ? 'border-red-500' : ''}`}>
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
                        {errors.userRole && (
                          <p className="text-red-500 text-xs mt-1">{errors.userRole}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Password *
                        </Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                            className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm Password *
                        </Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password"
                            className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isLoading ? "Creating..." : "Create User"}</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default UserCreation;
