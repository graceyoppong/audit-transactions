"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Transaction } from '@/lib/mockData';

interface StatusCheckerProps {
  transaction: Transaction;
  className?: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'unknown';

/**
 * Determines the status of transactions based on transaction type
 * Currently supports:
 * - AM/MA: Account to Mobile / Mobile to Account transfers
 * 
 * Future transaction types can be added here
 */
export const getTransactionStatus = (transaction: Transaction): TransactionStatus => {
  const { transtype } = transaction;

  if (!transtype) {
    return 'unknown';
  }

  // Handle AM/MA transaction types (Account to Mobile / Mobile to Account)
  if (['AM', 'MA'].includes(transtype)) {
    return getAMMAStatus(transaction);
  }

  // Future transaction types can be added here:
  // if (transtype === 'BP') return getBillPaymentStatus(transaction);
  // if (transtype === 'FT') return getFundTransferStatus(transaction);

  return 'unknown';
};

/**
 * Status logic for AM/MA transactions
 * - Pending: param4 = null and responsecode = "000"
 * - Success: param4 = "01" and responsecode = "000" 
 * - Failed: anything else
 */
const getAMMAStatus = (transaction: Transaction): TransactionStatus => {
  const { param4, responsecode } = transaction;

  // Pending: param4 is null/undefined and responsecode is "000"
  if ((param4 === null || param4 === undefined || param4 === '') && responsecode === "000") {
    return 'pending';
  }

  // Success: param4 is "01" and responsecode is "000"
  if (param4 === "01" && responsecode === "000") {
    return 'success';
  }

  // Everything else is failure
  return 'failed';
};

/**
 * Gets the appropriate transaction ID for AM/MA transactions (uses param3)
 */
export const getTransactionId = (transaction: Transaction): string => {
  // For AM/MA transactions, use param3 if available
  if (transaction.transtype && ['AM', 'MA'].includes(transaction.transtype) && transaction.param3) {
    return transaction.param3;
  }
  
  // For other transaction types, use original logic
  return transaction.transactionid || transaction.reference || transaction.id || "";
};

/**
 * Gets the appropriate description based on transaction status for AM/MA transactions
 */
export const getTransactionDescription = (transaction: Transaction): string => {
  // Only process transactions with transtype 'AM' or 'MA'
  if (!transaction.transtype || !['AM', 'MA'].includes(transaction.transtype)) {
    // For non-AM/MA transactions, use original logic
    return transaction.narration || transaction.description || "-";
  }

  const status = getAMMAStatus(transaction);
  
  switch (status) {
    case 'pending':
      // Pending: use responsemessage
      return transaction.responsemessage || transaction.narration || transaction.description || "-";
    
    case 'success':
      // Success: use param5
      return transaction.param5 || transaction.narration || transaction.description || "-";
    
    case 'failed':
      // Failed: use param5, if null then responsemessage
      return transaction.param5 || transaction.responsemessage || transaction.narration || transaction.description || "-";
    
    default:
      return transaction.narration || transaction.description || "-";
  }
};

/**
 * Gets the branch value using param6
 */
export const getTransactionBranch = (transaction: Transaction): string => {
  return transaction.param6 || "-";
};

/**
 * Returns the appropriate status variant for badges
 */
export const getStatusVariant = (status: TransactionStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'success':
      return 'default'; // Green
    case 'pending':
      return 'outline'; // Yellow
    case 'failed':
      return 'destructive'; // Red
    case 'unknown':
      return 'secondary'; // Gray
    default:
      return 'secondary';
  }
};

/**
 * Returns the appropriate icon for the status
 */
export const getStatusIcon = (status: TransactionStatus, size: number = 16) => {
  switch (status) {
    case 'success':
      return <CheckCircle size={size} className="text-green-600" />;
    case 'pending':
      return <Clock size={size} className="text-blue-600" />;
    case 'failed':
      return <XCircle size={size} className="text-red-600" />;
    case 'unknown':
      return <AlertCircle size={size} className="text-gray-600" />;
    default:
      return <AlertCircle size={size} className="text-gray-600" />;
  }
};

/**
 * Returns a human-readable status message
 */
export const getStatusMessage = (status: TransactionStatus, transtype?: string): string => {
  switch (status) {
    case 'success':
      return 'Transaction completed successfully';
    case 'pending':
      return 'Transaction is being processed';
    case 'failed':
      return 'Transaction failed';
    case 'unknown':
      return transtype ? `Status check not supported for ${transtype} transactions` : 'Status not applicable';
    default:
      return 'Unknown status';
  }
};

/**
 * StatusChecker Component
 * Displays the status of AM/MA transactions with appropriate styling
 */
const StatusChecker: React.FC<StatusCheckerProps> = ({ 
  transaction, 
  className = "" 
}) => {
  const status = getTransactionStatus(transaction);
  const variant = getStatusVariant(status);
  const icon = getStatusIcon(status, 14);
  const message = getStatusMessage(status, transaction.transtype);

  // Don't render for non-AM/MA transactions
  if (status === 'unknown') {
    return null;
  }

  // Custom styling for all status types to ensure correct colors
  let customClassName = '';
  if (status === 'pending') {
    customClassName = 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
  } else if (status === 'success') {
    customClassName = 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
  } else if (status === 'failed') {
    customClassName = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon}
      <Badge variant={variant} className={`flex items-center gap-1 ${customClassName}`}>
        <span className="capitalize">{status}</span>
      </Badge>
      <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
        {message}
      </span>
    </div>
  );
};

/**
 * Compact version for table cells
 */
export const StatusBadge: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const status = getTransactionStatus(transaction);
  const variant = getStatusVariant(status);

  if (status === 'unknown') {
    return null;
  }

  // Custom styling for all status types to ensure correct colors
  let customClassName = '';
  if (status === 'pending') {
    customClassName = 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
  } else if (status === 'success') {
    customClassName = 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
  } else if (status === 'failed') {
    customClassName = 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
  }

  return (
    <Badge variant={variant} className={`flex items-center gap-1 ${customClassName}`}>
      {getStatusIcon(status, 12)}
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

/**
 * Detailed status card for transaction details
 */
export const StatusCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const status = getTransactionStatus(transaction);
  const message = getStatusMessage(status, transaction.transtype);

  if (status === 'unknown') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          {getStatusIcon('unknown')}
          <span className="font-medium">Status Check Not Supported</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          This transaction type ({transaction.transtype || 'Unknown'}) is not currently supported for status checking.
        </p>
      </div>
    );
  }

  const bgColor = {
    'success': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    'pending': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    'failed': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    'unknown': 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }[status];

  return (
    <div className={`p-4 rounded-lg border ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon(status)}
        <span className="font-medium capitalize">{status} Status</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {message}
      </p>
      <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
        <div>Transaction Type: <span className="font-mono">{transaction.transtype}</span></div>
        <div>Response Code: <span className="font-mono">{transaction.responsecode || 'N/A'}</span></div>
        <div>Param4: <span className="font-mono">{transaction.param4 || 'null'}</span></div>
      </div>
    </div>
  );
};

export default StatusChecker;
