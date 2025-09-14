import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Transaction } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Hash,
  DollarSign,
  User,
  Phone,
  CreditCard,
  Zap,
  AlertTriangle,
} from "lucide-react";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  
  if (!transaction) return null;

  // Check if user is admin - use same normalization as user management
  const normalizeRole = (role: string | undefined) => {
    if (role && typeof role === 'string') {
      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }
    return '';
  };
  
  const isAdmin = normalizeRole(user?.role) === "Admin";
  
  // Debug logging to check user role
  console.log("Current user:", user);
  console.log("User role:", user?.role);
  console.log("Normalized role:", normalizeRole(user?.role));
  console.log("Is admin check:", isAdmin);

  const getStatusIcon = (status: string) => {
    // Handle real data format status mapping
    const normalizedStatus = status?.toLowerCase() || '';
    if (normalizedStatus === "completed" || normalizedStatus === "success" || 
        normalizedStatus === "successfully processed transaction." ||
        (transaction.transferstatus && transaction.transferstatus.toLowerCase().includes("success"))) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (normalizedStatus === "pending" || normalizedStatus === "processing") {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    } else if (normalizedStatus === "failed" || normalizedStatus === "error") {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />; // Default to success for real data
  };

  const getStatusColor = (status: string) => {
    // Handle real data format status mapping
    const normalizedStatus = status?.toLowerCase() || '';
    if (normalizedStatus === "completed" || normalizedStatus === "success" ||
        normalizedStatus === "successfully processed transaction." ||
        (transaction.transferstatus && transaction.transferstatus.toLowerCase().includes("success"))) {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    } else if (normalizedStatus === "pending" || normalizedStatus === "processing") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    } else if (normalizedStatus === "failed" || normalizedStatus === "error") {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
    return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"; // Default to success for real data
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if parsing fails
      }
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return dateString; // Return original string if any error occurs
    }
  };

  const formatAmount = (amount: number) => {
    return `GH₵ ${amount.toFixed(2)}`;
  };

  const renderTransactionInfo = () => {
    const info = [];

    // Sender Account
    if (transaction.senderaccount) {
      info.push({
        label: "Sender Account",
        value: transaction.senderaccount,
        icon: <CreditCard className="w-4 h-4" />,
      });
    }

    // Receiver Account
    if (transaction.receiveraccount) {
      info.push({
        label: "Receiver Account",
        value: transaction.receiveraccount,
        icon: <CreditCard className="w-4 h-4" />,
      });
    }

    return info;
  };

  const formatJsonWithSyntaxHighlighting = (obj: unknown) => {
    const jsonString = JSON.stringify(obj, null, 2);
    return jsonString;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 pb-20">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center space-x-2">
              {getStatusIcon(transaction.status || transaction.transferstatus || "completed")}
              <span>Transaction Details</span>
              <Badge className={getStatusColor(transaction.status || transaction.transferstatus || "completed")}>
                {(transaction.status || transaction.transferstatus || "Completed").charAt(0).toUpperCase() +
                  (transaction.status || transaction.transferstatus || "Completed").slice(1)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Hash className="w-5 h-5" />
                  <span>Transaction Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Transaction ID
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {transaction.transactionid || transaction.reference}
                    </span>
                  </div>
                  
                  {/* Reference Number - only show if different from transaction ID */}
                  {transaction.reference && transaction.reference !== transaction.transactionid && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reference Number
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {transaction.reference}
                      </span>
                    </div>
                  )}

                  {/* Batch Number */}
                  {transaction.batchnumber && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Batch Number
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {transaction.batchnumber}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      Transaction Date
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(transaction.date)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      Transaction Amount
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {transaction.currency && transaction.currency !== "GHS" 
                        ? `${transaction.currency} ${parseFloat(transaction.amount.toString()).toFixed(2)}`
                        : formatAmount(transaction.amount)
                      }
                    </span>
                  </div>

                  {/* Payout Currency */}
                  {transaction.payoutcurrency && transaction.payoutcurrency !== transaction.currency && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                        Payout Currency
                      </span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {transaction.payoutcurrency}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Transaction Description
                  </span>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
                    {transaction.description || transaction.narration || "No description available"}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Transaction Participants
                  </h4>
                  {renderTransactionInfo().map((info, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        {React.cloneElement(info.icon, { className: "w-4 h-4 mr-2 text-blue-500" })}
                        {info.label}
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{info.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Message for Failed Transactions */}
          {((transaction.status === "failed" && transaction.errorMessage) || 
            transaction.exceptions || 
            (transaction.responsecode && transaction.responsecode !== "000") ||
            (transaction.statuscode && transaction.statuscode !== "200")) && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Error Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transaction.errorMessage && (
                  <div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Error Message:</span>
                    <p className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mt-1">
                      {transaction.errorMessage}
                    </p>
                  </div>
                )}
                {transaction.responsecode && transaction.responsecode !== "000" && (
                  <div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Response Code:</span>
                    <p className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mt-1">
                      Code: {transaction.responsecode} - {transaction.responsemessage || "Unknown error"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Request and Response Bodies - Admin Only */}
          {isAdmin && (
            <Tabs defaultValue="request" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="request">Request Payload</TabsTrigger>
                <TabsTrigger value="response">Response Payload</TabsTrigger>
                <TabsTrigger value="callback">Callback Payload</TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Request Payload</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full">
                      <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                        <code className="language-json whitespace-pre-wrap">
                          {(() => {
                            // Use the real API data format
                            if (transaction.requestpayload) {
                              try {
                                return formatJsonWithSyntaxHighlighting(
                                  JSON.parse(transaction.requestpayload)
                                );
                              } catch {
                                return transaction.requestpayload;
                              }
                            }
                            // Fallback to old format for compatibility
                            if (transaction.requestBody) {
                              return formatJsonWithSyntaxHighlighting(transaction.requestBody);
                            }
                            return "No request payload available";
                          })()}
                        </code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="response" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Response Payload</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Initial response from the API endpoint
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full">
                      <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                        <code className="language-json whitespace-pre-wrap">
                          {(() => {
                            // Use the real API data format
                            if (transaction.responsepayload) {
                              try {
                                const parsed = JSON.parse(transaction.responsepayload);
                                // Check if the message field contains nested JSON
                                if (parsed.message && typeof parsed.message === 'string') {
                                  try {
                                    parsed.message = JSON.parse(parsed.message);
                                  } catch {
                                    // Keep original message if it's not JSON
                                  }
                                }
                                return formatJsonWithSyntaxHighlighting(parsed);
                              } catch {
                                return transaction.responsepayload;
                              }
                            }
                            // Fallback to old format for compatibility
                            if (transaction.responseBody) {
                              return formatJsonWithSyntaxHighlighting(transaction.responseBody);
                            }
                            return "No response payload available";
                          })()}
                        </code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="callback" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Callback Payload</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Final callback response received from the service provider with transaction result
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full">
                      <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                        <code className="language-json whitespace-pre-wrap">
                          {(() => {
                            // Use the real API data format
                            if (transaction.callback) {
                              try {
                                return formatJsonWithSyntaxHighlighting(
                                  JSON.parse(transaction.callback)
                                );
                              } catch (e) {
                                return transaction.callback;
                              }
                            }
                            return "No callback payload available";
                          })()}
                        </code>
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
