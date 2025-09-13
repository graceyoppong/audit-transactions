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
  if (!transaction) return null;

  const getStatusIcon = (status: string) => {
    // Handle real data format status mapping
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "completed" || normalizedStatus === "success") {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (normalizedStatus === "pending" || normalizedStatus === "processing") {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    } else if (normalizedStatus === "failed" || normalizedStatus === "error") {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    // Handle real data format status mapping
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "completed" || normalizedStatus === "success") {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    } else if (normalizedStatus === "pending" || normalizedStatus === "processing") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    } else if (normalizedStatus === "failed" || normalizedStatus === "error") {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
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

    // Sender Account (from real data format)
    if (transaction.senderaccount) {
      info.push({
        label: "Sender Account",
        value: transaction.senderaccount,
        icon: <CreditCard className="w-4 h-4" />,
      });
    }

    // Receiver Account (from real data format)
    if (transaction.receiveraccount) {
      info.push({
        label: "Receiver Account",
        value: transaction.receiveraccount,
        icon: <CreditCard className="w-4 h-4" />,
      });
    }

    // Sender Telephone (from real data format)
    if (transaction.sendertelephone) {
      info.push({
        label: "Sender Phone",
        value: transaction.sendertelephone,
        icon: <Phone className="w-4 h-4" />,
      });
    }

    // Receiver Telephone (from real data format)
    if (transaction.receivertelephone) {
      info.push({
        label: "Receiver Phone",
        value: transaction.receivertelephone,
        icon: <Phone className="w-4 h-4" />,
      });
    }

    // Currency (from real data format)
    if (transaction.currency) {
      info.push({
        label: "Currency",
        value: transaction.currency,
        icon: <DollarSign className="w-4 h-4" />,
      });
    }

    // Customer Number (from real data format)
    if (transaction.customernumber) {
      info.push({
        label: "Customer Number",
        value: transaction.customernumber,
        icon: <User className="w-4 h-4" />,
      });
    }

    // Customer Name (from real data format)
    if (transaction.customername) {
      info.push({
        label: "Customer Name",
        value: transaction.customername,
        icon: <User className="w-4 h-4" />,
      });
    }

    // Channel (from real data format)
    if (transaction.channel) {
      info.push({
        label: "Channel",
        value: transaction.channel,
        icon: <Zap className="w-4 h-4" />,
      });
    }

    // Fallback to legacy fields if new format fields are not available
    if (!transaction.senderaccount && transaction.sender) {
      info.push({
        label: "Sender",
        value: transaction.sender,
        icon: <User className="w-4 h-4" />,
      });
    }

    if (!transaction.receiveraccount && transaction.recipient) {
      info.push({
        label: "Recipient",
        value: transaction.recipient,
        icon: <User className="w-4 h-4" />,
      });
    }

    if (!transaction.sendertelephone && !transaction.receivertelephone && transaction.phoneNumber) {
      info.push({
        label: "Phone Number",
        value: transaction.phoneNumber,
        icon: <Phone className="w-4 h-4" />,
      });
    }

    if (!transaction.senderaccount && !transaction.receiveraccount && transaction.accountNumber) {
      info.push({
        label: "Account Number",
        value: transaction.accountNumber,
        icon: <CreditCard className="w-4 h-4" />,
      });
    }

    if (transaction.smartCardNumber) {
      info.push({
        label: "Smart Card Number",
        value: transaction.smartCardNumber,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon(transaction.status)}
            <span>Transaction Details</span>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
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
                      Reference Number
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                      {transaction.reference}
                    </span>
                  </div>
                  
                  {/* Transaction ID from real data format */}
                  {transaction.transactionid && transaction.transactionid !== transaction.reference && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Transaction ID
                      </span>
                      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        {transaction.transactionid}
                      </span>
                    </div>
                  )}

                  {/* Batch Number from real data format */}
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

                  {/* Posting Date from real data format */}
                  {transaction.postingdate && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-green-500" />
                        Posting Date
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(transaction.postingdate)}</span>
                    </div>
                  )}
                  
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

                  {/* Payout Currency from real data format */}
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
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Transaction Type
                    </span>
                    <div className="flex flex-col items-end space-y-1">
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
                      {/* Transaction Type from real data format */}
                      {transaction.transtype && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          Code: {transaction.transtype}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Code from real data format */}
                  {transaction.statuscode && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        HTTP Status Code
                      </span>
                      <Badge
                        className={
                          transaction.statuscode === "200" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }
                      >
                        {transaction.statuscode}
                      </Badge>
                    </div>
                  )}

                  {/* Response Code from real data format */}
                  {transaction.responsecode && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Response Code
                      </span>
                      <Badge
                        className={
                          transaction.responsecode === "000" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }
                      >
                        {transaction.responsecode}
                      </Badge>
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

                {/* Transfer Status from real data format */}
                {transaction.transferstatus && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Transfer Status
                    </span>
                    <Badge
                      className={
                        transaction.transferstatus.toLowerCase().includes("success") 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : transaction.transferstatus.toLowerCase().includes("fail")
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }
                    >
                      {transaction.transferstatus}
                    </Badge>
                  </div>
                )}

                {/* Response Message from real data format */}
                {transaction.responsemessage && (
                  <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Provider Response
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      {transaction.responsemessage}
                    </p>
                  </div>
                )}

                {/* Username from real data format */}
                {transaction.username && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      Initiated By
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{transaction.username}</span>
                  </div>
                )}

                {/* Confirmation details from real data format */}
                {transaction.confirmationcode && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmation Code
                    </span>
                    <span className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">{transaction.confirmationcode}</span>
                  </div>
                )}

                {transaction.confirmationmessage && (
                  <div className="py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Confirmation Message
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      {transaction.confirmationmessage}
                    </p>
                  </div>
                )}

                {/* Additional parameters from real data format */}
                {transaction.param1 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Service Network
                    </span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {transaction.param1}
                    </Badge>
                  </div>
                )}

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
          {(transaction.status === "failed" && transaction.errorMessage) || transaction.exceptions && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Error Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transaction.errorMessage && (
                  <p className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-3">
                    {transaction.errorMessage}
                  </p>
                )}
                {transaction.exceptions && (
                  <div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Exceptions:</span>
                    <p className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mt-1">
                      {transaction.exceptions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Transaction Metadata */}
          {(transaction.param2 || transaction.param3 || transaction.param4 || transaction.param5 || transaction.param6 || transaction.data || transaction.updatedat) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Additional Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transaction.param2 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Product ID:</span>
                    <span className="font-mono text-sm">{transaction.param2}</span>
                  </div>
                )}
                {transaction.param3 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Uniwallet Transaction ID:</span>
                    <span className="font-mono text-sm">{transaction.param3}</span>
                  </div>
                )}
                {transaction.param4 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Provider Response Code:</span>
                    <Badge
                      className={
                        transaction.param4 === "01" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      }
                    >
                      {transaction.param4}
                    </Badge>
                  </div>
                )}
                {transaction.param5 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Provider Message:</span>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {transaction.param5}
                    </p>
                  </div>
                )}
                {transaction.param6 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Additional Info:</span>
                    <span className="text-sm">{transaction.param6}</span>
                  </div>
                )}
                {transaction.data && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Transaction Data:</span>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {transaction.data}
                    </p>
                  </div>
                )}
                {transaction.updatedat && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Last Updated:
                    </span>
                    <span className="text-sm">{new Date(transaction.updatedat).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Request and Response Bodies */}
          <Tabs defaultValue="request" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="request">Request Payload</TabsTrigger>
              <TabsTrigger value="response">Response Payload</TabsTrigger>
              <TabsTrigger value="callback">Callback Data</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Payload</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                      <code className="language-json whitespace-pre-wrap">
                        {(() => {
                          // Try to use the real data format first
                          if (transaction.requestpayload) {
                            try {
                              return formatJsonWithSyntaxHighlighting(
                                JSON.parse(transaction.requestpayload)
                              );
                            } catch {
                              return transaction.requestpayload;
                            }
                          }
                          // Fallback to the mock data format
                          else if (transaction.requestBody) {
                            return formatJsonWithSyntaxHighlighting(
                              transaction.requestBody
                            );
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
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                      <code className="language-json whitespace-pre-wrap">
                        {(() => {
                          // Try to use the real data format first
                          if (transaction.responsepayload) {
                            try {
                              return formatJsonWithSyntaxHighlighting(
                                JSON.parse(transaction.responsepayload)
                              );
                            } catch {
                              return transaction.responsepayload;
                            }
                          }
                          // Fallback to the mock data format
                          else if (transaction.responseBody) {
                            return formatJsonWithSyntaxHighlighting(
                              transaction.responseBody
                            );
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
                  <CardTitle className="text-lg">Callback Data</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Final callback response from the service provider
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                      <code className="language-json whitespace-pre-wrap">
                        {(() => {
                          if (transaction.callback) {
                            try {
                              return formatJsonWithSyntaxHighlighting(
                                JSON.parse(transaction.callback)
                              );
                            } catch {
                              return transaction.callback;
                            }
                          }
                          return "No callback data available";
                        })()}
                      </code>
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
