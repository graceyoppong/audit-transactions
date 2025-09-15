"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
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

  // Get data based on selected service or all services
  const currentTransactions = selectedService
    ? allTransactions.filter(t => {
        // Find the service to match transactions
        const service = servicesAnalytics.find(s => s.id === selectedService);
        if (!service) return false;
        
        // Try to match by service name or description
        const serviceName = service.name.toLowerCase();
        const transactionDesc = t.description?.toLowerCase() || '';
        const transactionNarration = (t as any).narration?.toLowerCase() || '';
        
        return transactionDesc.includes(serviceName) || 
               transactionNarration.includes(serviceName) ||
               (selectedService === service.id);
      })
    : allTransactions;

  const currentServiceInfo = selectedService
    ? servicesAnalytics.find((service) => service.id === selectedService)
    : null;

  // Calculate analytics based on current selection
  const currentTotalTransactions = currentTransactions.length;
  const currentTotalAmount = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const currentCompletedTransactions = currentTransactions.filter(
    (t) => t.status === "completed"
  ).length;
  const currentPendingTransactions = currentTransactions.filter(
    (t) => t.status === "pending"
  ).length;
  const currentFailedTransactions = currentTransactions.filter(
    (t) => t.status === "failed"
  ).length;
  const currentSuccessRate =
    currentTotalTransactions > 0
      ? ((currentCompletedTransactions / currentTotalTransactions) * 100).toFixed(1)
      : "0";

  // Chart data preparation
  const serviceVolumeData = servicesAnalytics.map((service) => ({
    name:
      service.title.length > 15
        ? service.title.substring(0, 15) + "..."
        : service.title,
    volume: service.totalAmount,
    transactions: service.transactionCount,
    successRate: service.successRate,
  }));

  const statusDistributionData = [
    {
      name: "Completed",
      value: currentCompletedTransactions,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: currentPendingTransactions,
      color: "#f59e0b",
    },
    {
      name: "Failed",
      value: currentFailedTransactions,
      color: "#ef4444",
    },
  ];

  // Use the monthly trends from the analytics hook
  const monthlyData = monthlyTrends.length > 0 ? monthlyTrends : [
    { month: "Jan", transactions: 0, volume: 0 },
    { month: "Feb", transactions: 0, volume: 0 },
    { month: "Mar", transactions: 0, volume: 0 },
    { month: "Apr", transactions: 0, volume: 0 },
    { month: "May", transactions: 0, volume: 0 },
    { month: "Jun", transactions: 0, volume: 0 },
  ];

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
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                    {selectedService ? currentTotalTransactions : totalTransactions}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedService
                      ? `${currentServiceInfo?.title} service`
                      : "Across all services"}
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
                    GH₵ {selectedService ? currentTotalAmount.toFixed(2) : totalAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {selectedService ? "Service total" : "All time total"}
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
                    {selectedService ? currentSuccessRate : successRate}%
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
                    {selectedService ? currentFailedTransactions : servicesAnalytics.length}
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
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedService
                      ? "Transaction volume over time"
                      : "Transaction volume by service"}
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
                      <Legend />
                      <Bar
                        dataKey="volume"
                        fill="#3b82f6"
                        name="Volume (GH₵)"
                      />
                      <Bar
                        dataKey="transactions"
                        fill="#10b981"
                        name="Transactions"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Transaction Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transaction Status Distribution
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedService
                      ? `Status breakdown for ${currentServiceInfo?.title}`
                      : "Status breakdown across all services"}
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
                    Monthly Transaction Trend
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    6-month transaction and volume trend
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
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="transactions"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Transactions"
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stackId="2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Volume (GH₵)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Service Success Rates */}
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
            </div>

            {/* All Services Analytics */}
            {!selectedService && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Service Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servicesAnalytics.map((service) => (
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
                              {service.transactionCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Success Rate
                            </p>
                            <p className="text-xl font-bold text-green-600">
                              {service.successRate}%
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Total Volume
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              GH₵ {service.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
