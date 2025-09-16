"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Transaction } from '@/lib/mockData';

interface StatusCheckerProps {
  transaction: Transaction;
  className?: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'outstanding' | 'unknown';

/**
 * Determines the status of transactions based on transaction type
 * All transaction types use the same parameter mapping:
 * - Transaction ID: param3
 * - Description: param5 (success/outstanding/failed) or responsemessage (pending)
 * - Branch: param6
 * - Status determination: param4 and responsecode
 */
export const getTransactionStatus = (transaction: Transaction): TransactionStatus => {
  const { transtype } = transaction;

  if (!transtype) {
    return 'unknown';
  }

  // Use unified status logic for all transaction types
  return getUnifiedStatus(transaction);
};

/**
 * Unified status logic for all transactions using consistent parameter mapping
 * Success criteria:
 * - AM/MA: param4 = "01" and responsecode = "00" or "000"
 * - All others: param4 = "200" and responsecode = "00" or "000"
 */
const getUnifiedStatus = (transaction: Transaction): TransactionStatus => {
  const { param4, responsecode, transtype } = transaction;

  // Determine expected param4 based on transaction type
  let expectedParam4: string;
  
  if (['AM', 'MA'].includes(transtype || '')) {
    expectedParam4 = "01";
  } else {
    expectedParam4 = "200";
  }

  // All transaction types now accept both "00" and "000" as valid response codes
  const validResponseCodes = ["00", "000"];

  // Pending: param4 is null/undefined and responsecode matches any valid code
  if ((param4 === null || param4 === undefined || param4 === '') && validResponseCodes.includes(responsecode || '')) {
    return 'pending';
  }

  // Success: param4 matches expected and responsecode matches any valid code
  if (param4 === expectedParam4 && validResponseCodes.includes(responsecode || '')) {
    return 'success';
  }

  // Outstanding: param4 matches expected but responsecode doesn't match any valid code
  if (param4 === expectedParam4 && !validResponseCodes.includes(responsecode || '')) {
    return 'outstanding';
  }

  // Everything else is failure
  return 'failed';
};

/**
 * Gets the appropriate transaction ID for all transactions (uses param3)
 */
export const getTransactionId = (transaction: Transaction): string => {
  // For all transaction types, use param3 only
  return transaction.param3 || "N/A";
};

/**
 * Gets the appropriate description based on transaction status
 * Uses unified parameter mapping for all transaction types:
 * - Pending: responsemessage only
 * - Success/Outstanding/Failed: param5 only
 */
export const getTransactionDescription = (transaction: Transaction): string => {
  const status = getUnifiedStatus(transaction);
  
  switch (status) {
    case 'pending':
      // Pending: use responsemessage only
      return transaction.responsemessage || "N/A";
    
    case 'success':
    case 'outstanding':
    case 'failed':
      // Success/Outstanding/Failed: use param5 only
      return transaction.param5 || "N/A";
    
    default:
      return "N/A";
  }
};

/**
 * Gets the branch value using param6
 */
export const getTransactionBranch = (transaction: Transaction): string => {
  return transaction.param6 || "N/A";
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
    case 'outstanding':
      return 'outline'; // Orange/Yellow variant
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
    case 'outstanding':
      return <AlertCircle size={size} className="text-indigo-600" />;
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
    case 'outstanding':
      return 'Transaction has outstanding issues';
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
 * Displays the status of all transaction types with unified parameter mapping
 * All transactions use: param3 (ID), param5 (description), param6 (branch)
 */
const StatusChecker: React.FC<StatusCheckerProps> = ({ 
  transaction, 
  className = "" 
}) => {
  const status = getTransactionStatus(transaction);
  const variant = getStatusVariant(status);
  const icon = getStatusIcon(status, 14);
  const message = getStatusMessage(status, transaction.transtype);

  // Don't render for transactions without transtype
  if (status === 'unknown') {
    return null;
  }

  // Custom styling for all status types to ensure correct colors
  let customClassName = '';
  if (status === 'pending') {
    customClassName = 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
  } else if (status === 'outstanding') {
    customClassName = 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
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
  } else if (status === 'outstanding') {
    customClassName = 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
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
          This transaction does not have a transaction type specified.
        </p>
      </div>
    );
  }

  const bgColor = {
    'success': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    'pending': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    'outstanding': 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
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
      
      {/* Only show error details for failed or outstanding status */}
      {(status === 'failed' || status === 'outstanding') && (
        <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <div>Transaction Type: <span className="font-mono">{transaction.transtype}</span></div>
          <div>Response Code: <span className="font-mono">{transaction.responsecode || 'N/A'}</span></div>
          <div>Param4: <span className="font-mono">{transaction.param4 || 'null'}</span></div>
        </div>
      )}
    </div>
  );
};

export default StatusChecker;
