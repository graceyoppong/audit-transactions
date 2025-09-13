import { Transaction } from './mockData';

// Function to transform database transaction records to Transaction interface
export const transformDatabaseRecord = (dbRecord: any): Transaction => {
  return {
    id: dbRecord.transactionid || dbRecord.reference || Math.random().toString(36).substr(2, 9),
    date: dbRecord.postingdate || dbRecord.updatedat || new Date().toISOString(),
    amount: parseFloat(dbRecord.amount) || 0,
    status: getStatusFromDbRecord(dbRecord),
    reference: dbRecord.reference || dbRecord.transactionid || "",
    description: dbRecord.narration || "Transaction",
    type: dbRecord.transtype === "AM" ? "debit" : "credit", // Adjust based on your business logic
    
    // Database specific fields
    transactionid: dbRecord.transactionid,
    batchnumber: dbRecord.batchnumber,
    senderaccount: dbRecord.senderaccount,
    receiveraccount: dbRecord.receiveraccount,
    sendertelephone: dbRecord.sendertelephone,
    receivertelephone: dbRecord.receivertelephone,
    currency: dbRecord.currency,
    payoutcurrency: dbRecord.payoutcurrency,
    statuscode: dbRecord.statuscode,
    receivername: dbRecord.receivername,
    customernumber: dbRecord.customernumber,
    customername: dbRecord.customername,
    postingdate: dbRecord.postingdate,
    transtype: dbRecord.transtype,
    confirmationcode: dbRecord.confirmationcode,
    confirmationmessage: dbRecord.confirmationmessage,
    transferstatus: dbRecord.transferstatus,
    channel: dbRecord.channel,
    username: dbRecord.username,
    param1: dbRecord.param1,
    param2: dbRecord.param2,
    param3: dbRecord.param3,
    param4: dbRecord.param4,
    param5: dbRecord.param5,
    param6: dbRecord.param6,
    narration: dbRecord.narration,
    data: dbRecord.data,
    responsecode: dbRecord.responsecode,
    responsemessage: dbRecord.responsemessage,
    callback: dbRecord.callback,
    updatedAt: dbRecord.updatedAt,
    updatedat: dbRecord.updatedat,
    requestpayload: dbRecord.requestpayload,
    responsepayload: dbRecord.responsepayload,
    exceptions: dbRecord.exceptions,
  };
};

// Helper function to determine status from database record
const getStatusFromDbRecord = (dbRecord: any): "completed" | "pending" | "failed" => {
  if (dbRecord.transferstatus) {
    const status = dbRecord.transferstatus.toLowerCase();
    if (status.includes('success') || status.includes('completed')) {
      return 'completed';
    } else if (status.includes('pending') || status.includes('processing')) {
      return 'pending';
    } else {
      return 'failed';
    }
  }
  
  if (dbRecord.statuscode === "200" || dbRecord.responsecode === "000") {
    return 'completed';
  }
  
  return 'failed';
};

// Sample database record to test with
export const sampleDatabaseRecord = {
  "reference": "2025090427318",
  "senderaccount": "1081220007320111",
  "receiveraccount": "233240526629",
  "sendertelephone": "233240526629",
  "receivertelephone": "233240526629",
  "currency": "GHS",
  "amount": "15.00",
  "payoutcurrency": "GHS",
  "requestpayload": "{\r\n  \"refNo\": \"2025090427318\", \n  \"productId\": \"9a8ef494-26b5-47e7-a36b-e1e294155e61\", \n  \"transflowId\": \"899c870b-5fa4-4a67-8978-9bca55172a26\", \n  \"msisdn\": \"233240526629\",\r\n  \"network\": \"MTN\",\r\n  \"amount\": \"15\",\r\n  \"narration\": \"Account to MOMO transfer\",\r\n \r\n  \"currency\": \"GHS\"\r\n}",
  "responsepayload": "{\"responseCode\":\"200\",\"message\":\"{\\\"responseCode\\\":\\\"03\\\",\\\"responseMessage\\\":\\\"submitted for processing\\\",\\\"uniwalletTransactionId\\\":\\\"c898d1f7-a1b1-453f-a29f-eaf757011e13\\\"}\"}",
  "statuscode": "200",
  "receivername": "null",
  "exceptions": null,
  "customernumber": "000732011",
  "customername": "CHAM185381",
  "postingdate": "2025-09-04T15:57:41.515Z",
  "transtype": "AM",
  "batchnumber": "2025090427318",
  "confirmationcode": null,
  "confirmationmessage": null,
  "transferstatus": "Successfully Processed Transaction",
  "transactionid": "2025090427318",
  "channel": "MOB",
  "username": "CHAM185381",
  "param1": "MTN",
  "param2": "9a8ef494-26b5-47e7-a36b-e1e294155e61",
  "param3": "c898d1f7-a1b1-453f-a29f-eaf757011e13",
  "param4": "01",
  "param5": "Successfully Processed Transaction",
  "param6": "",
  "narration": "Account to MOMO transfer",
  "data": "{uniwalletTransactionId=c898d1f7-a1b1-453f-a29f-eaf757011e13, batchNumber=2025090427318}",
  "responsecode": "000",
  "responsemessage": "submitted for processing",
  "callback": "{\"uniwalletTransactionId\":\"c898d1f7-a1b1-453f-a29f-eaf757011e13\",\"networkTransactionId\":\"64304496248\",\"refNo\":\"2025090427318\",\"productId\":\"9a8ef494-26b5-47e7-a36b-e1e294155e61\",\"msisdn\":\"233240526629\",\"amount\":\"15.00\",\"narration\":\"Account to MOMO transfer\",\"timestamp\":\"2025-09-04 15:57:19\",\"responseCode\":\"01\",\"responseMessage\":\"Successfully Processed Transaction\",\"network\":\"MTN\",\"transflowId\":\"2942f051-2e3b-497a-8e08-3a8a502f72dd\"}",
  "updatedAt": null,
  "updatedat": "2025-09-06 16:14:35.741422055"
};

// Convert sample to Transaction object
export const sampleTransaction = transformDatabaseRecord(sampleDatabaseRecord);
