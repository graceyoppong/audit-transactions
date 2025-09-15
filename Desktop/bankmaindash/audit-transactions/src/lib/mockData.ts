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
  
  // New fields to match database structure
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
  transtype?: string;
  confirmationcode?: string;
  confirmationmessage?: string;
  transferstatus?: string;
  channel?: string;
  username?: string;
  param1?: string;
  param2?: string;
  param3?: string;
  param4?: string;
  param5?: string;
  param6?: string;
  narration?: string;
  data?: string;
  responsecode?: string;
  responsemessage?: string;
  callback?: string;
  updatedAt?: string;
  updatedat?: string;
  requestpayload?: string;
  responsepayload?: string;
  exceptions?: string;
}

// Generate dates for the last 90 days
const generateDateRange = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

const dateRange = generateDateRange();

// Helper function to generate random transactions
const generateRandomTransactions = (
  serviceType: string,
  count: number
): Transaction[] => {
  const transactions: Transaction[] = [];
  const statuses: ("completed" | "pending" | "failed")[] = [
    "completed",
    "completed",
    "completed",
    "completed",
    "pending",
    "failed",
  ];
  const types: ("credit" | "debit")[] =
    serviceType === "wallet-to-acc" ? ["credit"] : ["debit"];

  const phoneNumbers = [
    "0241234567",
    "0551234567",
    "0201234567",
    "0261234567",
    "0271234567",
    "0501234567",
    "0531234567",
  ];
  const accountNumbers = [
    "ACC-2024-001",
    "ACC-2024-002",
    "ACC-2024-003",
    "ACC-2024-004",
    "ACC-2024-005",
    "ACC-2024-006",
  ];
  const meterNumbers = [
    "MTR001234567",
    "MTR001234568",
    "MTR001234569",
    "MTR001234570",
    "MTR001234571",
  ];
  const smartCardNumbers = [
    "0123456789",
    "0987654321",
    "1122334455",
    "5566778899",
    "9988776655",
  ];

  const errorMessages = [
    "Network timeout - please try again",
    "Invalid account number provided",
    "Insufficient funds in source account",
    "Service temporarily unavailable",
    "Invalid phone number format",
    "Transaction limit exceeded",
    "Account temporarily blocked",
  ];

  for (let i = 0; i < count; i++) {
    const randomDate = dateRange[Math.floor(Math.random() * dateRange.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomPhone =
      phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
    const randomAccount =
      accountNumbers[Math.floor(Math.random() * accountNumbers.length)];
    const randomMeter =
      meterNumbers[Math.floor(Math.random() * meterNumbers.length)];
    const randomSmartCard =
      smartCardNumbers[Math.floor(Math.random() * smartCardNumbers.length)];
    const processingTime = Math.floor(Math.random() * 3000 + 500); // 500-3500ms

    let transaction: Transaction;

    switch (serviceType) {
      case "acc-to-wallet":
        const atwAmount = Math.round((Math.random() * 2000 + 50) * 100) / 100;
        const atwRef = `ATW${String(i + 1000).padStart(6, "0")}`;
        transaction = {
          id: `atw-${i + 1000}`,
          date: randomDate,
          amount: atwAmount,
          status: randomStatus,
          reference: atwRef,
          description: "Funds transferred from account to mobile wallet",
          type: "debit",
          sender: randomAccount,
          recipient: randomPhone,
          accountNumber: randomAccount,
          requestBody: {
            source_account: randomAccount,
            destination_phone: randomPhone,
            amount: atwAmount,
            currency: "GHS",
            reference: atwRef,
            narration: "Account to wallet transfer",
          },
          responseBody:
            randomStatus === "failed"
              ? {
                  status: "failed",
                  transaction_id: atwRef,
                  reference: atwRef,
                  error_code: "TRANSACTION_FAILED",
                  message:
                    errorMessages[
                      Math.floor(Math.random() * errorMessages.length)
                    ],
                  timestamp: randomDate,
                }
              : randomStatus === "pending"
              ? {
                  status: "pending",
                  transaction_id: atwRef,
                  reference: atwRef,
                  message: "Transaction is being processed",
                  timestamp: randomDate,
                }
              : {
                  status: "success",
                  transaction_id: atwRef,
                  reference: atwRef,
                  message: "Transfer completed successfully",
                  balance:
                    Math.round((Math.random() * 5000 + 1000) * 100) / 100,
                  timestamp: randomDate,
                },
          errorMessage:
            randomStatus === "failed"
              ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
              : undefined,
          processingTime: randomStatus === "pending" ? 0 : processingTime,
        };
        break;
      case "wallet-to-acc":
        const wtaAmount = Math.round((Math.random() * 1500 + 100) * 100) / 100;
        const wtaRef = `WTA${String(i + 1000).padStart(6, "0")}`;
        transaction = {
          id: `wta-${i + 1000}`,
          date: randomDate,
          amount: wtaAmount,
          status: randomStatus,
          reference: wtaRef,
          description: "Funds transferred from mobile wallet to account",
          type: "credit",
          sender: randomPhone,
          recipient: randomAccount,
          accountNumber: randomAccount,
          requestBody: {
            source_phone: randomPhone,
            destination_account: randomAccount,
            amount: wtaAmount,
            currency: "GHS",
            reference: wtaRef,
            narration: "Wallet to account transfer",
          },
          responseBody:
            randomStatus === "failed"
              ? {
                  status: "failed",
                  transaction_id: wtaRef,
                  reference: wtaRef,
                  error_code: "TRANSACTION_FAILED",
                  message:
                    errorMessages[
                      Math.floor(Math.random() * errorMessages.length)
                    ],
                  timestamp: randomDate,
                }
              : randomStatus === "pending"
              ? {
                  status: "pending",
                  transaction_id: wtaRef,
                  reference: wtaRef,
                  message: "Transaction is being processed",
                  timestamp: randomDate,
                }
              : {
                  status: "success",
                  transaction_id: wtaRef,
                  reference: wtaRef,
                  message: "Transfer completed successfully",
                  balance:
                    Math.round((Math.random() * 5000 + 1000) * 100) / 100,
                  timestamp: randomDate,
                },
          errorMessage:
            randomStatus === "failed"
              ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
              : undefined,
          processingTime: randomStatus === "pending" ? 0 : processingTime,
        };
        break;
      case "airtime":
        const airAmount = Math.round((Math.random() * 50 + 5) * 100) / 100;
        const airRef = `AIR${String(i + 1000).padStart(6, "0")}`;
        transaction = {
          id: `air-${i + 1000}`,
          date: randomDate,
          amount: airAmount,
          status: randomStatus,
          reference: airRef,
          description: "Airtime purchase for mobile number",
          type: "debit",
          phoneNumber: randomPhone,
          accountNumber: randomAccount,
          requestBody: {
            phone_number: randomPhone,
            amount: airAmount,
            currency: "GHS",
            reference: airRef,
            account_number: randomAccount,
            service_provider: "MTN",
          },
          responseBody:
            randomStatus === "failed"
              ? {
                  status: "failed",
                  transaction_id: airRef,
                  reference: airRef,
                  error_code: "AIRTIME_FAILED",
                  message:
                    errorMessages[
                      Math.floor(Math.random() * errorMessages.length)
                    ],
                  timestamp: randomDate,
                }
              : randomStatus === "pending"
              ? {
                  status: "pending",
                  transaction_id: airRef,
                  reference: airRef,
                  message: "Airtime purchase is being processed",
                  timestamp: randomDate,
                }
              : {
                  status: "success",
                  transaction_id: airRef,
                  reference: airRef,
                  message: "Airtime purchased successfully",
                  phone_number: randomPhone,
                  airtime_amount: airAmount,
                  timestamp: randomDate,
                },
          errorMessage:
            randomStatus === "failed"
              ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
              : undefined,
          processingTime: randomStatus === "pending" ? 0 : processingTime,
        };
        break;
      case "multichoice":
        const packages = [
          { name: "DStv Premium", amount: 220 },
          { name: "DStv Compact Plus", amount: 140 },
          { name: "DStv Compact", amount: 89 },
          { name: "DStv Family", amount: 65 },
          { name: "GOtv Supa Plus", amount: 45 },
          { name: "GOtv Supa", amount: 35 },
          { name: "GOtv Plus", amount: 25 },
        ];
        const randomPackage =
          packages[Math.floor(Math.random() * packages.length)];
        const dtvRef = `DTV${String(i + 1000).padStart(6, "0")}`;
        transaction = {
          id: `dtv-${i + 1000}`,
          date: randomDate,
          amount: randomPackage.amount,
          status: randomStatus,
          reference: dtvRef,
          description: `${randomPackage.name} subscription payment`,
          type: "debit",
          smartCardNumber: randomSmartCard,
          accountNumber: randomAccount,
          requestBody: {
            smart_card_number: randomSmartCard,
            package: randomPackage.name,
            amount: randomPackage.amount,
            currency: "GHS",
            reference: dtvRef,
            account_number: randomAccount,
          },
          responseBody:
            randomStatus === "failed"
              ? {
                  status: "failed",
                  transaction_id: dtvRef,
                  reference: dtvRef,
                  error_code: "SUBSCRIPTION_FAILED",
                  message:
                    errorMessages[
                      Math.floor(Math.random() * errorMessages.length)
                    ],
                  timestamp: randomDate,
                }
              : randomStatus === "pending"
              ? {
                  status: "pending",
                  transaction_id: dtvRef,
                  reference: dtvRef,
                  message: "Subscription payment is being processed",
                  timestamp: randomDate,
                }
              : {
                  status: "success",
                  transaction_id: dtvRef,
                  reference: dtvRef,
                  message: "Subscription payment completed successfully",
                  smart_card_number: randomSmartCard,
                  package: randomPackage.name,
                  expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  timestamp: randomDate,
                },
          errorMessage:
            randomStatus === "failed"
              ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
              : undefined,
          processingTime: randomStatus === "pending" ? 0 : processingTime,
        };
        break;
      case "ecg":
        const ecgAmount = Math.round((Math.random() * 150 + 20) * 100) / 100;
        const ecgRef = `ECG${String(i + 1000).padStart(6, "0")}`;
        transaction = {
          id: `ecg-${i + 1000}`,
          date: randomDate,
          amount: ecgAmount,
          status: randomStatus,
          reference: ecgRef,
          description: "Electricity bill payment",
          type: "debit",
          meterNumber: randomMeter,
          accountNumber: randomAccount,
          requestBody: {
            meter_number: randomMeter,
            amount: ecgAmount,
            currency: "GHS",
            reference: ecgRef,
            account_number: randomAccount,
            bill_type: "prepaid",
          },
          responseBody:
            randomStatus === "failed"
              ? {
                  status: "failed",
                  transaction_id: ecgRef,
                  reference: ecgRef,
                  error_code: "BILL_PAYMENT_FAILED",
                  message:
                    errorMessages[
                      Math.floor(Math.random() * errorMessages.length)
                    ],
                  timestamp: randomDate,
                }
              : randomStatus === "pending"
              ? {
                  status: "pending",
                  transaction_id: ecgRef,
                  reference: ecgRef,
                  message: "Bill payment is being processed",
                  timestamp: randomDate,
                }
              : {
                  status: "success",
                  transaction_id: ecgRef,
                  reference: ecgRef,
                  message: "Electricity bill payment completed successfully",
                  meter_number: randomMeter,
                  units_purchased: Math.round(ecgAmount * 0.8 * 100) / 100,
                  token: Math.random()
                    .toString(36)
                    .substring(2, 15)
                    .toUpperCase(),
                  timestamp: randomDate,
                },
          errorMessage:
            randomStatus === "failed"
              ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
              : undefined,
          processingTime: randomStatus === "pending" ? 0 : processingTime,
        };
        break;
      case "water":
        const waterAmount = Math.round((Math.random() * 80 + 15) * 100) / 100;
        const waterRef = `GWC${String(i + 1000).padStart(6, "0")}`;
        transaction = {
          id: `gwc-${i + 1000}`,
          date: randomDate,
          amount: waterAmount,
          status: randomStatus,
          reference: waterRef,
          description: "Water bill payment",
          type: "debit",
          meterNumber: randomMeter,
          accountNumber: randomAccount,
          requestBody: {
            meter_number: randomMeter,
            amount: waterAmount,
            currency: "GHS",
            reference: waterRef,
            account_number: randomAccount,
            bill_type: "prepaid",
          },
          responseBody:
            randomStatus === "failed"
              ? {
                  status: "failed",
                  transaction_id: waterRef,
                  reference: waterRef,
                  error_code: "BILL_PAYMENT_FAILED",
                  message:
                    errorMessages[
                      Math.floor(Math.random() * errorMessages.length)
                    ],
                  timestamp: randomDate,
                }
              : randomStatus === "pending"
              ? {
                  status: "pending",
                  transaction_id: waterRef,
                  reference: waterRef,
                  message: "Bill payment is being processed",
                  timestamp: randomDate,
                }
              : {
                  status: "success",
                  transaction_id: waterRef,
                  reference: waterRef,
                  message: "Water bill payment completed successfully",
                  meter_number: randomMeter,
                  units_purchased: Math.round(waterAmount * 1.2 * 100) / 100,
                  token: Math.random()
                    .toString(36)
                    .substring(2, 15)
                    .toUpperCase(),
                  timestamp: randomDate,
                },
          errorMessage:
            randomStatus === "failed"
              ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
              : undefined,
          processingTime: randomStatus === "pending" ? 0 : processingTime,
        };
        break;
      default:
        const genAmount = Math.round((Math.random() * 500 + 10) * 100) / 100;
        const genRef = `GEN${String(i + 1000).padStart(6, "0")}`;
        transaction = {
          id: `gen-${i + 1000}`,
          date: randomDate,
          amount: genAmount,
          status: randomStatus,
          reference: genRef,
          description: "General transaction",
          type: randomType,
          accountNumber: randomAccount,
          requestBody: {
            account_number: randomAccount,
            amount: genAmount,
            currency: "GHS",
            reference: genRef,
            transaction_type: randomType,
          },
          responseBody:
            randomStatus === "failed"
              ? {
                  status: "failed",
                  transaction_id: genRef,
                  reference: genRef,
                  error_code: "TRANSACTION_FAILED",
                  message:
                    errorMessages[
                      Math.floor(Math.random() * errorMessages.length)
                    ],
                  timestamp: randomDate,
                }
              : randomStatus === "pending"
              ? {
                  status: "pending",
                  transaction_id: genRef,
                  reference: genRef,
                  message: "Transaction is being processed",
                  timestamp: randomDate,
                }
              : {
                  status: "success",
                  transaction_id: genRef,
                  reference: genRef,
                  message: "Transaction completed successfully",
                  balance:
                    Math.round((Math.random() * 5000 + 1000) * 100) / 100,
                  timestamp: randomDate,
                },
          errorMessage:
            randomStatus === "failed"
              ? errorMessages[Math.floor(Math.random() * errorMessages.length)]
              : undefined,
          processingTime: randomStatus === "pending" ? 0 : processingTime,
        };
    }

    transactions.push(transaction);
  }

  return transactions;
};

export const mockTransactions: Record<string, Transaction[]> = {
  "acc-to-wallet": [
    // Original transactions
    {
      id: "1",
      date: dateRange[0],
      amount: 500.0,
      status: "completed",
      reference: "ATW001234",
      description: "Funds transferred from account to mobile wallet",
      type: "debit",
      sender: "ACC-2024-001",
      recipient: "0241234567",
      accountNumber: "ACC-2024-001",
      requestBody: {
        source_account: "ACC-2024-001",
        destination_phone: "0241234567",
        amount: 500.0,
        currency: "GHS",
        reference: "ATW001234",
        narration: "Account to wallet transfer",
      },
      responseBody: {
        status: "success",
        transaction_id: "ATW001234",
        reference: "ATW001234",
        message: "Transfer completed successfully",
        balance: 2500.0,
        timestamp: dateRange[0],
      },
      processingTime: 1250,
    },
    {
      id: "2",
      date: dateRange[2],
      amount: 250.0,
      status: "completed",
      reference: "ATW001235",
      description: "Funds transferred from account to mobile wallet",
      type: "debit",
      sender: "ACC-2024-002",
      recipient: "0551234567",
      accountNumber: "ACC-2024-002",
      requestBody: {
        source_account: "ACC-2024-002",
        destination_phone: "0551234567",
        amount: 250.0,
        currency: "GHS",
        reference: "ATW001235",
        narration: "Account to wallet transfer",
      },
      responseBody: {
        status: "success",
        transaction_id: "ATW001235",
        reference: "ATW001235",
        message: "Transfer completed successfully",
        balance: 1750.0,
        timestamp: dateRange[2],
      },
      processingTime: 980,
    },
    // Add many more generated transactions
    ...generateRandomTransactions("acc-to-wallet", 150),
  ],
  "wallet-to-acc": [
    // Original transactions
    {
      id: "5",
      date: dateRange[1],
      amount: 300.0,
      status: "completed",
      reference: "WTA001234",
      description: "Funds transferred from mobile wallet to account",
      type: "credit",
      sender: "0241234567",
      recipient: "ACC-2024-001",
      accountNumber: "ACC-2024-001",
    },
    {
      id: "6",
      date: dateRange[4],
      amount: 750.0,
      status: "completed",
      reference: "WTA001235",
      description: "Funds transferred from mobile wallet to account",
      type: "credit",
      sender: "0551234567",
      recipient: "ACC-2024-002",
      accountNumber: "ACC-2024-002",
    },
    // Add many more generated transactions
    ...generateRandomTransactions("wallet-to-acc", 120),
  ],
  airtime: [
    // Original transactions
    {
      id: "8",
      date: dateRange[0],
      amount: 20.0,
      status: "completed",
      reference: "AIR001234",
      description: "Airtime purchase for mobile number",
      type: "debit",
      phoneNumber: "0241234567",
      accountNumber: "ACC-2024-001",
    },
    {
      id: "9",
      date: dateRange[3],
      amount: 10.0,
      status: "completed",
      reference: "AIR001235",
      description: "Airtime purchase for mobile number",
      type: "debit",
      phoneNumber: "0551234567",
      accountNumber: "ACC-2024-002",
    },
    // Add many more generated transactions
    ...generateRandomTransactions("airtime", 200),
  ],
  multichoice: [
    // Original transactions
    {
      id: "11",
      date: dateRange[2],
      amount: 89.0,
      status: "completed",
      reference: "DTV001234",
      description: "DStv subscription payment",
      type: "debit",
      smartCardNumber: "0123456789",
      accountNumber: "ACC-2024-001",
    },
    {
      id: "12",
      date: dateRange[25],
      amount: 89.0,
      status: "completed",
      reference: "DTV001235",
      description: "DStv subscription payment",
      type: "debit",
      smartCardNumber: "0987654321",
      accountNumber: "ACC-2024-002",
    },
    // Add many more generated transactions
    ...generateRandomTransactions("multichoice", 80),
  ],
  ecg: [
    // Original transactions
    {
      id: "14",
      date: dateRange[1],
      amount: 45.5,
      status: "completed",
      reference: "ECG001234",
      description: "Electricity bill payment",
      type: "debit",
      meterNumber: "MTR001234567",
      accountNumber: "ACC-2024-001",
    },
    {
      id: "15",
      date: dateRange[28],
      amount: 52.3,
      status: "completed",
      reference: "ECG001235",
      description: "Electricity bill payment",
      type: "debit",
      meterNumber: "MTR001234568",
      accountNumber: "ACC-2024-002",
    },
    // Add many more generated transactions
    ...generateRandomTransactions("ecg", 90),
  ],
  water: [
    // Original transactions
    {
      id: "17",
      date: dateRange[3],
      amount: 25.75,
      status: "completed",
      reference: "GWC001234",
      description: "Water bill payment",
      type: "debit",
      meterNumber: "WTR001234567",
      accountNumber: "ACC-2024-001",
    },
    {
      id: "18",
      date: dateRange[27],
      amount: 28.9,
      status: "completed",
      reference: "GWC001235",
      description: "Water bill payment",
      type: "debit",
      meterNumber: "WTR001234568",
      accountNumber: "ACC-2024-002",
    },
    // Add many more generated transactions
    ...generateRandomTransactions("water", 75),
  ],
};

export const cardData = [
  {
    id: "acc-to-wallet",
    title: "Account to Wallet",
    icon: "💳",
    description: "Funds transferred from account to mobile wallet",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "wallet-to-acc",
    title: "Wallet to Account",
    icon: "📱",
    description: "Funds transferred from mobile wallet to account",
    color: "from-green-500 to-green-600",
  },
  {
    id: "airtime",
    title: "Airtime Purchase",
    icon: "📞",
    description: "Airtime purchase for mobile numbers",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "multichoice",
    title: "MultiChoice Ghana",
    icon: "📺",
    description: "DStv and GOtv subscription payments",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "ecg",
    title: "ECG",
    icon: "⚡",
    description: "Electricity bill payments",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "water",
    title: "Ghana Water",
    icon: "💧",
    description: "Water bill payments",
    color: "from-cyan-500 to-cyan-600",
  },
];
