"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { apiClient } from "@/lib/apiClient";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  UserCheck,
  Building,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CreateUserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  role: string;
  password: string;
  confirmPassword: string;
}

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    jobTitle: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { isDark } = useTheme();
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    // Role validation
    if (!formData.role) {
      errors.role = "Role is required";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CreateUserData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear specific field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
    if (validationErrors.role) {
      setValidationErrors({ ...validationErrors, role: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to create the user
      const userData = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        jobTitle: formData.jobTitle || undefined,
        role: formData.role,
        password: formData.password,
      };

      const response = await apiClient.createUser(userData);
      
      if (response.success || response.status === "SUCCESS") {
        setSuccess("User created successfully! You can now login with the new credentials.");
        
        // Clear form
        setFormData({
          username: "",
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          jobTitle: "",
          role: "",
          password: "",
          confirmPassword: "",
        });
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(response.message || "Failed to create user. Please try again.");
      }
      
    } catch (error: any) {
      console.error('User creation error:', error);
      setError(error.message || "Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Left Side - Image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80')`,
        }}
      >
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
          <div className="text-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-sm mx-auto">
              <span className="text-4xl font-bold">B</span>
            </div>
            <h1 className="text-6xl font-bold mb-6">BankDash</h1>
            <p className="text-xl text-center text-blue-100 max-w-md leading-relaxed">
              Create a new user account to access banking transaction monitoring
              and analytics platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className={`w-full lg:w-1/2 flex items-start justify-center p-8 overflow-y-auto ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              BankDash
            </h1>
          </div>

          {/* Back to Login Link */}
          <div className="mb-6">
            <Link
              href="/login"
              className={`inline-flex items-center text-sm hover:underline ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>

          <Card
            className={`shadow-xl ${
              isDark
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border-0"
            }`}
          >
            <CardHeader className="space-y-1 pb-6">
              <CardTitle
                className={`text-2xl font-bold text-center ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Create New User
              </CardTitle>
              <CardDescription
                className={`text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Fill in the details to create a new user account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert
                    className={`${
                      isDark
                        ? "border-red-600 bg-red-900/20"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <AlertDescription
                      className={`${isDark ? "text-red-400" : "text-red-700"}`}
                    >
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert
                    className={`${
                      isDark
                        ? "border-green-600 bg-green-900/20"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <CheckCircle className={`h-4 w-4 ${isDark ? "text-green-400" : "text-green-600"}`} />
                    <AlertDescription
                      className={`${isDark ? "text-green-400" : "text-green-700"}`}
                    >
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Username *
                  </Label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={handleInputChange("username")}
                      className="pl-10"
                      required
                    />
                  </div>
                  {validationErrors.username && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {validationErrors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      className="pl-10"
                      required
                    />
                  </div>
                  {validationErrors.email && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      required
                    />
                    {validationErrors.firstName && (
                      <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                        {validationErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange("lastName")}
                      required
                    />
                    {validationErrors.lastName && (
                      <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                        {validationErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange("phone")}
                      className="pl-10"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {validationErrors.phone}
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="jobTitle"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Job Title
                  </Label>
                  <div className="relative">
                    <Building
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="jobTitle"
                      type="text"
                      placeholder="Enter job title"
                      value={formData.jobTitle}
                      onChange={handleInputChange("jobTitle")}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Role *
                  </Label>
                  <div className="relative">
                    <UserCheck
                      className={`absolute left-3 top-3 h-4 w-4 z-10 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {validationErrors.role && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {validationErrors.role}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff
                          className={`h-4 w-4 ${
                            isDark ? "text-gray-400" : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <Eye
                          className={`h-4 w-4 ${
                            isDark ? "text-gray-400" : "text-gray-400"
                          }`}
                        />
                      )}
                    </Button>
                  </div>
                  {validationErrors.password && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className={`${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-3 h-4 w-4 ${
                        isDark ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange("confirmPassword")}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          className={`h-4 w-4 ${
                            isDark ? "text-gray-400" : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <Eye
                          className={`h-4 w-4 ${
                            isDark ? "text-gray-400" : "text-gray-400"
                          }`}
                        />
                      )}
                    </Button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating User..." : "Create User"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className={`font-medium hover:underline ${
                      isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
