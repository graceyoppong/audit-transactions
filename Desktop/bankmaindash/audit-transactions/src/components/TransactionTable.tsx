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
import { getTransactionStatus, getStatusVariant, getTransactionDescription, getTransactionId } from "@/components/StatusChecker";
import { formatAmount, formatDate, formatNumber } from "@/lib/utils";
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

  // Use centralized formatting utilities
  const formatAmountDisplay = (amount: number | string, currency?: string) => {
    return formatAmount(amount, currency && currency !== "GHS" ? currency : "GH₵");
  };

  const formatDateDisplay = (dateString: string) => {
    return formatDate(dateString);
  };

  // Use the centralized status logic from StatusChecker
  const getStatusDisplay = (transaction: Transaction) => {
    const status = getTransactionStatus(transaction);
    const variant = getStatusVariant(status);
    
    // For non-AM/MA transactions, fall back to original logic
    if (status === 'unknown') {
      const fallbackStatus = transaction.status || transaction.transferstatus || "completed";
      const normalizedStatus = fallbackStatus?.toLowerCase() || '';
      
      if (normalizedStatus === "completed" || normalizedStatus === "success" || 
          normalizedStatus === "successfully processed transaction." ||
          (transaction.transferstatus && transaction.transferstatus.toLowerCase().includes("success"))) {
        return { status: 'completed', variant: 'default' as const };
      } else if (normalizedStatus === "pending" || normalizedStatus === "processing") {
        return { status: 'pending', variant: 'outline' as const };
      } else if (normalizedStatus === "failed" || normalizedStatus === "error") {
        return { status: 'failed', variant: 'destructive' as const };
      }
      return { status: 'completed', variant: 'default' as const };
    }
    
    return { status, variant };
  };

  const getSenderInfo = (transaction: Transaction) => {
    return transaction.senderaccount || transaction.sender || transaction.customername || "-";
  };

  const getReceiverInfo = (transaction: Transaction) => {
    return transaction.receiveraccount || transaction.recipient || transaction.receivername || "-";
  };

  const getTransactionIdDisplay = (transaction: Transaction) => {
    return getTransactionId(transaction);
  };

  const getBatchNumber = (transaction: Transaction) => {
    return transaction.batchnumber || transaction.reference || "-";
  };

  const getDescription = (transaction: Transaction) => {
    return getTransactionDescription(transaction);
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
                Transaction ID
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Batch No.
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Sender
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Receiver
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Amount
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Description
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Status
              </TableHead>
              <TableHead className="text-gray-900 dark:text-gray-100">
                Date & Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
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
                  <TableCell className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {getTransactionIdDisplay(transaction)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {getBatchNumber(transaction)}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {getSenderInfo(transaction)}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {getReceiverInfo(transaction)}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {formatAmountDisplay(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {getDescription(transaction)}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const { status, variant } = getStatusDisplay(transaction);
                      // Custom styling for all status types to ensure correct colors
                      let customClassName = '';
                      if (status === 'pending') {
                        customClassName = 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
                      } else if (status === 'outstanding') {
                        customClassName = 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
                      } else if (status === 'completed' || status === 'success') {
                        customClassName = 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
                      } else if (status === 'failed') {
                        customClassName = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
                      }
                      return (
                        <Badge variant={variant} className={customClassName}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDateDisplay(transaction.postingdate || transaction.date)}
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
            Showing {formatNumber(startIndex + 1)} to{" "}
            {formatNumber(Math.min(endIndex, transactions.length))} of {formatNumber(transactions.length)}{" "}
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
