"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionTable from "@/components/TransactionTable";
import FilterModal, { FilterCriteria } from "@/components/FilterModal";
import ExportDropdown from "@/components/ExportDropdown";
import { mockTransactions, cardData, Transaction } from "@/lib/mockData";
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/exportUtils";
import {
  ArrowLeft,
  Filter,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";

const TransactionDetails: React.FC = () => {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCriteria | null>(
    null
  );

  const cardInfo = cardData.find((card) => card.id === serviceId);
  const allTransactions = serviceId ? mockTransactions[serviceId] || [] : [];

  // Filter transactions for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const last30DaysTransactions = allTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= thirtyDaysAgo;
  });

  const transactions = appliedFilters
    ? filteredTransactions
    : last30DaysTransactions;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleApplyFilters = (filters: FilterCriteria) => {
    let filtered = [...last30DaysTransactions];

    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.reference.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.accountNumber) {
      filtered = filtered.filter((t) =>
        t.accountNumber
          ?.toLowerCase()
          .includes(filters.accountNumber.toLowerCase())
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    if (filters.phoneNumber) {
      filtered = filtered.filter((t) =>
        t.phoneNumber?.toLowerCase().includes(filters.phoneNumber.toLowerCase())
      );
    }

    if (filters.meterNumber) {
      filtered = filtered.filter((t) =>
        t.meterNumber?.toLowerCase().includes(filters.meterNumber.toLowerCase())
      );
    }

    if (filters.smartCardNumber) {
      filtered = filtered.filter((t) =>
        t.smartCardNumber
          ?.toLowerCase()
          .includes(filters.smartCardNumber.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((t) => new Date(t.date) >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((t) => new Date(t.date) <= filters.dateTo!);
    }

    if (filters.amountFrom) {
      filtered = filtered.filter(
        (t) => t.amount >= parseFloat(filters.amountFrom)
      );
    }

    if (filters.amountTo) {
      filtered = filtered.filter(
        (t) => t.amount <= parseFloat(filters.amountTo)
      );
    }

    setFilteredTransactions(filtered);
    setAppliedFilters(filters);
  };

  const handleExportPDF = () => {
    const filename = `${cardInfo?.title
      .replace(/\s+/g, "_")
      .toLowerCase()}_transactions_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    exportToPDF(transactions, {
      filename,
      title: `${cardInfo?.title} - Transaction Report`,
      serviceType: serviceId,
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
      serviceType: serviceId,
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
      serviceType: serviceId,
    });
  };

  if (!cardInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service Not Found
          </h1>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedCount = transactions.filter(
    (t) => t.status === "completed"
  ).length;
  const pendingCount = transactions.filter(
    (t) => t.status === "pending"
  ).length;
  const failedCount = transactions.filter((t) => t.status === "failed").length;

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
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cardInfo.color} flex items-center justify-center text-white text-xl`}
                  >
                    {cardInfo.icon}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {cardInfo.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {cardInfo.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Last 30 days
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilterModal(true)}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                    {transactions.length}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
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
                    {completedCount}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Successful transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
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
                    {pendingCount}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    In progress
                  </p>
                </CardContent>
              </Card>

              <Card>
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
                    {failedCount}
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
                    GH₵ {totalAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total volume
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={transactions}
                  serviceType={serviceId}
                />
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
        serviceType={serviceId || ""}
      />
    </div>
  );
};

export default TransactionDetails;
