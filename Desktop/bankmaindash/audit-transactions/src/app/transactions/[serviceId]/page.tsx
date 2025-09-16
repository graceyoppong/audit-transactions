"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionTable from "@/components/TransactionTable";
import FilterModal, { FilterCriteria } from "@/components/FilterModal";
import ExportDropdown from "@/components/ExportDropdown";
import { Transaction } from "@/lib/mockData";
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/exportUtils";
import { useTransactions } from "@/hooks/useTransactions";
import { useService } from "@/hooks/useService";
import { formatAmount, formatNumber } from "@/lib/utils";
import { getTransactionStatus } from "@/components/StatusChecker";
import {
  ArrowLeft,
  Filter,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Globe,
} from "lucide-react";

const TransactionDetails: React.FC = () => {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterCriteria | null>(null);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Fetch transactions from API
  const { transactions: apiTransactions, loading: transactionsLoading, error: transactionsError, refetch } = useTransactions(serviceId);
  
  // Fetch service details from API
  const { service, loading: serviceLoading, error: serviceError } = useService(serviceId);

  // Reset logo error when service changes
  useEffect(() => {
    setLogoError(false);
  }, [service?.logo_url]);

  // Create card info from API service data
  const cardInfo = useMemo(() => {
    if (!service) return null;
    
    return {
      id: service.id.toString(),
      title: service.name,
      description: service.description,
      logoUrl: service.logo_url,
    };
  }, [service]);

  const loading = transactionsLoading || serviceLoading;
  const error = transactionsError || serviceError;

  // Filter transactions from start of current month (default) or by applied date filters
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const baseTransactions = useMemo(() => {
    // If date filters are applied, use them instead of default current month filter
    if (appliedFilters && (appliedFilters.dateFrom || appliedFilters.dateTo)) {
      return apiTransactions.filter((transaction: Transaction) => {
        const transactionDate = new Date(transaction.date);
        let includeTransaction = true;

        if (appliedFilters.dateFrom) {
          includeTransaction = includeTransaction && transactionDate >= appliedFilters.dateFrom;
        }

        if (appliedFilters.dateTo) {
          // Set time to end of day for dateTo
          const endOfDay = new Date(appliedFilters.dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          includeTransaction = includeTransaction && transactionDate <= endOfDay;
        }

        return includeTransaction;
      });
    } else {
      // Default: filter by current month
      return apiTransactions.filter((transaction: Transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startOfMonth;
      });
    }
  }, [apiTransactions, appliedFilters]);

  // Apply filters to transactions
  const transactions = useMemo(() => {
    let filtered = [...baseTransactions];

    // Apply stat card filter first
    if (activeStatFilter) {
      switch (activeStatFilter) {
        case 'completed':
          filtered = filtered.filter((t: Transaction) => t.status === "completed");
          break;
        case 'pending':
          filtered = filtered.filter((t: Transaction) => t.status === "pending");
          break;
        case 'outstanding':
          filtered = filtered.filter((t: Transaction) => getTransactionStatus(t) === "outstanding");
          break;
        case 'failed':
          filtered = filtered.filter((t: Transaction) => t.status === "failed");
          break;
        // 'total' shows all transactions, so no additional filtering needed
      }
    }

    // Apply additional filters if any (excluding date filters since they're already applied in baseTransactions)
    if (appliedFilters) {
      // Global Search - searches across multiple fields
      if (appliedFilters.globalSearch) {
        const searchTerm = appliedFilters.globalSearch.toLowerCase();
        filtered = filtered.filter((t: Transaction) =>
          t.description?.toLowerCase().includes(searchTerm) ||
          t.reference?.toLowerCase().includes(searchTerm) ||
          t.transactionid?.toLowerCase().includes(searchTerm) ||
          t.batchnumber?.toLowerCase().includes(searchTerm) ||
          t.senderaccount?.toLowerCase().includes(searchTerm) ||
          t.receiveraccount?.toLowerCase().includes(searchTerm) ||
          t.sendertelephone?.toLowerCase().includes(searchTerm) ||
          t.receivertelephone?.toLowerCase().includes(searchTerm) ||
          t.customername?.toLowerCase().includes(searchTerm) ||
          t.customernumber?.toLowerCase().includes(searchTerm) ||
          t.username?.toLowerCase().includes(searchTerm) ||
          t.confirmationcode?.toLowerCase().includes(searchTerm)
        );
      }

      // Transaction ID
      if (appliedFilters.transactionId) {
        filtered = filtered.filter((t: Transaction) =>
          t.transactionid?.toLowerCase().includes(appliedFilters.transactionId!.toLowerCase()) ||
          t.reference?.toLowerCase().includes(appliedFilters.transactionId!.toLowerCase())
        );
      }

      // Batch Number
      if (appliedFilters.batchNumber) {
        filtered = filtered.filter((t: Transaction) =>
          t.batchnumber?.toLowerCase().includes(appliedFilters.batchNumber!.toLowerCase())
        );
      }

      // Sender (account or phone)
      if (appliedFilters.sender) {
        filtered = filtered.filter((t: Transaction) =>
          t.senderaccount?.toLowerCase().includes(appliedFilters.sender!.toLowerCase()) ||
          t.sendertelephone?.toLowerCase().includes(appliedFilters.sender!.toLowerCase())
        );
      }

      // Receiver (account or phone)
      if (appliedFilters.receiver) {
        filtered = filtered.filter((t: Transaction) =>
          t.receiveraccount?.toLowerCase().includes(appliedFilters.receiver!.toLowerCase()) ||
          t.receivertelephone?.toLowerCase().includes(appliedFilters.receiver!.toLowerCase())
        );
      }

      if (appliedFilters.status && appliedFilters.status !== "all") {
        filtered = filtered.filter((t: Transaction) => t.status === appliedFilters.status);
      }

      if (appliedFilters.type && appliedFilters.type !== "all") {
        filtered = filtered.filter((t: Transaction) => t.type === appliedFilters.type);
      }

      if (appliedFilters.phoneNumber) {
        filtered = filtered.filter((t: Transaction) =>
          t.phoneNumber?.toLowerCase().includes(appliedFilters.phoneNumber!.toLowerCase())
        );
      }

      if (appliedFilters.meterNumber) {
        filtered = filtered.filter((t: Transaction) =>
          t.meterNumber?.toLowerCase().includes(appliedFilters.meterNumber!.toLowerCase())
        );
      }

      if (appliedFilters.smartCardNumber) {
        filtered = filtered.filter((t: Transaction) =>
          t.smartCardNumber
            ?.toLowerCase()
            .includes(appliedFilters.smartCardNumber!.toLowerCase())
        );
      }

      // Note: dateFrom and dateTo are already handled in baseTransactions

      if (appliedFilters.amountFrom) {
        filtered = filtered.filter(
          (t: Transaction) => t.amount >= parseFloat(appliedFilters.amountFrom!)
        );
      }

      if (appliedFilters.amountTo) {
        filtered = filtered.filter(
          (t: Transaction) => t.amount <= parseFloat(appliedFilters.amountTo!)
        );
      }
    }

    return filtered;
  }, [baseTransactions, appliedFilters, activeStatFilter]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleApplyFilters = (filters: FilterCriteria) => {
    setAppliedFilters(filters);
    // Clear stat filter when applying other filters
    if (filters.status !== "all") {
      setActiveStatFilter(null);
    }
  };

  const handleStatCardClick = (statType: string) => {
    // Toggle filter: if same stat is clicked, clear it; otherwise set new stat
    if (activeStatFilter === statType) {
      setActiveStatFilter(null);
    } else {
      setActiveStatFilter(statType);
      // Clear any existing status filter from modal when using stat cards
      if (appliedFilters?.status !== "all") {
        setAppliedFilters(prev => prev ? { ...prev, status: "all" } : null);
      }
    }
  };

  const handleRefresh = () => {
    refetch();
    // Service data will refresh automatically when component re-renders
  };

  // Map numeric service ID to filter service type
  const getFilterServiceType = (id: string): string => {
    const serviceTypeMap: Record<string, string> = {
      '5': 'wallet-to-acc',
      '6': 'acc-to-wallet',
      '7': 'airtime',
      '8': 'multichoice',
      '9': 'ecg',
      '10': 'water',
    };
    return serviceTypeMap[id] || id;
  };

  const filterServiceType = getFilterServiceType(serviceId);

  const handleExportPDF = () => {
    const filename = `${cardInfo?.title
      .replace(/\s+/g, "_")
      .toLowerCase()}_transactions_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    exportToPDF(transactions, {
      filename,
      title: `${cardInfo?.title} - Transaction Report`,
      serviceType: filterServiceType,
    });
  };

  const handleExportExcel = () => {
    const filename = `${cardInfo?.title
      .replace(/\s+/g, "_")
      .toLowerCase()}_transactions_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    exportToExcel(transactions, {
      filename,
      title: `${cardInfo?.title} - Transaction Report`,
      serviceType: filterServiceType,
    });
  };

  const handleExportCSV = () => {
    const filename = `${cardInfo?.title
      .replace(/\s+/g, "_")
      .toLowerCase()}_transactions_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    exportToCSV(transactions, {
      filename,
      serviceType: filterServiceType,
    });
  };

  if (serviceLoading && !service) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Loading Service Details...
          </h1>
        </div>
      </div>
    );
  }

  if (serviceError || (!serviceLoading && !service)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service Not Found
          </h1>
          {serviceError && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {serviceError}
            </p>
          )}
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!cardInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service Information Unavailable
          </h1>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics from base transactions (not filtered by status/other criteria)
  const allTransactionsAmount = baseTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const filteredTransactionsAmount = transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const completedCount = baseTransactions.filter(
    (t: Transaction) => t.status === "completed"
  ).length;
  const pendingCount = baseTransactions.filter(
    (t: Transaction) => t.status === "pending"
  ).length;
  const failedCount = baseTransactions.filter((t: Transaction) => t.status === "failed").length;
  
  // Calculate outstanding count using the status checker function
  const outstandingCount = baseTransactions.filter(
    (t: Transaction) => getTransactionStatus(t) === "outstanding"
  ).length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        <TopBar onSidebarToggle={toggleSidebar} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-4">
                  {cardInfo.logoUrl && !logoError ? (
                    <img
                      src={cardInfo.logoUrl}
                      alt={cardInfo.title}
                      className="w-12 h-12 object-contain rounded-lg"
                      onError={() => {
                        console.error(`Failed to load logo for ${cardInfo.title}:`, cardInfo.logoUrl);
                        setLogoError(true);
                      }}
                      onLoad={() => {
                        console.log(`Successfully loaded logo for ${cardInfo.title}:`, cardInfo.logoUrl);
                      }}
                    />
                  ) : (
                    <Globe className="w-12 h-12 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {cardInfo.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {cardInfo.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {loading ? "Loading..." : `Service ID: ${serviceId} • ${
                        appliedFilters && (appliedFilters.dateFrom || appliedFilters.dateTo) 
                          ? 'Custom date range' 
                          : 'Current month'
                      }`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterModal(true)}
                  disabled={loading}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <ExportDropdown
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  onExportCSV={handleExportCSV}
                />
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6">
                <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-red-800 dark:text-red-200 font-medium">
                          Failed to load transactions
                        </p>
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          {error}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="ml-auto"
                      >
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeStatFilter === 'total' ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => handleStatCardClick('total')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Transactions
                    </CardTitle>
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(baseTransactions.length)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {appliedFilters && (appliedFilters.dateFrom || appliedFilters.dateTo) 
                      ? 'Custom range' 
                      : 'Current month'}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeStatFilter === 'completed' ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' : ''
                }`}
                onClick={() => handleStatCardClick('completed')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Completed
                    </CardTitle>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(completedCount)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Successful transactions
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeStatFilter === 'pending' ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''
                }`}
                onClick={() => handleStatCardClick('pending')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pending
                    </CardTitle>
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(pendingCount)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    In progress
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeStatFilter === 'outstanding' ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950' : ''
                }`}
                onClick={() => handleStatCardClick('outstanding')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Outstanding
                    </CardTitle>
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(outstandingCount)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Outstanding issues
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeStatFilter === 'failed' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950' : ''
                }`}
                onClick={() => handleStatCardClick('failed')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Failed
                    </CardTitle>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatNumber(failedCount)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Unsuccessful transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Amount
                    </CardTitle>
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {loading ? "..." : formatAmount(activeStatFilter ? filteredTransactionsAmount : allTransactionsAmount, "GH₵")}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activeStatFilter ? `Total for ${activeStatFilter} transactions` : 'Total volume'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    Transaction History
                    {loading && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        Loading...
                      </span>
                    )}
                    {activeStatFilter && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        • Filtered by: {activeStatFilter === 'total' ? 'All' : activeStatFilter.charAt(0).toUpperCase() + activeStatFilter.slice(1)}
                      </span>
                    )}
                  </CardTitle>
                  {activeStatFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveStatFilter(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Loading transactions...</p>
                    </div>
                  </div>
                ) : (
                  <TransactionTable
                    transactions={transactions}
                    serviceType={filterServiceType}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        serviceType={filterServiceType}
      />
    </div>
  );
};

export default TransactionDetails;
