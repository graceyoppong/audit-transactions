import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface Service {
  id: number;
  name: string;
  description: string;
  logo_url?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

interface UseServiceResult {
  service: Service | null;
  loading: boolean;
  error: string | null;
}

export const useService = (serviceId: string): UseServiceResult => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching service details for ID:', serviceId);
        const response = await apiClient.getService(serviceId);
        
        console.log('Service API response:', response);
        
        // Handle different response structures
        let serviceData: Service | null = null;
        if (response && typeof response === 'object') {
          if (response.data) {
            serviceData = response.data;
          } else if (response.id || response.name) {
            serviceData = response;
          }
        }
        
        if (serviceData) {
          console.log('Service data:', serviceData);
          setService(serviceData);
        } else {
          console.warn('No service data found in response');
          setService(null);
        }
        
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch service details');
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  return {
    service,
    loading,
    error,
  };
};
