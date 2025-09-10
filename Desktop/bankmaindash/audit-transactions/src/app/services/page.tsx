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
import { Textarea } from "@/components/ui/textarea";
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

interface Service {
  id: number;
  name: string;
  description: string;
  logo_url?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

// ServiceLogo component with similar logic to TransactionCard
const ServiceLogo: React.FC<{ logoUrl?: string; serviceName: string }> = ({ logoUrl, serviceName }) => {
  // Fallback logo URLs for known banks
  const getFallbackLogoUrl = (serviceName: string): string | null => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('public bank')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Public_Bank_Berhad_logo.svg/1200px-Public_Bank_Berhad_logo.svg.png';
    }
    if (name.includes('maybank')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Maybank_Logo.svg/1200px-Maybank_Logo.svg.png';
    }
    if (name.includes('cimb')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/CIMB_Bank_Berhad_logo.svg/1200px-CIMB_Bank_Berhad_logo.svg.png';
    }
    
    return null;
  };
  
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | undefined>(logoUrl);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);
  
  const handleImageError = () => {
    console.error(`Failed to load logo for ${serviceName}:`, currentLogoUrl);
    
    if (!hasFailedOnce) {
      // Try fallback URL first
      const fallbackUrl = getFallbackLogoUrl(serviceName);
      if (fallbackUrl && fallbackUrl !== currentLogoUrl) {
        console.log(`Trying fallback logo for ${serviceName}:`, fallbackUrl);
        setCurrentLogoUrl(fallbackUrl);
        setHasFailedOnce(true);
        return;
      }
    }
    
    // If fallback also fails or no fallback available, show Globe icon
    setCurrentLogoUrl(undefined);
  };
  
  return currentLogoUrl ? (
    <img
      key={currentLogoUrl} // Force re-render when URL changes
      src={currentLogoUrl}
      alt={serviceName}
      className="h-10 w-10 object-contain rounded-lg"
      onError={handleImageError}
      onLoad={() => {
        console.log(`Successfully loaded logo for ${serviceName}:`, currentLogoUrl);
      }}
    />
  ) : (
    <Globe className="h-10 w-10 text-gray-600 dark:text-gray-400" />
  );
};

import {
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  MoreHorizontal,
  Globe,
  Calendar,
  Loader2,
  FileText,
  Link,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ServiceManagement: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load services from API
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading services from API...');
      
      const response = await apiClient.getServices();
      console.log('Services API response:', response);
      
      // Handle different response formats
      let servicesData: Service[] = [];
      if (Array.isArray(response)) {
        servicesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        servicesData = response.data;
      } else if (response && response.services && Array.isArray(response.services)) {
        servicesData = response.services;
      } else {
        console.warn('Unexpected services response format:', response);
        servicesData = [];
      }
      
      console.log('Processed services data:', servicesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Failed to load services. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && service.status) ||
                         (filterStatus === "inactive" && !service.status);
    return matchesSearch && matchesStatus;
  });

  const handleCreateService = () => {
    router.push("/service-creation");
  };

  const handleEditService = (service: Service) => {
    setEditFormData({...service});
    setShowEditModal(true);
  };

  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        await apiClient.deleteService(service.id.toString());
        
        setServices(prev => prev.filter(s => s.id !== service.id));
        toast({
          title: "Service Deleted",
          description: `${service.name} has been deleted successfully.`,
        });
      } catch (error) {
        console.error('Error deleting service:', error);
        toast({
          title: "Error",
          description: "Failed to delete service. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const updatedService = {
        ...service,
        status: !service.status,
        updated_at: new Date().toISOString()
      };
      
      await apiClient.updateService(service.id.toString(), updatedService);
      
      setServices(prev => prev.map(s => 
        s.id === service.id ? updatedService : s
      ));
      
      toast({
        title: "Status Updated",
        description: `${service.name} has been ${service.status ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: "Error", 
        description: "Failed to update service status.",
        variant: "destructive",
      });
    }
  };

  const handleEditFormChange = (field: keyof Service, value: string | boolean) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value
      });
    }
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      try {
        const updatedService = {
          ...editFormData,
          updated_at: new Date().toISOString()
        };
        
        await apiClient.updateService(editFormData.id.toString(), updatedService);
        
        setServices(prev => 
          prev.map(s => 
            s.id === editFormData.id ? updatedService : s
          )
        );
        
        toast({
          title: "Service Updated",
          description: `${editFormData.name} has been updated successfully.`,
        });
        
        setShowEditModal(false);
        setEditFormData(null);
      } catch (error) {
        console.error('Error updating service:', error);
        toast({
          title: "Error",
          description: "Failed to update service. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Service Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage and configure system services
                    </p>
                  </div>
                </div>
                <Button onClick={handleCreateService} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Services</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{services.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Services</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {services.filter(s => s.status).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive Services</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {services.filter(s => !s.status).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated Today</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {services.filter(s => 
                          new Date(s.updated_at).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={(value: "all" | "active" | "inactive") => setFilterStatus(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Services</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Loading Services
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we fetch your services...
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Settings className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Error Loading Services
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {error}
                  </p>
                  <Button onClick={loadServices}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ServiceLogo logoUrl={service.logo_url} serviceName={service.name} />
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <Badge variant={service.status ? "default" : "secondary"}>
                              {service.status ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewService(service)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditService(service)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleServiceStatus(service)}>
                              <Filter className="h-4 w-4 mr-2" />
                              {service.status ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteService(service)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {service.description}
                      </p>
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{formatDate(service.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated:</span>
                          <span>{formatDate(service.updated_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !error && filteredServices.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No services found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || filterStatus !== "all" 
                      ? "No services match your current filters."
                      : "Get started by creating your first service."
                    }
                  </p>
                  {(!searchTerm && filterStatus === "all") && (
                    <Button onClick={handleCreateService}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Service
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Service Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Service Details
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Service Name
                </Label>
                <p className="text-gray-900 dark:text-gray-100">{selectedService.name}</p>
              </div>
              
              <div>
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </Label>
                <p className="text-gray-900 dark:text-gray-100">{selectedService.description}</p>
              </div>
              
              <div>
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Status
                </Label>
                <div>
                  <Badge variant={selectedService.status ? "default" : "secondary"}>
                    {selectedService.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Logo
                </Label>
                <div className="flex items-center gap-3 mt-1">
                  {selectedService.logo_url ? (
                    <img
                      src={selectedService.logo_url}
                      alt={selectedService.name}
                      className="h-12 w-12 object-contain rounded-lg"
                      onError={(e) => {
                        console.error(`Failed to load logo for ${selectedService.name}:`, selectedService.logo_url);
                        // Fallback to Globe icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<svg class="h-12 w-12 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                        }
                      }}
                    />
                  ) : (
                    <Globe className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{selectedService.logo_url}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created
                  </Label>
                  <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedService.created_at)}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last Updated
                  </Label>
                  <p className="text-gray-900 dark:text-gray-100">{formatDate(selectedService.updated_at)}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button onClick={() => handleEditService(selectedService)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Service
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Service
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
                <div>
                  <Label className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    Service Name
                  </Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => handleEditFormChange('name', e.target.value)}
                    placeholder="Enter service name"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    Description
                  </Label>
                  <Textarea
                    value={editFormData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEditFormChange('description', e.target.value)}
                    placeholder="Enter service description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-1">
                    <Link className="h-4 w-4" />
                    Logo URL
                  </Label>
                  <div className="space-y-2">
                    <Input
                      value={editFormData.logo_url}
                      onChange={(e) => handleEditFormChange('logo_url', e.target.value)}
                      placeholder="Enter logo URL"
                      type="url"
                    />
                    {editFormData.logo_url && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Preview:</span>
                        <img
                          src={editFormData.logo_url}
                          alt="Logo preview"
                          className="h-8 w-8 object-contain rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4" />
                    Status
                  </Label>
                  <div className="flex gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => handleEditFormChange('status', true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        editFormData.status
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-green-500" />
                      Active
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleEditFormChange('status', false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                        !editFormData.status
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      Inactive
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Service Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Service ID:</span>
                      <p className="font-medium">{editFormData.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <p className="font-medium">
                        {new Date(editFormData.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="w-4 h-4 mr-2" />
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

export default ServiceManagement;
