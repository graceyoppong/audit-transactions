"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  ArrowLeft,
  Save,
  Globe,
  FileImage,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ServiceFormData {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

const ServiceEdit: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<ServiceFormData>({
    id: 0,
    name: "",
    description: "",
    logo_url: "",
    status: true,
    created_at: "",
    updated_at: ""
  });

  const [errors, setErrors] = useState<Partial<Omit<ServiceFormData, 'id' | 'created_at' | 'updated_at'>>>({});

  useEffect(() => {
    // Simulate API call to fetch service data
    const fetchService = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockService = {
          id: parseInt(params.serviceId as string),
          name: "Wallet to Account",
          description: "Funds transferred from mobile wallet to account",
          logo_url: "https://example.com/logo.png",
          status: true,
          created_at: "2025-09-10T11:21:44.798Z",
          updated_at: "2025-09-10T11:21:44.798Z"
        };
        
        setFormData(mockService);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load service data.",
          variant: "destructive",
        });
        router.push("/services");
      } finally {
        setLoading(false);
      }
    };

    if (params.serviceId) {
      fetchService();
    }
  }, [params.serviceId, router, toast]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
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
    const newErrors: Partial<Omit<ServiceFormData, 'id' | 'created_at' | 'updated_at'>> = {};

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call to update the service
      console.log("Updating service:", {
        ...formData,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Service Updated Successfully",
        description: `${formData.name} has been updated.`,
      });

      // Navigate back to service management
      router.push("/services");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/services");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
          <TopBar onSidebarToggle={toggleSidebar} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading service data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
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
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Edit Service
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update service information
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Service Information
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update the details for this service
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Service Name */}
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        <Label htmlFor="logo_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      </div>
                    </div>

                    {/* Service Description */}
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description *
                      </Label>
                      <div className="relative mt-1">
                        <Info className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="e.g., Funds transferred from mobile wallet to account"
                          rows={4}
                          className={`w-full pl-10 pr-4 py-2 border rounded-md resize-none text-sm ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                      </div>
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                      )}
                    </div>

                    {/* Service Status */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Service Status *
                      </Label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(true)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                            formData.status
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <CheckCircle className={`h-5 w-5 ${formData.status ? 'text-green-500' : 'text-gray-400'}`} />
                          <div className="text-left">
                            <div className="font-medium">Active</div>
                            <div className="text-sm text-gray-500">Service is available to users</div>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleStatusChange(false)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                            !formData.status
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <XCircle className={`h-5 w-5 ${!formData.status ? 'text-red-500' : 'text-gray-400'}`} />
                          <div className="text-left">
                            <div className="font-medium">Inactive</div>
                            <div className="text-sm text-gray-500">Service is disabled</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Service Metadata */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Service Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Service ID:</span>
                          <p className="font-medium">{formData.id}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>
                          <p className="font-medium">
                            {new Date(formData.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                          <p className="font-medium">
                            {new Date(formData.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Updating Service...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Update Service
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
  );
};

export default ServiceEdit;
