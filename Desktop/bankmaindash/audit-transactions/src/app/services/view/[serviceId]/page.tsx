"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  ArrowLeft,
  Edit,
  Trash2,
  Globe,
  FileImage,
  Info,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string;
  logo_url: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

const ServiceView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    // Simulate API call to fetch service data
    const fetchService = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockService: Service = {
          id: parseInt(params.serviceId as string),
          name: "Wallet to Account",
          description: "Funds transferred from mobile wallet to account",
          logo_url: "https://example.com/logo.png",
          status: true,
          created_at: "2025-09-10T11:21:44.798Z",
          updated_at: "2025-09-10T11:21:44.798Z"
        };
        
        setService(mockService);
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

  const handleEdit = () => {
    router.push(`/services/edit/${service?.id}`);
  };

  const handleDelete = () => {
    if (service) {
      // Show confirmation dialog here
      const confirmed = window.confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`);
      if (confirmed) {
        toast({
          title: "Service Deleted",
          description: `${service.name} has been deleted successfully.`,
        });
        router.push("/services");
      }
    }
  };

  const handleBack = () => {
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

  if (!service) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
          <TopBar onSidebarToggle={toggleSidebar} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Service Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">The service you're looking for doesn't exist.</p>
              <Button onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="p-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Service Details
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      View service information
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Service
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Service Overview Card */}
              <Card className="shadow-lg">
                <CardHeader className="space-y-1 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {service.name}
                    </CardTitle>
                    <Badge variant={service.status ? "default" : "secondary"} className="px-3 py-1">
                      {service.status ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </div>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Service Logo */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                      <img 
                        src={service.logo_url} 
                        alt={`${service.name} logo`}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <FileImage className="w-8 h-8 text-gray-400 hidden" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{service.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Service Logo</p>
                      <a 
                        href={service.logo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
                      >
                        View Original
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Service Name
                          </label>
                          <p className="text-gray-900 dark:text-gray-100 mt-1">{service.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FileImage className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Logo URL
                          </label>
                          <p className="text-gray-900 dark:text-gray-100 mt-1 break-all">{service.logo_url}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </label>
                          <div className="mt-1">
                            <Badge variant={service.status ? "default" : "secondary"} className="px-3 py-1">
                              {service.status ? (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </div>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Service ID
                          </label>
                          <p className="text-gray-900 dark:text-gray-100 mt-1 font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {service.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Description */}
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-gray-100 mt-1 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timestamp Information Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline Information
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <label className="text-sm font-medium text-green-800 dark:text-green-300">
                          Created At
                        </label>
                        <p className="text-green-900 dark:text-green-100 mt-1">
                          {new Date(service.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                          {new Date(service.created_at).toISOString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <label className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          Last Updated
                        </label>
                        <p className="text-blue-900 dark:text-blue-100 mt-1">
                          {new Date(service.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          {new Date(service.updated_at).toISOString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* JSON Data Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Raw JSON Data
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The complete service data in JSON format
                  </p>
                </CardHeader>
                
                <CardContent>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {JSON.stringify(service, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceView;
