"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  ArrowLeft,
  Save,
  Globe,
  FileImage,
  Info,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";

interface ServiceFormData {
  name: string;
  description: string;
  logo_url: string;
  status: boolean;
}

const ServiceCreation: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    logo_url: "",
    status: true
  });

  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ServiceFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleStatusChange = (status: boolean) => {
    setFormData(prev => ({
      ...prev,
      status
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Service name must be at least 3 characters long";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Service description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Service description must be at least 10 characters long";
    }

    if (!formData.logo_url.trim()) {
      newErrors.logo_url = "Logo URL is required";
    } else if (
      !/^https?:\/\/.+/.test(formData.logo_url) && 
      !/^data:image\/(jpeg|jpg|png|gif|svg);base64,/.test(formData.logo_url)
    ) {
      newErrors.logo_url = "Please enter a valid URL or base64 image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Create service using API
      const serviceData = {
        name: formData.name,
        description: formData.description,
        logo_url: formData.logo_url,
        status: formData.status ? 'true' : 'false'
      };

      console.log("Creating service:", serviceData);
      
      const response = await apiClient.createService(serviceData);
      
      console.log("Service created successfully:", response);

      toast({
        title: "Service Created Successfully",
        description: `${formData.name} has been created and is now ${formData.status ? 'active' : 'inactive'}.`,
      });

      // Navigate back to service management
      router.push("/services");
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/services");
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
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Create New Service
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Add a new service to the system
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full">
              {/* Main Form */}
              <Card className="shadow-lg">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Service Information
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fill in the details for the new service
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Basic Information
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Service Name */}
                        <div>
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Service Name *
                          </Label>
                          <div className="relative mt-1">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="e.g., Wallet to Account"
                              className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                            />
                          </div>
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                          )}
                        </div>

                        {/* Logo URL */}
                        <div>
                          <Label htmlFor="logo_url" className="flex items-center gap-2">
                            <FileImage className="h-4 w-4" />
                            Logo URL *
                          </Label>
                          <div className="relative mt-1">
                            <FileImage className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="logo_url"
                              name="logo_url"
                              type="url"
                              value={formData.logo_url}
                              onChange={handleInputChange}
                              placeholder="https://example.com/logo.png"
                              className={`pl-10 ${errors.logo_url ? 'border-red-500' : ''}`}
                            />
                          </div>
                          {errors.logo_url && (
                            <p className="text-red-500 text-xs mt-1">{errors.logo_url}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Accepts any valid URL or base64 image
                          </p>
                        </div>
                      </div>

                      {/* Service Description - Full Width */}
                      <div>
                        <Label htmlFor="description" className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Description *
                        </Label>
                        <div className="relative mt-1">
                          <Info className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e)}
                            placeholder="e.g., Funds transferred from mobile wallet to account"
                            rows={4}
                            className={`pl-10 resize-none ${errors.description ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.description && (
                          <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                      </div>
                    </div>                      {/* Service Status Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                          Service Status
                        </h3>
                        
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Initial Status *
                          </Label>
                          <Select 
                            value={formData.status ? "active" : "inactive"} 
                            onValueChange={(value) => handleStatusChange(value === "active")}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select initial status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <div>
                                    <div className="font-medium">Active</div>
                                    <div className="text-sm text-gray-500">Service will be available immediately</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="inactive">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <div>
                                    <div className="font-medium">Inactive</div>
                                    <div className="text-sm text-gray-500">Service will be created but disabled</div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-8"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Creating Service...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Save className="h-4 w-4" />
                              Create Service
                            </div>
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancel}
                          className="flex-1 sm:flex-none"
                          disabled={isLoading}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Cancel
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

export default ServiceCreation;
