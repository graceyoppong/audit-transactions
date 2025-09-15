import React from 'react';
import { formatAmount, formatNumber, formatPercentage } from '@/lib/utils';

interface FormattedNumberProps {
  value: number | string;
  type?: 'currency' | 'number' | 'percentage';
  currency?: string;
  decimals?: number;
  className?: string;
}

/**
 * A reusable component for formatting numbers consistently across the application
 */
export const FormattedNumber: React.FC<FormattedNumberProps> = ({
  value,
  type = 'number',
  currency = 'GH₵',
  decimals = 1,
  className = '',
}) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return <span className={className}>-</span>;
  }

  let formattedValue: string;

  switch (type) {
    case 'currency':
      formattedValue = formatAmount(numValue, currency);
      break;
    case 'percentage':
      formattedValue = formatPercentage(numValue, decimals);
      break;
    case 'number':
    default:
      formattedValue = formatNumber(numValue);
      break;
  }

  return <span className={className}>{formattedValue}</span>;
};

/**
 * Convenience components for specific use cases
 */
export const FormattedCurrency: React.FC<Omit<FormattedNumberProps, 'type'>> = (props) => (
  <FormattedNumber {...props} type="currency" />
);

export const FormattedCount: React.FC<Omit<FormattedNumberProps, 'type'>> = (props) => (
  <FormattedNumber {...props} type="number" />
);

export const FormattedPercentage: React.FC<Omit<FormattedNumberProps, 'type'>> = (props) => (
  <FormattedNumber {...props} type="percentage" />
);

export default FormattedNumber;
