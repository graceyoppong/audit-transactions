import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface TransactionCount {
  serviceId: string;
  count: number;
}

interface UseTransactionCountsResult {
  transactionCounts: Record<string, number>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTransactionCounts = (serviceIds: string[]): UseTransactionCountsResult => {
  const [transactionCounts, setTransactionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionCounts = async () => {
    if (!serviceIds.length) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching transaction counts for services:', serviceIds);
      
      // Fetch transaction counts for each service
      const countPromises = serviceIds.map(async (serviceId) => {
        try {
          // Calculate start of current month for filtering
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);
          
          // Get transactions with a higher limit to ensure we get all transactions for counting
          // Use offset=0 to get from the beginning, and a higher limit to capture all recent transactions
          const response = await apiClient.getTransactions(serviceId, 10000, 0);
          
          let transactionsList: any[] = [];
          
          // Handle different response structures (same logic as useTransactions)
          if (Array.isArray(response)) {
            transactionsList = response;
          } else if (response?.data && Array.isArray(response.data)) {
            transactionsList = response.data;
          } else if (response?.transactions && Array.isArray(response.transactions)) {
            transactionsList = response.transactions;
          } else if (response?.results && Array.isArray(response.results)) {
            transactionsList = response.results;
          }
          
          // Filter for current month using the same date mapping logic as useTransactions
          const filteredTransactions = transactionsList.filter((transaction: any) => {
            // Use the same date field priority as in the transaction mapping
            const transactionDate = new Date(transaction.postingdate || transaction.updatedat || new Date().toISOString());
            return transactionDate >= startOfMonth;
          });
          
          console.log(`Service ${serviceId}: ${filteredTransactions.length} transactions in current month`);
          
          return {
            serviceId,
            count: filteredTransactions.length
          };
        } catch (err) {
          console.error(`Error fetching transactions for service ${serviceId}:`, err);
          return {
            serviceId,
            count: 0
          };
        }
      });
      
      const results = await Promise.all(countPromises);
      
      const countsMap = results.reduce((acc, { serviceId, count }) => {
        acc[serviceId] = count;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('Final transaction counts:', countsMap);
      setTransactionCounts(countsMap);
      
    } catch (err) {
      console.error('Error fetching transaction counts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction counts');
      setTransactionCounts({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionCounts();
  }, [serviceIds.join(',')]); // Re-run when serviceIds change

  return {
    transactionCounts,
    loading,
    error,
    refetch: fetchTransactionCounts,
  };
};