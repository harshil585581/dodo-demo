import React from 'react';
import { formatCurrency } from '../utils/cardUtils';

interface OrderSummaryProps {
  productName: string;
  amount: number;
  currency: string;
  merchantOrigin?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  productName,
  amount,
  currency,
}) => {
  return (
    <div className="order-summary-box">
      <div className="product-info">
        <span className="product-label">Total Due</span>
        <span className="product-name">{productName || 'Standard Subscription'}</span>
      </div>
      <div className="product-price">
        {formatCurrency(amount, currency)}
      </div>
    </div>
  );
};
