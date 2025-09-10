"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockTransactions, cardData } from "@/lib/mockData";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  ArrowLeft,
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleBackToOverview = () => {
    setSelectedService(null);
  };

  // Get data based on selected service or all services
  const currentTransactions = selectedService
    ? mockTransactions[selectedService] || []
    : Object.values(mockTransactions).flat();

  const currentServiceInfo = selectedService
    ? cardData.find((service) => service.id === selectedService)
    : null;

  // Calculate analytics based on current selection
  const totalTransactions = currentTransactions.length;
  const totalAmount = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = currentTransactions.filter(
    (t) => t.status === "completed"
  ).length;
  const pendingTransactions = currentTransactions.filter(
    (t) => t.status === "pending"
  ).length;
  const failedTransactions = currentTransactions.filter(
    (t) => t.status === "failed"
  ).length;
  const successRate =
    totalTransactions > 0
      ? ((completedTransactions / totalTransactions) * 100).toFixed(1)
      : "0";

  // Service-specific analytics
  const serviceAnalytics = cardData.map((service) => {
    const serviceTransactions = mockTransactions[service.id] || [];
    const serviceTotal = serviceTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const serviceCompleted = serviceTransactions.filter(
      (t) => t.status === "completed"
    ).length;
    const servicePending = serviceTransactions.filter(
      (t) => t.status === "pending"
    ).length;
    const serviceFailed = serviceTransactions.filter(
      (t) => t.status === "failed"
    ).length;
    const serviceSuccessRate =
      serviceTransactions.length > 0
        ? ((serviceCompleted / serviceTransactions.length) * 100).toFixed(1)
        : "0";

    return {
      ...service,
      transactionCount: serviceTransactions.length,
      totalAmount: serviceTotal,
      successRate: parseFloat(serviceSuccessRate),
      completedCount: serviceCompleted,
      pendingCount: servicePending,
      failedCount: serviceFailed,
    };
  });

  // Chart data preparation
  const serviceVolumeData = serviceAnalytics.map((service) => ({
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
      value: completedTransactions,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: pendingTransactions,
      color: "#f59e0b",
    },
    {
      name: "Failed",
      value: failedTransactions,
      color: "#ef4444",
    },
  ];

  // Monthly trend data (simulated)
  const monthlyData = [
    { month: "Jan", transactions: 245, volume: 12450 },
    { month: "Feb", transactions: 289, volume: 15230 },
    { month: "Mar", transactions: 321, volume: 18700 },
    { month: "Apr", transactions: 298, volume: 16800 },
    { month: "May", transactions: 356, volume: 21200 },
    { month: "Jun", transactions: 398, volume: 24100 },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

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
                    {totalTransactions}
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
                    GH₵ {totalAmount.toFixed(2)}
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
                    {successRate}%
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
                    {selectedService ? failedTransactions : cardData.length}
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
                  {serviceAnalytics.map((service) => (
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
