import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Transaction } from "./mockData";
import { getTransactionStatus as getStatusFromChecker, getTransactionDescription, getTransactionId, getTransactionBranch } from '@/components/StatusChecker';
import { formatAmount, formatDate, formatNumber } from './utils';

export interface ExportOptions {
  filename?: string;
  title?: string;
  serviceType?: string;
}

// Helper function to get UI-style columns (matching TransactionTable.tsx)
const getUIColumns = () => {
  return [
    "Transaction ID",
    "Batch No.",
    "Sender",
    "Receiver", 
    "Amount",
    "Description",
    "Branch",
    "Status",
    "Date & Time"
  ];
};

// Helper function to get UI-style row data (matching TransactionTable.tsx)
const getUIRowData = (transaction: Transaction): (string | number)[] => {
  // Helper functions matching the UI component
  const getTransactionIdDisplay = (transaction: Transaction) => {
    return getTransactionId(transaction);
  };

  const getBatchNumber = (transaction: Transaction) => {
    return transaction.batchnumber || transaction.reference || "-";
  };

  const getSenderInfo = (transaction: Transaction) => {
    return transaction.senderaccount || transaction.sender || transaction.customername || "-";
  };

  const getReceiverInfo = (transaction: Transaction) => {
    return transaction.receiveraccount || transaction.recipient || transaction.receivername || "-";
  };

  const getDescription = (transaction: Transaction) => {
    return getTransactionDescription(transaction);
  };

  const getBranch = (transaction: Transaction) => {
    return getTransactionBranch(transaction);
  };

  const getTransactionStatus = (transaction: Transaction) => {
    const checkerStatus = getStatusFromChecker(transaction);
    
    // If StatusChecker handles this transaction type, use its result
    if (checkerStatus !== 'unknown') {
      return checkerStatus === 'success' ? 'completed' : checkerStatus;
    }
    
    // Fall back to original logic for unsupported transaction types
    if (transaction.transferstatus) {
      if (transaction.transferstatus.toLowerCase().includes('success')) return 'completed';
      if (transaction.transferstatus.toLowerCase().includes('pending') || 
          transaction.transferstatus.toLowerCase().includes('processing')) return 'pending';
      return 'failed';
    }
    return transaction.status;
  };

  const formatAmountForExport = (amount: number | string) => {
    return formatAmount(amount, "GHS");
  };

  const formatDateForExport = (dateString: string) => {
    return formatDate(dateString);
  };

  return [
    getTransactionIdDisplay(transaction),
    getBatchNumber(transaction),
    getSenderInfo(transaction),
    getReceiverInfo(transaction),
    formatAmountForExport(transaction.amount),
    getDescription(transaction),
    getBranch(transaction),
    getTransactionStatus(transaction).charAt(0).toUpperCase() + getTransactionStatus(transaction).slice(1),
    formatDateForExport(transaction.postingdate || transaction.date)
  ];
};

export const exportToPDF = (
  transactions: Transaction[],
  options: ExportOptions = {}
) => {
  const {
    filename = "transactions.pdf",
    title = "Transaction Report",
    serviceType,
  } = options;

  // Calculate summary data first
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const failedCount = transactions.filter(t => t.status === 'failed').length;

  // Create new PDF document with A3 size for more space
  const doc = new jsPDF('l', 'mm', 'a3'); // 'l' for landscape, A3 size
  const pageWidth = doc.internal.pageSize.getWidth();

  // Professional Header Section
  // Main title with better styling
  doc.setFontSize(24);
  doc.setTextColor(30, 58, 138); // Professional blue
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 20, 30);

  // Subtitle line
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105); // Gray-600
  doc.setFont('helvetica', 'normal');
  doc.text('Financial Transaction Analysis & Audit Report', 20, 40);

  // Header separator line
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(2);
  doc.line(20, 45, pageWidth - 20, 45);

  // Report metadata in professional layout
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = currentDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Left column - Report details
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81); // Gray-700
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT DETAILS', 20, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99); // Gray-600
  doc.text(`Generated: ${formattedDate}`, 20, 68);
  doc.text(`Time: ${formattedTime}`, 20, 75);
  doc.text(`Service: ${serviceType ? serviceType.replace(/-/g, ' ').toUpperCase() : 'ALL SERVICES'}`, 20, 82);

  // Center column - Transaction summary
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('TRANSACTION SUMMARY', pageWidth/2 - 40, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Total Transactions: ${formatNumber(transactions.length)}`, pageWidth/2 - 40, 68);
  
  // Status breakdown with colors
  doc.setTextColor(34, 197, 94); // Green
  doc.text(`✓ Completed: ${formatNumber(completedCount)}`, pageWidth/2 - 40, 75);
  
  doc.setTextColor(251, 191, 36); // Yellow
  doc.text(`⏳ Pending: ${formatNumber(pendingCount)}`, pageWidth/2 - 40, 82);
  
  doc.setTextColor(239, 68, 68); // Red
  doc.text(`✗ Failed: ${formatNumber(failedCount)}`, pageWidth/2 - 40, 89);

  // Right column - Financial summary
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('FINANCIAL OVERVIEW', pageWidth - 120, 60);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Total Value:', pageWidth - 120, 68);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green for amount
  doc.text(formatAmount(totalAmount, "GHS"), pageWidth - 120, 77);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const avgAmount = totalAmount / transactions.length;
  doc.text(`Average: ${formatAmount(avgAmount, "GHS")}`, pageWidth - 120, 85);

  // Bottom separator line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(20, 95, pageWidth - 20, 95);

  // Prepare table data - using UI format
  const columns = getUIColumns();
  const rows = transactions.map((transaction) =>
    getUIRowData(transaction)
  );

  // Column widths optimized to fill entire A3 landscape width
  const columnStyles: { [key: number]: any } = {
    0: { cellWidth: 45, halign: 'left' }, // Transaction ID
    1: { cellWidth: 35, halign: 'left' }, // Batch No.
    2: { cellWidth: 55, halign: 'left' }, // Sender
    3: { cellWidth: 55, halign: 'left' }, // Receiver
    4: { cellWidth: 40, halign: 'right' }, // Amount
    5: { cellWidth: 70, halign: 'left' }, // Description
    6: { cellWidth: 30, halign: 'center' }, // Branch
    7: { cellWidth: 25, halign: 'center' }, // Status
    8: { cellWidth: 45, halign: 'center' }, // Date & Time
  };

  // Add table with UI-matching styling
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 105, // Moved down to accommodate larger header
    styles: {
      fontSize: 10, // Slightly larger font for A3
      cellPadding: { top: 5, right: 3, bottom: 5, left: 3 },
      lineColor: [229, 231, 235], // border-gray-200
      lineWidth: 0.5,
      textColor: [55, 65, 81], // text-gray-700
    },
    headStyles: {
      fillColor: [249, 250, 251], // bg-gray-50
      textColor: [17, 24, 39], // text-gray-900
      fontStyle: 'bold',
      fontSize: 11, // Larger header font
      cellPadding: { top: 8, right: 3, bottom: 8, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // hover:bg-gray-50
    },
    columnStyles: columnStyles,
    margin: { left: 10, right: 10 }, // Smaller margins to use more width
    theme: 'grid',
    didParseCell: function(data) {
      // Color status column exactly like UI badges
      if (data.column.index === 7 && data.section === 'body') {
        const status = data.cell.text[0]?.toLowerCase();
        if (status === 'completed') {
          data.cell.styles.fillColor = [220, 252, 231]; // bg-green-100
          data.cell.styles.textColor = [22, 101, 52]; // text-green-800
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'pending') {
          data.cell.styles.fillColor = [254, 249, 195]; // bg-yellow-100
          data.cell.styles.textColor = [146, 64, 14]; // text-yellow-800
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'failed') {
          data.cell.styles.fillColor = [254, 226, 226]; // bg-red-100
          data.cell.styles.textColor = [153, 27, 27]; // text-red-800
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Bold amounts like in UI
      if (data.column.index === 4 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [17, 24, 39]; // text-gray-900
      }
      // Monospace font for Transaction ID and Batch No like in UI
      if ((data.column.index === 0 || data.column.index === 1) && data.section === 'body') {
        data.cell.styles.font = 'courier';
        data.cell.styles.fontSize = 9; // Larger monospace font for A3
      }
    },
    didDrawPage: function(data) {
      // Simple footer
      doc.setFontSize(8);
      doc.setTextColor(108, 117, 125);
      doc.text(`Page ${(doc as any).internal.getCurrentPageInfo().pageNumber}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
    }
  });

  // Save the PDF
  doc.save(filename);
};

export const exportToExcel = (
  transactions: Transaction[],
  options: ExportOptions = {}
) => {
  const {
    filename = "transactions.xlsx",
    title = "Transaction Report",
    serviceType,
  } = options;

  // Prepare data using UI format
  const columns = getUIColumns();
  const rows = transactions.map((transaction) =>
    getUIRowData(transaction)
  );

  // Calculate summary
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const currentDate = new Date();

  // Create worksheet data
  const wsData = [
    [title],
    [`Generated: ${currentDate.toLocaleDateString('en-GB')} at ${currentDate.toLocaleTimeString('en-GB')}`],
    [`Service Type: ${serviceType ? serviceType.replace(/-/g, ' ').toUpperCase() : 'ALL SERVICES'}`],
    [`Total Transactions: ${formatNumber(transactions.length)} | Total Amount: ${formatAmount(totalAmount, "GHS")}`],
    [],
    columns, // Headers
    ...rows, // Data rows
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style the title
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "left" },
    };
  }

  // Style the header row
  const headerRowIndex = 5; // 0-based index
  for (let col = 0; col < columns.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (!ws[cellAddress]) continue;

    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      fill: { fgColor: { rgb: "343A40" } },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };
  }

  // Set column widths matching UI proportions
  const columnWidths = [
    { wch: 25 }, // Transaction ID
    { wch: 20 }, // Batch No.
    { wch: 30 }, // Sender
    { wch: 30 }, // Receiver
    { wch: 18 }, // Amount
    { wch: 40 }, // Description
    { wch: 15 }, // Branch
    { wch: 15 }, // Status
    { wch: 25 }, // Date & Time
  ];
  ws["!cols"] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // Generate and save
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, filename);
};

// Export function for CSV
export const exportToCSV = (
  transactions: Transaction[],
  options: ExportOptions = {}
) => {
  const { filename = "transactions.csv", serviceType } = options;

  const columns = getUIColumns();
  const rows = transactions.map((transaction) =>
    getUIRowData(transaction)
  );

  // Create CSV content
  const csvContent = [
    columns.join(","),
    ...rows.map((row) =>
      row
        .map((cell: string | number) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
        )
        .join(",")
    ),
  ].join("\n");

  // Create and save file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};
