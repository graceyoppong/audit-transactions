"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatAmount, formatNumber, formatPercentage } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const Analytics: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showCurrentMonth, setShowCurrentMonth] = useState(true);
  const [showNormalizedView, setShowNormalizedView] = useState(false);
  const [hiddenDataKeys, setHiddenDataKeys] = useState<string[]>([]);
  const router = useRouter();

  // Fetch real analytics data from the API
  const {
    services: servicesAnalytics,
    transactions: allTransactions,
    monthlyTrends,
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
    loading,
    error,
    refetch,
  } = useAnalytics();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleBackToOverview = () => {
    setSelectedService(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  const toggleTimePeriod = () => {
    setShowCurrentMonth(!showCurrentMonth);
  };

  const handleLegendClick = (dataKey: string) => {
    setHiddenDataKeys(prev => 
      prev.includes(dataKey) 
        ? prev.filter(key => key !== dataKey)
        : [...prev, dataKey]
    );
  };

  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center space-x-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenDataKeys.includes(entry.dataKey);
          return (
            <div
              key={`item-${index}`}
              className={`flex items-center cursor-pointer transition-opacity ${
                isHidden ? 'opacity-50' : 'opacity-100'
              }`}
              onClick={() => handleLegendClick(entry.dataKey)}
            >
              <div
                className="w-3 h-3 mr-2"
                style={{ 
                  backgroundColor: isHidden ? '#ccc' : entry.color,
                  borderRadius: entry.type === 'line' ? '50%' : '2px'
                }}
              />
              <span className={`text-sm ${isHidden ? 'line-through text-gray-400' : ''}`}>
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Filter transactions for current month if needed
  const getCurrentMonthTransactions = (transactions: any[]) => {
    if (!showCurrentMonth) return transactions;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === currentYear && 
             transactionDate.getMonth() === currentMonth;
    });
  };

  // Get data based on selected service or all services
  const baseTransactions = selectedService
    ? allTransactions.filter(t => t.serviceId === selectedService)
    : allTransactions;

  // Apply time period filter
  const currentTransactions = getCurrentMonthTransactions(baseTransactions);

  const currentServiceInfo = selectedService
    ? servicesAnalytics.find((service) => service.id === selectedService)
    : null;

  // Use appropriate statistics based on time period toggle
  const displayStats = {
    totalTransactions: showCurrentMonth ? 
      (selectedService ? currentTransactions.length : currentMonthTransactions) :
      (selectedService ? currentTransactions.length : totalTransactions),
    
    totalAmount: showCurrentMonth ?
      (selectedService ? currentTransactions.reduce((sum, t) => sum + t.amount, 0) : currentMonthAmount) :
      (selectedService ? currentTransactions.reduce((sum, t) => sum + t.amount, 0) : totalAmount),
    
    completedTransactions: showCurrentMonth ?
      (selectedService ? currentTransactions.filter(t => t.status === "completed").length : currentMonthCompleted) :
      (selectedService ? currentTransactions.filter(t => t.status === "completed").length : completedTransactions),
    
    pendingTransactions: showCurrentMonth ?
      (selectedService ? currentTransactions.filter(t => t.status === "pending").length : currentMonthPending) :
      (selectedService ? currentTransactions.filter(t => t.status === "pending").length : pendingTransactions),
    
    failedTransactions: showCurrentMonth ?
      (selectedService ? currentTransactions.filter(t => t.status === "failed").length : currentMonthFailed) :
      (selectedService ? currentTransactions.filter(t => t.status === "failed").length : failedTransactions),
    
    successRate: "0",
  };

  displayStats.successRate = displayStats.totalTransactions > 0
    ? formatPercentage((displayStats.completedTransactions / displayStats.totalTransactions) * 100).replace('%', '')
    : "0";

  // Service-specific analytics
  const serviceSpecificData = useMemo(() => {
    if (!selectedService || !currentTransactions.length) return null;

    const transactions = currentTransactions;
    
    // Daily transaction volume for trend analysis
    const dailyData = transactions.reduce((acc: any, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, volume: 0, count: 0, completed: 0, failed: 0, pending: 0 };
      }
      acc[date].volume += Math.abs(transaction.amount);
      acc[date].count += 1;
      acc[date][transaction.status] += 1;
      return acc;
    }, {});

    const dailyTrend = Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Hourly distribution
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      transactions: 0,
      volume: 0,
    }));

    transactions.forEach(transaction => {
      const hour = new Date(transaction.date).getHours();
      hourlyData[hour].transactions += 1;
      hourlyData[hour].volume += Math.abs(transaction.amount);
    });

    // Amount distribution
    const amountRanges = [
      { range: '0-100', min: 0, max: 100, count: 0 },
      { range: '100-500', min: 100, max: 500, count: 0 },
      { range: '500-1K', min: 500, max: 1000, count: 0 },
      { range: '1K-5K', min: 1000, max: 5000, count: 0 },
      { range: '5K+', min: 5000, max: Infinity, count: 0 },
    ];

    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      const range = amountRanges.find(r => amount >= r.min && amount < r.max);
      if (range) range.count += 1;
    });

    // Performance metrics
    const avgTransactionTime = transactions.length > 0 ? 
      transactions.reduce((sum, t) => sum + (t.processingTime || 0), 0) / transactions.length : 0;
    
    const peakHour = hourlyData.reduce((max, current) => 
      current.transactions > max.transactions ? current : max
    );

    return {
      dailyTrend,
      hourlyData: hourlyData.filter(h => h.transactions > 0),
      amountDistribution: amountRanges.filter(r => r.count > 0),
      avgTransactionTime,
      peakHour,
      totalUniqueUsers: new Set(transactions.map(t => t.userId || t.user_id)).size,
      avgTransactionAmount: transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length : 0,
    };
  }, [selectedService, currentTransactions]);

  // Chart data preparation - use appropriate data based on time period
  const serviceVolumeData = useMemo(() => {
    // Filter services based on selection
    const servicesToShow = selectedService 
      ? servicesAnalytics.filter(service => service.id === selectedService)
      : servicesAnalytics;
    
    const data = servicesToShow
      .map((service) => {
        const volume = showCurrentMonth ? 
          (service.currentMonthTotalAmount || 0) : 
          service.totalAmount;
        const transactions = showCurrentMonth ? 
          (service.currentMonthTransactionCount || 0) : 
          service.transactionCount;
        const successRate = showCurrentMonth ? 
          (service.currentMonthSuccessRate || 0) : 
          service.successRate;
        
        return {
          name: service.title.length > 15 ? service.title.substring(0, 15) + "..." : service.title,
          volume,
          transactions,
          successRate,
          serviceName: service.name,
          serviceId: service.id,
          hasData: transactions > 0 || volume > 0,
        };
      })
      // Remove duplicates based on service name/title
      .filter((service, index, self) => 
        index === self.findIndex((s) => s.name === service.name)
      )
      // Filter out services with no data (0 volume and 0 transactions)
      .filter((service) => service.volume > 0 || service.transactions > 0)
      // Sort by volume descending to show services with more activity first
      .sort((a, b) => b.volume - a.volume);

    if (showNormalizedView) {
      // Normalize to percentage of total for better comparison
      const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);
      const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0);
      
      return data.map(item => ({
        ...item,
        volume: totalVolume > 0 ? Math.round((item.volume / totalVolume) * 100) : 0,
        transactions: totalTransactions > 0 ? Math.round((item.transactions / totalTransactions) * 100) : 0,
      }))
      // Filter out services with 0% after normalization
      .filter((service) => service.volume > 0 || service.transactions > 0);
    }
    
    return data;
  }, [servicesAnalytics, showCurrentMonth, showNormalizedView, selectedService]);

  const statusDistributionData = [
    {
      name: "Completed",
      value: displayStats.completedTransactions,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: displayStats.pendingTransactions,
      color: "#f59e0b",
    },
    {
      name: "Failed",
      value: displayStats.failedTransactions,
      color: "#ef4444",
    },
  ];

  // Calculate service-specific monthly trends or use general data
  const monthlyData = useMemo(() => {
    if (selectedService && currentTransactions.length > 0) {
      // Calculate monthly trends for selected service
      const monthMap = new Map<string, { transactions: number; volume: number }>();
      
      currentTransactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, { transactions: 0, volume: 0 });
        }
        
        const current = monthMap.get(monthKey)!;
        current.transactions += 1;
        current.volume += Math.abs(transaction.amount);
      });
      
      // Convert to array and sort by month, get last 6 months
      const trends = Array.from(monthMap.entries())
        .map(([key, data]) => {
          const [year, month] = key.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            transactions: data.transactions,
            volume: data.volume,
            sortKey: key
          };
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .slice(-6); // Get last 6 months
      
      return trends.length > 0 ? trends : [
        { month: "No Data", transactions: 0, volume: 0 }
      ];
    } else {
      // Use general monthly trends
      return monthlyTrends.length > 0 ? monthlyTrends : [
        { month: "Jan", transactions: 0, volume: 0 },
        { month: "Feb", transactions: 0, volume: 0 },
        { month: "Mar", transactions: 0, volume: 0 },
        { month: "Apr", transactions: 0, volume: 0 },
        { month: "May", transactions: 0, volume: 0 },
        { month: "Jun", transactions: 0, volume: 0 },
      ];
    }
  }, [selectedService, currentTransactions, monthlyTrends]);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
          <TopBar onSidebarToggle={toggleSidebar} />
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-lg text-gray-600 dark:text-gray-400">Loading analytics data...</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
          <TopBar onSidebarToggle={toggleSidebar} />
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Failed to Load Analytics Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <Button onClick={handleRefresh} className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Try Again</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {selectedService && (
                    <Button
                      variant="ghost"
                      onClick={handleBackToOverview}
                      className="p-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  <div className="flex items-center space-x-4">
                    {currentServiceInfo && (
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentServiceInfo.color} flex items-center justify-center text-white text-xl`}
                      >
                        {currentServiceInfo.icon}
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedService
                          ? `${currentServiceInfo?.title} Analytics`
                          : "Analytics Dashboard"}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedService
                          ? `Detailed insights for ${currentServiceInfo?.title} service`
                          : "Comprehensive insights into your banking services performance"}
                        {showCurrentMonth && " - Current Month"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={showCurrentMonth ? "default" : "outline"}
                    onClick={toggleTimePeriod}
                    className="flex items-center space-x-2"
                  >
                    <span>{showCurrentMonth ? "Current Month" : "All Time"}</span>
                  </Button>
                  <Button
                    variant={showNormalizedView ? "default" : "outline"}
                    onClick={() => setShowNormalizedView(!showNormalizedView)}
                    className="flex items-center space-x-2"
                    title="Show percentage-based view for better comparison"
                  >
                    <span>{showNormalizedView ? "Normalized" : "Absolute"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* General Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
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
                    {formatNumber(displayStats.totalTransactions)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedService
                      ? `${currentServiceInfo?.title} service`
                      : "Across all services"}
                    {showCurrentMonth ? " (Current Month)" : " (All Time)"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Volume
                    </CardTitle>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatAmount(displayStats.totalAmount, "GH₵")}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedService ? "Service total" : "Total volume"}
                    {showCurrentMonth ? " (Current Month)" : " (All Time)"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Success Rate
                    </CardTitle>
                    <PieChart className="w-5 h-5 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayStats.successRate}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Completed transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {selectedService
                        ? "Failed Transactions"
                        : "Active Services"}
                    </CardTitle>
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedService ? formatNumber(displayStats.failedTransactions) : formatNumber(servicesAnalytics.length)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedService
                      ? "Unsuccessful transactions"
                      : "Banking services"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Service Volume Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedService
                      ? `${currentServiceInfo?.title} Volume Analysis`
                      : "Service Volume Analysis"}
                    {showCurrentMonth ? " (Current Month)" : " (All Time)"}
                    {showNormalizedView ? " - Normalized %" : ""}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedService
                      ? `Transaction volume ${showCurrentMonth ? 'for current month' : 'over time'}${showNormalizedView ? ' (percentage view)' : ''}`
                      : `Transaction volume by service ${showCurrentMonth ? '(current month only)' : '(all time)'}${showNormalizedView ? ' (percentage view)' : ''}`}
                    {serviceVolumeData.length === 0 && showCurrentMonth && 
                      " - No transactions this month"}
                  </p>
                </CardHeader>
                <CardContent>
                  {serviceVolumeData.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {showCurrentMonth 
                            ? "No transactions found for the current month" 
                            : "No services with transactions found"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={serviceVolumeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                        tickFormatter={(value) => {
                          if (showNormalizedView) return `${value}%`;
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                          return value.toString();
                        }}
                        domain={showNormalizedView ? [0, 100] : [0, 'dataMax']}
                        allowDataOverflow={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                        }}
                        formatter={(value: number | string, name: string) => [
                          name === "volume" 
                            ? (showNormalizedView ? `${value}%` : formatAmount(Number(value), "GH₵"))
                            : (showNormalizedView ? `${value}%` : formatNumber(Number(value))),
                          name === "volume" ? "Volume" : "Transactions",
                        ]}
                      />
                      <Legend 
                        content={renderCustomLegend}
                      />
                      <Bar
                        dataKey="volume"
                        fill="#3b82f6"
                        name="Volume (GH₵)"
                        minPointSize={8}
                        radius={[2, 2, 0, 0]}
                        hide={hiddenDataKeys.includes('volume')}
                      />
                      <Bar
                        dataKey="transactions"
                        fill="#10b981"
                        name="Transactions"
                        minPointSize={8}
                        radius={[2, 2, 0, 0]}
                        hide={hiddenDataKeys.includes('transactions')}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Transaction Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transaction Status Distribution
                    {showCurrentMonth ? " (Current Month)" : " (All Time)"}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedService
                      ? `Status breakdown for ${currentServiceInfo?.title}`
                      : "Status breakdown across all services"}
                    {showCurrentMonth ? " - current month only" : " - all time"}
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(Number(percent) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedService 
                      ? `${currentServiceInfo?.title} Monthly Trend`
                      : "Monthly Transaction Trend"
                    }
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedService 
                      ? `6-month trend for ${currentServiceInfo?.title} service`
                      : "6-month transaction and volume trend"
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                        }}
                        formatter={(value: number | string, name: string) => [
                          name === "volume" ? `GH₵ ${Number(value).toFixed(2)}` : value,
                          name === "volume" ? "Volume" : "Transactions",
                        ]}
                      />
                      <Legend 
                        content={renderCustomLegend}
                      />
                      <Area
                        type="monotone"
                        dataKey="transactions"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Transactions"
                        hide={hiddenDataKeys.includes('transactions')}
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stackId="2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Volume (GH₵)"
                        hide={hiddenDataKeys.includes('volume')}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Success Rates - Only show when viewing all services */}
              {!selectedService && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Service Success Rates
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Success rate comparison by service
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={serviceVolumeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          className="text-gray-600 dark:text-gray-400"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          className="text-gray-600 dark:text-gray-400"
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                          }}
                          formatter={(value: number | string) => [
                            `${value}%`,
                            "Success Rate",
                          ]}
                        />
                        <Bar
                          dataKey="successRate"
                          fill="#10b981"
                          name="Success Rate (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* All Services Analytics */}
            {!selectedService && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Service Analytics {showCurrentMonth ? "(Current Month)" : "(All Time)"}
                </h2>
                {servicesAnalytics.filter(service => {
                  const transactionCount = showCurrentMonth ? 
                    (service.currentMonthTransactionCount || 0) : 
                    service.transactionCount;
                  return transactionCount > 0;
                }).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No services with transactions found for {showCurrentMonth ? "current month" : "selected period"}.
                    </p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servicesAnalytics
                    // Remove duplicates based on service name/title
                    .filter((service, index, self) => 
                      index === self.findIndex((s) => s.name === service.name || s.id === service.id)
                    )
                    .filter((service) => {
                      // Filter out services with no transactions in current view
                      const transactionCount = showCurrentMonth ? 
                        (service.currentMonthTransactionCount || 0) : 
                        service.transactionCount;
                      return transactionCount > 0;
                    })
                    // Sort by transaction count descending
                    .sort((a, b) => {
                      const aCount = showCurrentMonth ? 
                        (a.currentMonthTransactionCount || 0) : 
                        a.transactionCount;
                      const bCount = showCurrentMonth ? 
                        (b.currentMonthTransactionCount || 0) : 
                        b.transactionCount;
                      return bCount - aCount;
                    })
                    .map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                      onClick={() => handleServiceClick(service.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center text-white text-lg`}
                          >
                            {service.icon}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                              {service.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click for analytics
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Transactions
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatNumber(showCurrentMonth ? 
                                (service.currentMonthTransactionCount || 0) : 
                                service.transactionCount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Success Rate
                            </p>
                            <p className="text-xl font-bold text-green-600">
                              {showCurrentMonth ? 
                                (service.currentMonthSuccessRate || 0) : 
                                service.successRate}%
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total Volume
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatAmount(showCurrentMonth ? 
                                (service.currentMonthTotalAmount || 0) : 
                                service.totalAmount, "GH₵")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}

                {/* Service-Specific Detailed Analytics */}
                {selectedService && serviceSpecificData && (
                  <div className="mt-8">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Detailed Analytics for {currentServiceInfo?.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        In-depth analysis and trends for this specific service
                      </p>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Transaction</p>
                            <p className="text-xl font-bold text-blue-600">
                              {formatAmount(serviceSpecificData.avgTransactionAmount, "GH₵")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Unique Users</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatNumber(serviceSpecificData.totalUniqueUsers)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</p>
                            <p className="text-xl font-bold text-purple-600">
                              {serviceSpecificData.peakHour.hour}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Processing Time</p>
                            <p className="text-xl font-bold text-orange-600">
                              {serviceSpecificData.avgTransactionTime.toFixed(1)}s
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Daily Trend */}
                      {serviceSpecificData.dailyTrend.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Daily Transaction Trend</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Transaction volume and count over time
                            </p>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={serviceSpecificData.dailyTrend}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <YAxis 
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "6px",
                                  }}
                                  formatter={(value: number | string, name: string) => [
                                    name === "Volume (GH₵)" 
                                      ? formatAmount(Number(value), "GH₵")
                                      : formatNumber(Number(value)),
                                    name
                                  ]}
                                />
                                <Legend content={renderCustomLegend} />
                                <Area
                                  type="monotone"
                                  dataKey="count"
                                  stackId="1"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.6}
                                  name="Transactions"
                                  hide={hiddenDataKeys.includes('count')}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="volume"
                                  stackId="2"
                                  stroke="#10b981"
                                  fill="#10b981"
                                  fillOpacity={0.6}
                                  name="Volume (GH₵)"
                                  hide={hiddenDataKeys.includes('volume')}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* Hourly Distribution */}
                      {serviceSpecificData.hourlyData.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Hourly Activity Pattern</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Transaction activity by hour of day
                            </p>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={serviceSpecificData.hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis 
                                  dataKey="hour" 
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <YAxis 
                                  tick={{ fontSize: 12 }}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "6px",
                                  }}
                                  formatter={(value: number | string) => [formatNumber(Number(value)), "Transactions"]}
                                />
                                <Bar
                                  dataKey="transactions"
                                  fill="#8b5cf6"
                                  name="Transactions"
                                  radius={[2, 2, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Amount Distribution */}
                    {serviceSpecificData.amountDistribution.length > 0 && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Transaction Amount Distribution</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Distribution of transactions by amount ranges
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={serviceSpecificData.amountDistribution}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis 
                                dataKey="range" 
                                tick={{ fontSize: 12 }}
                                className="text-gray-600 dark:text-gray-400"
                              />
                              <YAxis 
                                tick={{ fontSize: 12 }}
                                className="text-gray-600 dark:text-gray-400"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "var(--background)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "6px",
                                }}
                                formatter={(value: number | string) => [formatNumber(Number(value)), "Transaction Count"]}
                              />
                              <Bar
                                dataKey="count"
                                fill="#f59e0b"
                                name="Transaction Count"
                                radius={[2, 2, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
