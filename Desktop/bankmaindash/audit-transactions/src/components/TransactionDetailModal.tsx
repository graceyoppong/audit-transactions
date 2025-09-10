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
  Timer,
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
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return `GH₵ ${amount.toFixed(2)}`;
  };

  const formatProcessingTime = (time?: number) => {
    if (!time || time === 0) return "N/A";
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const renderTransactionInfo = () => {
    const info = [];

    if (transaction.sender) {
      info.push({
        label: "Sender",
        value: transaction.sender,
        icon: <User className="w-4 h-4" />,
      });
    }

    if (transaction.recipient) {
      info.push({
        label: "Recipient",
        value: transaction.recipient,
        icon: <User className="w-4 h-4" />,
      });
    }

    if (transaction.phoneNumber) {
      info.push({
        label: "Phone Number",
        value: transaction.phoneNumber,
        icon: <Phone className="w-4 h-4" />,
      });
    }

    if (transaction.accountNumber) {
      info.push({
        label: "Account Number",
        value: transaction.accountNumber,
        icon: <CreditCard className="w-4 h-4" />,
      });
    }

    if (transaction.meterNumber) {
      info.push({
        label: "Meter Number",
        value: transaction.meterNumber,
        icon: <Zap className="w-4 h-4" />,
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
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Reference:
                  </span>
                  <span className="font-mono text-sm">
                    {transaction.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Date:
                  </span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Amount:
                  </span>
                  <span className="font-semibold">
                    {formatAmount(transaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Type:
                  </span>
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
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Timer className="w-4 h-4 mr-1" />
                    Processing Time:
                  </span>
                  <span>
                    {formatProcessingTime(transaction.processingTime)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Description:
                  </span>
                  <p className="mt-1 text-sm">{transaction.description}</p>
                </div>
                <div className="space-y-2">
                  {renderTransactionInfo().map((info, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600 dark:text-gray-400 flex items-center">
                        {info.icon}
                        <span className="ml-1">{info.label}:</span>
                      </span>
                      <span className="font-mono text-sm">{info.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Message for Failed Transactions */}
          {transaction.status === "failed" && transaction.errorMessage && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Error Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {transaction.errorMessage}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Request and Response Bodies */}
          <Tabs defaultValue="request" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="request">Request Body</TabsTrigger>
              <TabsTrigger value="response">Response Body</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Payload</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                      <code className="language-json">
                        {transaction.requestBody
                          ? formatJsonWithSyntaxHighlighting(
                              transaction.requestBody
                            )
                          : "No request body available"}
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
                  <ScrollArea className="h-64">
                    <pre className="text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                      <code className="language-json">
                        {transaction.responseBody
                          ? formatJsonWithSyntaxHighlighting(
                              transaction.responseBody
                            )
                          : "No response body available"}
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
