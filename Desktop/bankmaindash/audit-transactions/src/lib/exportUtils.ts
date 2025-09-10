import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Transaction } from "./mockData";

export interface ExportOptions {
  filename?: string;
  title?: string;
  serviceType?: string;
}

// Helper function to get service-specific columns
const getServiceColumns = (serviceType?: string) => {
  const baseColumns = [
    "Date",
    "Description",
    "Reference",
    "Amount",
    "Type",
    "Status",
  ];

  switch (serviceType) {
    case "acc-to-wallet":
    case "wallet-to-acc":
      return [
        ...baseColumns.slice(0, 3),
        "Sender",
        "Recipient",
        "Account Number",
        ...baseColumns.slice(3),
      ];
    case "airtime":
      return [
        ...baseColumns.slice(0, 3),
        "Phone Number",
        "Account Number",
        ...baseColumns.slice(3),
      ];
    case "ecg":
    case "water":
      return [
        ...baseColumns.slice(0, 3),
        "Meter Number",
        "Account Number",
        ...baseColumns.slice(3),
      ];
    case "multichoice":
      return [
        ...baseColumns.slice(0, 3),
        "Smart Card Number",
        "Account Number",
        ...baseColumns.slice(3),
      ];
    default:
      return [
        ...baseColumns.slice(0, 3),
        "Account Number",
        ...baseColumns.slice(3),
      ];
  }
};

// Helper function to get service-specific row data
const getRowData = (
  transaction: Transaction,
  serviceType?: string
): (string | number)[] => {
  const baseData = [
    new Date(transaction.date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    transaction.description,
    transaction.reference,
  ];

  const endData = [
    `GH₵ ${transaction.amount.toFixed(2)}`,
    transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
    transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
  ];

  switch (serviceType) {
    case "acc-to-wallet":
    case "wallet-to-acc":
      return [
        ...baseData,
        transaction.sender || "-",
        transaction.recipient || "-",
        transaction.accountNumber || "-",
        ...endData,
      ];
    case "airtime":
      return [
        ...baseData,
        transaction.phoneNumber || "-",
        transaction.accountNumber || "-",
        ...endData,
      ];
    case "ecg":
    case "water":
      return [
        ...baseData,
        transaction.meterNumber || "-",
        transaction.accountNumber || "-",
        ...endData,
      ];
    case "multichoice":
      return [
        ...baseData,
        transaction.smartCardNumber || "-",
        transaction.accountNumber || "-",
        ...endData,
      ];
    default:
      return [...baseData, transaction.accountNumber || "-", ...endData];
  }
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

  // Create new PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.setTextColor(51, 51, 51);
  doc.text(title, 20, 25);

  // Add metadata
  doc.setFontSize(12);
  doc.setTextColor(102, 102, 102);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB")}`, 20, 35);
  doc.text(`Total Transactions: ${transactions.length}`, 20, 42);

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  doc.text(`Total Amount: GH₵ ${totalAmount.toFixed(2)}`, 20, 49);

  // Prepare table data
  const columns = getServiceColumns(serviceType);
  const rows = transactions.map((transaction) =>
    getRowData(transaction, serviceType)
  );

  // Add table
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 60,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Blue color
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Light gray
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 45 }, // Description
      2: { cellWidth: 30 }, // Reference
    },
    margin: { top: 60, left: 20, right: 20 },
    theme: "striped",
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

  // Prepare data
  const columns = getServiceColumns(serviceType);
  const rows = transactions.map((transaction) =>
    getRowData(transaction, serviceType)
  );

  // Create worksheet data
  const wsData = [
    [title],
    [`Generated on: ${new Date().toLocaleDateString("en-GB")}`],
    [`Total Transactions: ${transactions.length}`],
    [
      `Total Amount: GH₵ ${transactions
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)}`,
    ],
    [], // Empty row
    columns, // Headers
    ...rows, // Data rows
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style the header row
  const headerRowIndex = 5; // 0-based index
  for (let col = 0; col < columns.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
    if (!ws[cellAddress]) continue;

    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3B82F6" } },
      alignment: { horizontal: "center" },
    };
  }

  // Set column widths
  const columnWidths = columns.map((col, index) => {
    switch (index) {
      case 0:
        return { wch: 12 }; // Date
      case 1:
        return { wch: 40 }; // Description
      case 2:
        return { wch: 20 }; // Reference
      case columns.length - 3:
        return { wch: 15 }; // Amount
      case columns.length - 2:
        return { wch: 10 }; // Type
      case columns.length - 1:
        return { wch: 12 }; // Status
      default:
        return { wch: 20 }; // Other columns
    }
  });
  ws["!cols"] = columnWidths;

  // Style the title
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: "left" },
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // Generate buffer and save
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, filename);
};

// Export function for CSV (bonus)
export const exportToCSV = (
  transactions: Transaction[],
  options: ExportOptions = {}
) => {
  const { filename = "transactions.csv", serviceType } = options;

  const columns = getServiceColumns(serviceType);
  const rows = transactions.map((transaction) =>
    getRowData(transaction, serviceType)
  );

  // Create CSV content
  const csvContent = [
    columns.join(","),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
        )
        .join(",")
    ),
  ].join("\n");

  // Create and save file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};
