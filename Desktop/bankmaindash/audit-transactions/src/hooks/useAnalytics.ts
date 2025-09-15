import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Transaction } from '@/lib/mockData';

interface ServiceAnalytics {
  id: string;
  name: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  transactionCount: number;
  totalAmount: number;
  successRate: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  // Current month data
  currentMonthTransactionCount?: number;
  currentMonthTotalAmount?: number;
  currentMonthSuccessRate?: number;
  currentMonthCompletedCount?: number;
  currentMonthPendingCount?: number;
  currentMonthFailedCount?: number;
}

interface MonthlyTrend {
  month: string;
  transactions: number;
  volume: number;
}

interface UseAnalyticsResult {
  // Data
  services: ServiceAnalytics[];
  transactions: Transaction[];
  monthlyTrends: MonthlyTrend[];
  
  // Aggregated stats
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  
  // Current month stats
  currentMonthTransactions: number;
  currentMonthAmount: number;
  currentMonthSuccessRate: number;
  currentMonthCompleted: number;
  currentMonthPending: number;
  currentMonthFailed: number;
  
  // Loading states
  loading: boolean;
  servicesLoading: boolean;
  transactionsLoading: boolean;
  
  // Error states
  error: string | null;
  servicesError: string | null;
  transactionsError: string | null;
  
  // Actions
  refetch: () => void;
}

const mapApiTransactionToTransaction = (apiTransaction: any): Transaction => {
  // Parse callback data if it exists
  let callbackData: any = {};
  try {
    if (apiTransaction.callback) {
      callbackData = JSON.parse(apiTransaction.callback);
    }
  } catch (e) {
    console.warn('Failed to parse callback data:', e);
  }

  // Parse request payload if it exists
  let requestData: any = {};
  try {
    if (apiTransaction.requestpayload) {
      requestData = JSON.parse(apiTransaction.requestpayload);
    }
  } catch (e) {
    console.warn('Failed to parse request payload:', e);
  }

  // Parse response payload if it exists
  let responseData: any = {};
  try {
    if (apiTransaction.responsepayload) {
      responseData = JSON.parse(apiTransaction.responsepayload);
    }
  } catch (e) {
    console.warn('Failed to parse response payload:', e);
  }

  // Determine transaction status based on various status fields
  let status: "completed" | "pending" | "failed" = "pending";
  if (apiTransaction.transferstatus === "Successfully Processed Transaction" || 
      apiTransaction.responsecode === "000" || 
      callbackData.responseCode === "01") {
    status = "completed";
  } else if (apiTransaction.responsecode === "999" || 
             apiTransaction.transferstatus?.toLowerCase().includes("failed") ||
             apiTransaction.exceptions) {
    status = "failed";
  }

  // Determine transaction type based on the data
  let type: "credit" | "debit" = "debit";
  if (apiTransaction.transtype === "MA" || apiTransaction.transtype === "CR") {
    type = "credit";
  }

  return {
    id: apiTransaction.transactionid || apiTransaction.reference || '',
    date: apiTransaction.postingdate || apiTransaction.updatedat || new Date().toISOString(),
    amount: parseFloat(apiTransaction.amount?.toString() || '0'),
    status: status,
    reference: apiTransaction.reference || apiTransaction.transactionid || '',
    description: apiTransaction.narration || `${apiTransaction.transtype} Transaction` || 'Transaction',
    type: type,
    sender: apiTransaction.senderaccount || apiTransaction.sendertelephone,
    recipient: apiTransaction.receiveraccount || apiTransaction.receivertelephone,
    accountNumber: apiTransaction.senderaccount || apiTransaction.receiveraccount,
    phoneNumber: apiTransaction.sendertelephone || apiTransaction.receivertelephone || requestData.msisdn,
    meterNumber: apiTransaction.customernumber,
    requestBody: {
      reference: apiTransaction.reference,
      amount: apiTransaction.amount,
      currency: apiTransaction.currency,
      narration: apiTransaction.narration,
      channel: apiTransaction.channel,
      transtype: apiTransaction.transtype,
      ...requestData
    },
    responseBody: {
      statuscode: apiTransaction.statuscode,
      responsecode: apiTransaction.responsecode,
      responsemessage: apiTransaction.responsemessage,
      transferstatus: apiTransaction.transferstatus,
      confirmationcode: apiTransaction.confirmationcode,
      confirmationmessage: apiTransaction.confirmationmessage,
      ...responseData,
      ...callbackData
    },
    errorMessage: apiTransaction.exceptions || (status === "failed" ? apiTransaction.responsemessage : undefined),
    processingTime: undefined,
    
    // Include all the original API fields
    transactionid: apiTransaction.transactionid,
    batchnumber: apiTransaction.batchnumber,
    senderaccount: apiTransaction.senderaccount,
    receiveraccount: apiTransaction.receiveraccount,
    sendertelephone: apiTransaction.sendertelephone,
    receivertelephone: apiTransaction.receivertelephone,
    currency: apiTransaction.currency,
    payoutcurrency: apiTransaction.payoutcurrency,
    statuscode: apiTransaction.statuscode,
    receivername: apiTransaction.receivername,
    customernumber: apiTransaction.customernumber,
    customername: apiTransaction.customername,
    postingdate: apiTransaction.postingdate,
    transtype: apiTransaction.transtype,
    confirmationcode: apiTransaction.confirmationcode,
    confirmationmessage: apiTransaction.confirmationmessage,
    transferstatus: apiTransaction.transferstatus,
    channel: apiTransaction.channel,
    username: apiTransaction.username,
    param1: apiTransaction.param1,
    param2: apiTransaction.param2,
    param3: apiTransaction.param3,
    param4: apiTransaction.param4,
    param5: apiTransaction.param5,
    param6: apiTransaction.param6,
    narration: apiTransaction.narration,
    data: apiTransaction.data,
    responsecode: apiTransaction.responsecode,
    responsemessage: apiTransaction.responsemessage,
    callback: apiTransaction.callback,
    updatedAt: apiTransaction.updatedAt,
    updatedat: apiTransaction.updatedat,
    requestpayload: apiTransaction.requestpayload,
    responsepayload: apiTransaction.responsepayload,
    exceptions: apiTransaction.exceptions,
  };
};

// Service type mapping for display purposes - updated to be more flexible
const getServiceDisplayInfo = (serviceName: string, serviceDescription?: string) => {
  const name = serviceName.toLowerCase();
  const desc = serviceDescription?.toLowerCase() || '';
  
  // Try to match common service patterns
  if (name.includes('wallet') || name.includes('momo') || name.includes('mobile money')) {
    if (name.includes('to') && name.includes('account')) {
      return {
        title: 'Wallet to Account',
        icon: '�',
        color: 'from-green-500 to-green-600',
        description: 'Funds transferred from mobile wallet to account'
      };
    } else {
      return {
        title: 'Account to Wallet',
        icon: '�',
        color: 'from-blue-500 to-blue-600',
        description: 'Funds transferred from account to mobile wallet'
      };
    }
  }
  
  if (name.includes('airtime') || name.includes('credit') || name.includes('topup')) {
    return {
      title: 'Airtime Purchase',
      icon: '📞',
      color: 'from-purple-500 to-purple-600',
      description: 'Airtime and data bundle purchases'
    };
  }
  
  if (name.includes('tv') || name.includes('dstv') || name.includes('gotv') || name.includes('multichoice')) {
    return {
      title: 'TV Subscription',
      icon: '📺',
      color: 'from-orange-500 to-orange-600',
      description: 'Television subscription payments'
    };
  }
  
  if (name.includes('electric') || name.includes('ecg') || name.includes('power') || name.includes('prepaid')) {
    return {
      title: 'Electricity',
      icon: '⚡',
      color: 'from-yellow-500 to-yellow-600',
      description: 'Electricity bill payments'
    };
  }
  
  if (name.includes('water') || name.includes('gwc')) {
    return {
      title: 'Water Service',
      icon: '💧',
      color: 'from-cyan-500 to-cyan-600',
      description: 'Water bill payments'
    };
  }
  
  if (name.includes('bill') || name.includes('utility')) {
    return {
      title: 'Bill Payment',
      icon: '🧾',
      color: 'from-indigo-500 to-indigo-600',
      description: 'Utility bill payments'
    };
  }
  
  if (name.includes('transfer') || name.includes('send') || name.includes('payment')) {
    return {
      title: 'Money Transfer',
      icon: '💸',
      color: 'from-pink-500 to-pink-600',
      description: 'Money transfer services'
    };
  }

  // Default fallback
  return {
    title: serviceName || 'Banking Service',
    icon: '🏦',
    color: 'from-gray-500 to-gray-600',
    description: serviceDescription || 'Financial service'
  };
};

// Service names will use actual database service names instead of pattern matching

export const useAnalytics = (): UseAnalyticsResult => {
  const [services, setServices] = useState<ServiceAnalytics[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);
      
      console.log('Fetching services for analytics...');
      const response = await apiClient.getServices();
      
      let servicesList: any[] = [];
      
      // Handle different response structures
      if (Array.isArray(response)) {
        servicesList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        servicesList = response.data;
      } else if (response?.services && Array.isArray(response.services)) {
        servicesList = response.services;
      } else if (response?.results && Array.isArray(response.results)) {
        servicesList = response.results;
      } else {
        console.warn('Unexpected services API response structure:', response);
        servicesList = [];
      }
      
      console.log('Fetched services:', servicesList);
      
      // Remove duplicates based on service id and name
      const uniqueServices = servicesList.filter((service, index, self) => 
        index === self.findIndex((s) => 
          (s.id && service.id && s.id === service.id) || 
          (s.name && service.name && s.name.toLowerCase() === service.name.toLowerCase())
        )
      );
      
      console.log('Unique services after deduplication:', uniqueServices);
      
      // Initialize services with empty analytics data
      const servicesWithAnalytics: ServiceAnalytics[] = uniqueServices.map(service => {
        // Use actual service data instead of pattern matching for display
        return {
          id: service.id?.toString() || service.name,
          name: service.name || `Service ${service.id}`,
          title: service.name || `Service ${service.id}`, // Use actual service name as title
          icon: '🏦', // Default icon - you can customize this later
          color: 'from-blue-500 to-blue-600', // Default color - you can customize this later
          description: service.description || 'Banking service',
          transactionCount: 0,
          totalAmount: 0,
          successRate: 0,
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0,
        };
      });
      
      setServices(servicesWithAnalytics);
      
      // Fetch transactions for each service
      await fetchAllTransactions(servicesWithAnalytics);
      
    } catch (err) {
      console.error('Error fetching services:', err);
      setServicesError(err instanceof Error ? err.message : 'Failed to fetch services');
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchAllTransactions = async (servicesList: ServiceAnalytics[]) => {
    if (servicesList.length === 0) return;
    
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      
      console.log('Fetching transactions for all services...');
      
      const allTransactionPromises = servicesList.map(async (service) => {
        try {
          // Fetch all transactions by using a very high limit and checking if we need pagination
          let allTransactionsForService: any[] = [];
          let offset = 0;
          const limit = 50000; // Very high limit to get most transactions in one call
          
          while (true) {
            const response = await apiClient.getTransactions(service.id, limit, offset);
            
            let transactionsList: any[] = [];
            
            // Handle different response structures
            if (Array.isArray(response)) {
              transactionsList = response;
            } else if (response?.data && Array.isArray(response.data)) {
              transactionsList = response.data;
            } else if (response?.transactions && Array.isArray(response.transactions)) {
              transactionsList = response.transactions;
            } else if (response?.results && Array.isArray(response.results)) {
              transactionsList = response.results;
            }
            
            if (transactionsList.length === 0) {
              // No more transactions to fetch
              break;
            }
            
            allTransactionsForService.push(...transactionsList);
            
            // If we got fewer transactions than the limit, we've reached the end
            if (transactionsList.length < limit) {
              break;
            }
            
            offset += limit;
          }
          
          console.log(`Fetched ${allTransactionsForService.length} total transactions for service ${service.id}`);
          
          return {
            serviceId: service.id,
            transactions: allTransactionsForService.map(transaction => ({
              ...mapApiTransactionToTransaction(transaction),
              serviceId: service.id, // Add serviceId to each transaction
              serviceName: service.name,
              serviceTitle: service.title
            }))
          };
        } catch (error) {
          console.error(`Error fetching transactions for service ${service.id}:`, error);
          return {
            serviceId: service.id,
            transactions: []
          };
        }
      });
      
      const transactionResults = await Promise.all(allTransactionPromises);
      
      // Combine all transactions
      const combinedTransactions: Transaction[] = [];
      const serviceTransactionMap: Record<string, Transaction[]> = {};
      
      transactionResults.forEach(result => {
        serviceTransactionMap[result.serviceId] = result.transactions;
        combinedTransactions.push(...result.transactions);
      });
      
      setAllTransactions(combinedTransactions);
      
      // Update services with calculated analytics (all-time data)
      const updatedServices = servicesList.map(service => {
        const serviceTransactions = serviceTransactionMap[service.id] || [];
        
        const completedCount = serviceTransactions.filter(t => t.status === "completed").length;
        const pendingCount = serviceTransactions.filter(t => t.status === "pending").length;
        const failedCount = serviceTransactions.filter(t => t.status === "failed").length;
        const totalAmount = serviceTransactions.reduce((sum, t) => sum + t.amount, 0);
        const successRate = serviceTransactions.length > 0 
          ? ((completedCount / serviceTransactions.length) * 100) 
          : 0;
        
        // Calculate current month data for this service
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const currentMonthServiceTransactions = serviceTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate.getFullYear() === currentYear && 
                 transactionDate.getMonth() === currentMonth;
        });
        
        const currentMonthCompletedCount = currentMonthServiceTransactions.filter(t => t.status === "completed").length;
        const currentMonthPendingCount = currentMonthServiceTransactions.filter(t => t.status === "pending").length;
        const currentMonthFailedCount = currentMonthServiceTransactions.filter(t => t.status === "failed").length;
        const currentMonthTotalAmount = currentMonthServiceTransactions.reduce((sum, t) => sum + t.amount, 0);
        const currentMonthSuccessRate = currentMonthServiceTransactions.length > 0 
          ? ((currentMonthCompletedCount / currentMonthServiceTransactions.length) * 100) 
          : 0;
        
        // Debug logging for service analytics
        if (serviceTransactions.length > 0 || currentMonthServiceTransactions.length > 0) {
          console.log(`Service ${service.name} (${service.id}) analytics:`, {
            allTime: { 
              transactions: serviceTransactions.length, 
              amount: totalAmount.toFixed(2) 
            },
            currentMonth: { 
              transactions: currentMonthServiceTransactions.length, 
              amount: currentMonthTotalAmount.toFixed(2) 
            }
          });
        }
        
        return {
          ...service,
          // All-time data
          transactionCount: serviceTransactions.length,
          totalAmount,
          successRate: parseFloat(successRate.toFixed(1)),
          completedCount,
          pendingCount,
          failedCount,
          // Current month data
          currentMonthTransactionCount: currentMonthServiceTransactions.length,
          currentMonthTotalAmount,
          currentMonthSuccessRate: parseFloat(currentMonthSuccessRate.toFixed(1)),
          currentMonthCompletedCount,
          currentMonthPendingCount,
          currentMonthFailedCount,
        };
      });
      
      setServices(updatedServices);
      
      console.log('Analytics data updated with real transactions');
      
    } catch (err) {
      console.error('Error fetching all transactions:', err);
      setTransactionsError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const refetch = () => {
    fetchServices();
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Calculate aggregated statistics
  const {
    totalTransactions,
    totalAmount,
    successRate,
    completedTransactions,
    pendingTransactions,
    failedTransactions,
    currentMonthTransactions,
    currentMonthAmount,
    currentMonthSuccessRate,
    currentMonthCompleted,
    currentMonthPending,
    currentMonthFailed,
  } = useMemo(() => {
    const total = allTransactions.length;
    const amount = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const completed = allTransactions.filter(t => t.status === "completed").length;
    const pending = allTransactions.filter(t => t.status === "pending").length;
    const failed = allTransactions.filter(t => t.status === "failed").length;
    const rate = total > 0 ? ((completed / total) * 100) : 0;

    // Calculate current month statistics
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const currentMonthTransactionsList = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === currentYear && 
             transactionDate.getMonth() === currentMonth;
    });
    
    const currentMonthTotal = currentMonthTransactionsList.length;
    const currentMonthTotalAmount = currentMonthTransactionsList.reduce((sum, t) => sum + t.amount, 0);
    const currentMonthCompletedCount = currentMonthTransactionsList.filter(t => t.status === "completed").length;
    const currentMonthPendingCount = currentMonthTransactionsList.filter(t => t.status === "pending").length;
    const currentMonthFailedCount = currentMonthTransactionsList.filter(t => t.status === "failed").length;
    const currentMonthRate = currentMonthTotal > 0 ? ((currentMonthCompletedCount / currentMonthTotal) * 100) : 0;

    return {
      totalTransactions: total,
      totalAmount: amount,
      successRate: parseFloat(rate.toFixed(1)),
      completedTransactions: completed,
      pendingTransactions: pending,
      failedTransactions: failed,
      currentMonthTransactions: currentMonthTotal,
      currentMonthAmount: currentMonthTotalAmount,
      currentMonthSuccessRate: parseFloat(currentMonthRate.toFixed(1)),
      currentMonthCompleted: currentMonthCompletedCount,
      currentMonthPending: currentMonthPendingCount,
      currentMonthFailed: currentMonthFailedCount,
    };
  }, [allTransactions]);

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const monthMap = new Map<string, { transactions: number; volume: number }>();
    
    allTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { transactions: 0, volume: 0 });
      }
      
      const current = monthMap.get(monthKey)!;
      current.transactions += 1;
      current.volume += transaction.amount;
    });
    
    // Convert to array and sort by month
    const trends = Array.from(monthMap.entries())
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          transactions: data.transactions,
          volume: data.volume,
          sortKey: key,
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6); // Last 6 months
    
    return trends.map(({ month, transactions, volume }) => ({
      month,
      transactions,
      volume,
    }));
  }, [allTransactions]);

  return {
    // Data
    services,
    transactions: allTransactions,
    monthlyTrends,
    
    // Aggregated stats
    totalTransactions,
    totalAmount,
    successRate,
    completedTransactions,
    pendingTransactions,
    failedTransactions,
    
    // Current month stats
    currentMonthTransactions,
    currentMonthAmount,
    currentMonthSuccessRate,
    currentMonthCompleted,
    currentMonthPending,
    currentMonthFailed,
    
    // Loading states
    loading: servicesLoading || transactionsLoading,
    servicesLoading,
    transactionsLoading,
    
    // Error states
    error: servicesError || transactionsError,
    servicesError,
    transactionsError,
    
    // Actions
    refetch,
  };
};
