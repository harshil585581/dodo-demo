import React, { useEffect, useState } from 'react';
import { renderBrandIcon } from './CardIcons';
import { CardBrand } from '../types';

interface SuccessViewProps {
  paymentId: string;
  sessionId: string;
  brand: CardBrand;
  last4: string;
  onDone: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  paymentId,
  sessionId,
  brand,
  last4,
  onDone,
}) => {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <div className="success-card">
      <div className="success-icon-wrapper">
        <svg className="success-checkmark" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="success-title">Payment Successful!</h2>
      <p className="success-subtitle">
        Your transaction has been securely processed. A receipt has been sent to your email.
      </p>

      <div className="receipt-details">
        <div className="receipt-row">
          <span className="label">Session ID</span>
          <span className="val">{sessionId.slice(0, 18)}...</span>
        </div>
        <div className="receipt-row">
          <span className="label">Payment ID</span>
          <span className="val">{paymentId.slice(0, 18)}...</span>
        </div>
        <div className="receipt-row">
          <span className="label">Card Charged</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {renderBrandIcon(brand, 'w-5 h-3')}
            <span className="val">•••• {last4 || '4242'}</span>
          </div>
        </div>
        <div className="receipt-row">
          <span className="label">Status</span>
          <span className="val" style={{ color: '#10b981' }}>Confirmed</span>
        </div>
      </div>

      <button className="pay-btn" style={{ width: '100%' }} onClick={onDone}>
        Done ({countdown}s)
      </button>
    </div>
  );
};
