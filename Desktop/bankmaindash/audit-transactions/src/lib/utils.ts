import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency amounts with proper thousand separators and decimals
 */
export function formatAmount(amount: number | string, currency: string = "GHS"): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `${currency} 0.00`;
  }
  
  const formatted = numAmount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${currency} ${formatted}`;
}

/**
 * Format large numbers with thousand separators (for counts, etc.)
 */
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numValue)) {
    return '0';
  }
  
  return numValue.toLocaleString('en-GB');
}

/**
 * Format percentages with proper decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value)) {
    return '0.0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format dates consistently across the application
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if parsing fails
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString; // Return original string if any error occurs
  }
}

/**
 * Format dates for detailed views with seconds
 */
export function formatDetailedDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString;
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
    return dateString;
  }
}
