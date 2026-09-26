import React, { useRef, useEffect } from 'react';
import { CardFormData, CardBrand, PaymentStatus } from '../types';
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  formatCvc,
  formatCurrency,
} from '../utils/cardUtils';
import { renderBrandIcon } from './CardIcons';
import { Lock, AlertCircle, RefreshCw } from 'lucide-react';

interface PaymentFormProps {
  formData: CardFormData;
  setFormData: React.Dispatch<React.SetStateAction<CardFormData>>;
  status: PaymentStatus;
  errorMessage: string | null;
  amount: number;
  currency: string;
  onSubmit: (e: React.FormEvent) => void;
  isRetryable: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  formData,
  setFormData,
  status,
  errorMessage,
  amount,
  currency,
  onSubmit,
  isRetryable,
}) => {
  const cardInputRef = useRef<HTMLInputElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const cvcInputRef = useRef<HTMLInputElement>(null);

  const brand: CardBrand = detectCardBrand(formData.cardNumber);

  // Auto-focus the first empty input
  useEffect(() => {
    if (!formData.email) {
      // let email stay focused if empty
    } else if (cardInputRef.current) {
      cardInputRef.current.focus();
    }
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));

    // Auto advance to expiry when complete
    const clean = formatted.replace(/\D/g, '');
    const maxDigits = detectCardBrand(clean) === 'amex' ? 15 : 16;
    if (clean.length === maxDigits && expiryInputRef.current) {
      expiryInputRef.current.focus();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setFormData((prev) => ({ ...prev, expiry: formatted }));

    // Auto advance to CVC when complete
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 4 && cvcInputRef.current) {
      cvcInputRef.current.focus();
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCvc(e.target.value, brand);
    setFormData((prev) => ({ ...prev, cvc: formatted }));
  };

  const fillTestCard = (cardNumber: string) => {
    setFormData((prev) => ({
      ...prev,
      cardNumber: formatCardNumber(cardNumber),
      expiry: '12 / 28',
      cvc: '123',
      cardholderName: 'Alex Mercer',
      email: prev.email || 'alex@example.com',
    }));
  };

  const isSubmitting = status === 'processing';
  const isDeclined = status === 'declined';

  return (
    <form onSubmit={onSubmit} className="checkout-body">
      {/* Error / Alert Banner */}
      {errorMessage && (
        <div
          className={`alert-banner ${isRetryable ? 'alert-warning' : 'alert-danger'} ${
            isDeclined ? 'shake-animation' : ''
          }`}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Email Input */}
      <div className="form-group">
        <label className="input-label" htmlFor="dodo-email">
          Email Address
        </label>
        <div className="input-wrapper">
          <input
            id="dodo-email"
            type="email"
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
            disabled={isSubmitting}
            autoComplete="email"
          />
        </div>
      </div>

      {/* Card Details Group */}
      <div className="form-group">
        <label className="input-label" htmlFor="dodo-card-number">
          <span>Card Details</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Encrypted</span>
        </label>
        
        {/* Card Number */}
        <div
          className={`input-wrapper ${isDeclined ? 'input-error shake-animation' : ''}`}
          style={{ marginBottom: '8px' }}
        >
          <input
            id="dodo-card-number"
            ref={cardInputRef}
            type="text"
            inputMode="numeric"
            className="mono-input"
            placeholder="4242 4242 4242 4242"
            value={formData.cardNumber}
            onChange={handleCardNumberChange}
            required
            disabled={isSubmitting}
            autoComplete="cc-number"
          />
          <div className="input-icon-right">{renderBrandIcon(brand)}</div>
        </div>

        {/* Expiry & CVC Grid */}
        <div className="input-grid-split">
          <div className="input-wrapper">
            <input
              id="dodo-expiry"
              ref={expiryInputRef}
              type="text"
              inputMode="numeric"
              className="mono-input"
              placeholder="MM / YY"
              value={formData.expiry}
              onChange={handleExpiryChange}
              required
              disabled={isSubmitting}
              autoComplete="cc-exp"
            />
          </div>

          <div className="input-wrapper">
            <input
              id="dodo-cvc"
              ref={cvcInputRef}
              type="text"
              inputMode="numeric"
              className="mono-input"
              placeholder={brand === 'amex' ? 'CVC (4)' : 'CVC (3)'}
              value={formData.cvc}
              onChange={handleCvcChange}
              required
              disabled={isSubmitting}
              autoComplete="cc-csc"
            />
            <div className="input-icon-right">
              <Lock size={14} color="var(--text-muted)" />
            </div>
          </div>
        </div>
      </div>

      {/* Test Cards Helper (Required by brief to test all 3 scenarios easily) */}
      <div className="test-cards-section">
        <div className="test-cards-header">
          <span>Test Card Scenarios</span>
          <span style={{ fontSize: '10px' }}>1-Click Auto Fill</span>
        </div>
        <div className="test-cards-grid">
          <button
            type="button"
            className="test-card-pill"
            onClick={() => fillTestCard('4242424242424242')}
            title="4242 4242 4242 4242 - Succeeds"
          >
            <span className="pill-badge pill-success">Succeeds</span>
            <span>•••• 4242</span>
          </button>

          <button
            type="button"
            className="test-card-pill"
            onClick={() => fillTestCard('4000000000000002')}
            title="4000 0000 0000 0002 - Declines"
          >
            <span className="pill-badge pill-decline">Declines</span>
            <span>•••• 0002</span>
          </button>

          <button
            type="button"
            className="test-card-pill"
            onClick={() => fillTestCard('4000000000000341')}
            title="4000 0000 0000 0341 - Fails once, then succeeds on retry"
          >
            <span className="pill-badge pill-retry">Retry Once</span>
            <span>•••• 0341</span>
          </button>
        </div>
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        className={`pay-btn ${isRetryable ? 'retry-variant' : ''}`}
        disabled={isSubmitting || !formData.cardNumber || !formData.expiry || !formData.cvc}
      >
        {isSubmitting ? (
          <>
            <div className="spin" style={{ display: 'inline-flex' }}>
              <RefreshCw size={18} />
            </div>
            <span>Authorizing Payment...</span>
          </>
        ) : isRetryable ? (
          <>
            <RefreshCw size={16} />
            <span>Retry Payment ({formatCurrency(amount, currency)})</span>
          </>
        ) : (
          <>
            <Lock size={16} />
            <span>Pay {formatCurrency(amount, currency)}</span>
          </>
        )}
      </button>
    </form>
  );
};
