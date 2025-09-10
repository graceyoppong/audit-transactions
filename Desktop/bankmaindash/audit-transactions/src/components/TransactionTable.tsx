import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction } from "@/lib/mockData";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  serviceType?: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  serviceType,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset to first page when transactions change (e.g., after filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatAmount = (amount: number) => {
    return `GH₵ ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getServiceSpecificColumns = () => {
    switch (serviceType) {
      case "acc-to-wallet":
      case "wallet-to-acc":
        return ["Sender", "Recipient", "Account Number"];
      case "airtime":
        return ["Phone Number", "Account Number"];
      case "ecg":
      case "water":
        return ["Meter Number", "Account Number"];
      case "multichoice":
        return ["Smart Card Number", "Account Number"];
      default:
        return ["Account Number"];
    }
  };

  const renderServiceSpecificData = (transaction: Transaction) => {
    switch (serviceType) {
      case "acc-to-wallet":
      case "wallet-to-acc":
        return (
          <>
            <TableCell className="text-gray-700 dark:text-gray-300">
              {transaction.sender || "-"}
            </TableCell>
            <TableCell className="text-gray-700 dark:text-gray-300">
              {transaction.recipient || "-"}
            </TableCell>
            <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {transaction.accountNumber || "-"}
            </TableCell>
          </>
        );
      case "airtime":
        return (
          <>
            <TableCell className="text-gray-700 dark:text-gray-300">
              {transaction.phoneNumber || "-"}
            </TableCell>
            <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {transaction.accountNumber || "-"}
            </TableCell>
          </>
        );
      case "ecg":
      case "water":
        return (
          <>
            <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {transaction.meterNumber || "-"}
            </TableCell>
            <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {transaction.accountNumber || "-"}
            </TableCell>
          </>
        );
      case "multichoice":
        return (
          <>
            <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {transaction.smartCardNumber || "-"}
            </TableCell>
            <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {transaction.accountNumber || "-"}
            </TableCell>
          </>
        );
      default:
        return (
          <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
            {transaction.accountNumber || "-"}
          </TableCell>
        );
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const serviceSpecificColumns = getServiceSpecificColumns();

  return (
    <div className="space-y-4">
      {/* Items per page dropdown - Top Right */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            per page
          </span>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-900 dark:text-gray-100">
                Date
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Description
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Reference
              </TableHead>
              {serviceSpecificColumns.map((column) => (
                <TableHead
                  key={column}
                  className="text-gray-900 dark:text-gray-100"
                >
                  {column}
                </TableHead>
              ))}
              <TableHead className="text-gray-900 dark:text-gray-100">
                Amount
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Type
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7 + serviceSpecificColumns.length}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              currentTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {transaction.reference}
                  </TableCell>
                  {renderServiceSpecificData(transaction)}
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transaction.type === "credit"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      }
                    >
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Pagination */}
      {transactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Showing results text - Bottom Left */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, transactions.length)} of {transactions.length}{" "}
            transactions
          </div>

          {/* Pagination controls - Bottom Right */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="hidden sm:flex"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              <div className="flex items-center space-x-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === "..." ? (
                      <span className="px-2 text-gray-500">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page as number)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hidden sm:flex"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TransactionTable;
