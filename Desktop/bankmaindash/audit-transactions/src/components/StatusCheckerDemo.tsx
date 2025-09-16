"use client";

import React from 'react';
import StatusChecker, { StatusBadge, StatusCard, getTransactionStatus } from '@/components/StatusChecker';
import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Example transactions for testing the status checker
const exampleTransactions: Transaction[] = [
  {
    id: "1",
    date: "2025-09-15T10:00:00Z",
    amount: 100.00,
    status: "pending",
    reference: "TXN001",
    description: "Account to Mobile Transfer",
    type: "debit",
    transtype: "AM",
    param4: null, // null with responsecode "000" = pending
    responsecode: "000"
  },
  {
    id: "2", 
    date: "2025-09-15T11:00:00Z",
    amount: 200.00,
    status: "completed",
    reference: "TXN002", 
    description: "Mobile to Account Transfer",
    type: "credit",
    transtype: "MA",
    param4: "04", // "04" with responsecode "000" = success
    responsecode: "000"
  },
  {
    id: "3",
    date: "2025-09-15T12:00:00Z", 
    amount: 150.00,
    status: "failed",
    reference: "TXN003",
    description: "Account to Mobile Transfer",
    type: "debit", 
    transtype: "AM",
    param4: "02", // anything else = failed
    responsecode: "001"
  },
  {
    id: "4",
    date: "2025-09-15T13:00:00Z",
    amount: 300.00,
    status: "completed",
    reference: "TXN004",
    description: "Bill Payment",
    type: "debit",
    transtype: "BP", // Not AM/MA = unknown status
    param4: "04",
    responsecode: "000"
  }
];

const StatusCheckerDemo: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Status Checker Component Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This component checks the status of transactions with transtype 'AM' and 'MA' based on param4 and responsecode values.
        </p>
      </div>

      {/* Status Logic Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Status Logic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium w-20">Pending:</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                param4 = null AND responsecode = "000"
              </code>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium w-20">Success:</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                param4 = "04" AND responsecode = "000"
              </code>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium w-20">Failed:</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                Anything else
              </code>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium w-20">Unknown:</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                transtype is not 'AM' or 'MA'
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Transactions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Example Transactions</h2>
        
        {exampleTransactions.map((transaction) => {
          const calculatedStatus = getTransactionStatus(transaction);
          
          return (
            <Card key={transaction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {transaction.reference} - {transaction.description}
                  </CardTitle>
                  <StatusBadge transaction={transaction} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Transaction Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Transaction Details</h4>
                    <div className="text-sm space-y-1">
                      <div>Amount: GHS {transaction.amount.toFixed(2)}</div>
                      <div>Type: {transaction.transtype}</div>
                      <div>Reference: {transaction.reference}</div>
                      <div>Original Status: {transaction.status}</div>
                    </div>
                  </div>

                  {/* Status Check Details */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Status Check Details</h4>
                    <div className="text-sm space-y-1">
                      <div>Param4: <code>{transaction.param4 || 'null'}</code></div>
                      <div>Response Code: <code>{transaction.responsecode}</code></div>
                      <div>Calculated Status: <span className="capitalize font-medium">{calculatedStatus}</span></div>
                    </div>
                  </div>
                </div>

                {/* Status Components */}
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Status Checker Component:</h4>
                    <StatusChecker transaction={transaction} />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Status Card Component:</h4>
                    <StatusCard transaction={transaction} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Usage:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
{`import StatusChecker, { StatusBadge, StatusCard, getTransactionStatus } from '@/components/StatusChecker';

// In a table cell
<StatusBadge transaction={transaction} />

// Full status display
<StatusChecker transaction={transaction} />

// Detailed status card
<StatusCard transaction={transaction} />

// Get status programmatically
const status = getTransactionStatus(transaction);`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCheckerDemo;
