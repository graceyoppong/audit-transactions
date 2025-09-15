export interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  reference: string;
  description: string;
  type: "credit" | "debit";
  sender?: string;
  recipient?: string;
  accountNumber?: string;
  meterNumber?: string;
  phoneNumber?: string;
  smartCardNumber?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  errorMessage?: string;
  processingTime?: number; // in milliseconds
  
  // Service identification
  serviceId?: string;
  serviceName?: string;
  serviceTitle?: string;
  
  // Database specific fields for status checking
  transactionid?: string;
  batchnumber?: string;
  senderaccount?: string;
  receiveraccount?: string;
  sendertelephone?: string;
  receivertelephone?: string;
  currency?: string;
  payoutcurrency?: string;
  statuscode?: string;
  receivername?: string;
  customernumber?: string;
  customername?: string;
  postingdate?: string;
  transtype?: string; // 'AM', 'MA', etc.
  confirmationcode?: string;
  confirmationmessage?: string;
  transferstatus?: string;
  channel?: string;
  username?: string;
  param1?: string;
  param2?: string;
  param3?: string;
  param4?: string; // Used for status determination
  param5?: string;
  param6?: string;
  narration?: string;
  data?: string;
  responsecode?: string; // Used for status determination
  responsemessage?: string;
  callback?: string;
  updatedAt?: string;
  updatedat?: string;
  requestpayload?: string;
  responsepayload?: string;
  exceptions?: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'unknown';