import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Transaction } from '@/lib/mockData';
import { getTransactionStatus as getStatusFromChecker } from '@/components/StatusChecker';

interface UseTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalTransactions: number;
  refetch: () => void;
}

interface ApiTransaction {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  reference: string;
  description: string;
  type: "credit" | "debit";
  sender?: string;
  recipient?: string;
  accountNumber?: string;
  meterNumber?: string;
  phoneNumber?: string;
  smartCardNumber?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  errorMessage?: string;
  processingTime?: number;
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

  // Determine transaction status - first check if StatusChecker can handle this transaction type
  const checkerStatus = getStatusFromChecker({
    transtype: apiTransaction.transtype,
    param4: apiTransaction.param4,
    responsecode: apiTransaction.responsecode
  } as Transaction);
  
  let status: "completed" | "pending" | "failed" = "pending";
  
  if (checkerStatus !== 'unknown') {
    // Use StatusChecker logic for supported transaction types
    status = checkerStatus === 'success' ? 'completed' : checkerStatus;
  } else {
    // Fall back to original logic for unsupported transaction types
    if (apiTransaction.transferstatus === "Successfully Processed Transaction" || 
        apiTransaction.responsecode === "000" || 
        callbackData.responseCode === "01") {
      status = "completed";
    } else if (apiTransaction.responsecode === "999" || 
               apiTransaction.transferstatus?.toLowerCase().includes("failed") ||
               apiTransaction.exceptions) {
      status = "failed";
    }
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
    processingTime: undefined, // Not available in this API format
    
    // Include all the original API fields for the detailed modal
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
    callback: apiTransaction.callback, // Preserve the original callback field
    updatedAt: apiTransaction.updatedAt,
    updatedat: apiTransaction.updatedat,
    requestpayload: apiTransaction.requestpayload, // Preserve the original payload fields
    responsepayload: apiTransaction.responsepayload,
    exceptions: apiTransaction.exceptions,
  };
};

export const useTransactions = (serviceId: string): UseTransactionsResult => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchTransactions = async () => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching transactions for service:', serviceId);
      // Use a higher limit and offset=0 to get more complete transaction data
      const response = await apiClient.getTransactions(serviceId, 10000, 0);
      
      console.log('Raw API response:', response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
      
      let transactionsList: any[] = [];
      let total = 0;
      
      // Handle different response structures
      if (Array.isArray(response)) {
        transactionsList = response;
        total = response.length;
        console.log('Using array response, total transactions:', total);
      } else if (response?.data && Array.isArray(response.data)) {
        transactionsList = response.data;
        total = response.total || response.count || response.data.length;
        console.log('Using response.data, total transactions:', total);
      } else if (response?.transactions && Array.isArray(response.transactions)) {
        transactionsList = response.transactions;
        total = response.total || response.count || response.transactions.length;
        console.log('Using response.transactions, total transactions:', total);
      } else if (response?.results && Array.isArray(response.results)) {
        transactionsList = response.results;
        total = response.total || response.count || response.results.length;
        console.log('Using response.results, total transactions:', total);
      } else {
        console.warn('Unexpected API response structure:', response);
        transactionsList = [];
        total = 0;
      }
      
      console.log('Processed transactions list length:', transactionsList.length);
      
      const mappedTransactions = transactionsList.map(mapApiTransactionToTransaction);
      console.log('Final mapped transactions count:', mappedTransactions.length);
      
      setTransactions(mappedTransactions);
      setTotalTransactions(total);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
      setTotalTransactions(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [serviceId]);

  return {
    transactions,
    loading,
    error,
    totalTransactions,
    refetch: fetchTransactions,
  };
};
