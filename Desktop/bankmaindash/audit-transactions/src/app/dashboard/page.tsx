"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import TransactionCard from '@/components/TransactionCard';
import { mockTransactions, cardData } from '@/lib/mockData';
import { apiClient } from '@/lib/apiClient';
import { Loader2, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Service {
  id: number;
  name: string;
  description: string;
  logo_url?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load services from API
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Dashboard: Loading services from API...');
      
      const response = await apiClient.getServices();
      console.log('Dashboard: Services API response:', response);
      
      // Handle different response formats
      let servicesData: Service[] = [];
      if (Array.isArray(response)) {
        servicesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        servicesData = response.data;
      } else if (response && response.services && Array.isArray(response.services)) {
        servicesData = response.services;
      } else {
        console.warn('Dashboard: Unexpected services response format:', response);
        servicesData = [];
      }
      
      console.log('Dashboard: Processed services data:', servicesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Dashboard: Error loading services:', error);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map service to card format for TransactionCard component
  const mapServiceToCard = (service: Service) => {
    console.log('Dashboard: Mapping service:', service.name, 'Logo URL:', service.logo_url);
    
    return {
      id: service.id.toString(),
      title: service.name,
      icon: '', // Not used when logoUrl is present
      description: service.description,
      color: '', // Using gray background for logo area
      status: service.status,
      logoUrl: service.logo_url // Pass the logo URL from the API
    };
  };

  const handleCardClick = (cardId: string) => {
    // For now, still use the original mock data routing
    // You might want to update this to use real service IDs later
    const mockServiceMap: Record<string, string> = {
      '5': 'wallet-to-acc',
      '6': 'acc-to-wallet', 
      '7': 'airtime',
      '8': 'multichoice',
      '9': 'ecg',
      '10': 'water'
    };
    
    const mockServiceId = mockServiceMap[cardId] || 'wallet-to-acc';
    router.push(`/transactions/${mockServiceId}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Only use API services, no fallback to mock data
  const displayServices = services.filter(service => service.status).map(mapServiceToCard);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <TopBar onSidebarToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Services Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Banking Services</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {loading ? 'Loading services...' : 
                     error ? 'Unable to load services' :
                     services.length > 0 ? 'Click on any service to view transaction details' :
                     'No services available from the database'}
                  </p>
                </div>
                {error && (
                  <Button onClick={loadServices} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>

              {loading ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Loading Services
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Please wait while we fetch your banking services...
                    </p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Unable to Load Services
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {error}
                    </p>
                    <div className="space-y-3">
                      <Button onClick={loadServices}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayServices.map((card) => (
                  <TransactionCard
                    key={card.id}
                    id={card.id}
                    title={card.title}
                    icon={card.icon}
                    description={card.description}
                    color={card.color}
                    transactionCount={mockTransactions[card.id]?.length || 0}
                    onClick={() => handleCardClick(card.id)}
                    logoUrl={(card as any).logoUrl}
                  />
                ))}
              </div>

              {displayServices.length === 0 && !loading && !error && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Active Services
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No active banking services are currently available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
