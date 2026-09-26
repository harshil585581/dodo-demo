import React, { useState, useEffect, useCallback } from 'react';
import {
  CardFormData,
  PaymentStatus,
  CardBrand,
} from './types';
import { processPayment } from './utils/paymentSimulator';
import { OrderSummary } from './components/OrderSummary';
import { PaymentForm } from './components/PaymentForm';
import { SuccessView } from './components/SuccessView';
import { DodoLogo } from './components/CardIcons';
import { X, ShieldCheck, Lock } from 'lucide-react';
import './styles/checkout.css';

export const App: React.FC = () => {
  // 1. Parse initial search params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id') || `ses_${Date.now()}`;
  const productId = urlParams.get('product_id') || 'prod_default';
  const initialAmount = parseInt(urlParams.get('amount') || '4900', 10);
  const initialCurrency = urlParams.get('currency') || 'INR';
  const initialProductName = urlParams.get('product_name') || 'Pro Tier';
  const initialEmail = urlParams.get('email') || 'alex.mercer@dodo.dev';
  const initialTheme = urlParams.get('theme') || 'light';
  const hostOrigin = urlParams.get('host_origin') || '*';

  // 2. States
  const [amount, setAmount] = useState<number>(initialAmount);
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [productName, setProductName] = useState<string>(initialProductName);
  const [theme, setTheme] = useState<string>(initialTheme);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState<boolean>(false);
  const [confirmedPayment, setConfirmedPayment] = useState<{
    paymentId: string;
    brand: CardBrand;
    last4: string;
  } | null>(null);

  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expiry: '',
    cvc: '',
    email: initialEmail,
  });

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Post message helper back to parent host window
  const postToHost = useCallback(
    (message: Record<string, unknown>) => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            source: 'DODO_CHECKOUT',
            sessionId,
            ...message,
          },
          hostOrigin === '*' ? '*' : hostOrigin
        );
      }
    },
    [sessionId, hostOrigin]
  );

  // 3. Lifecycle Handshake
  useEffect(() => {
    // Notify host that checkout iframe is mounted and ready
    postToHost({
      type: 'DODO_CHECKOUT_READY',
    });

    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.source !== 'DODO_SDK' || event.data?.sessionId !== sessionId) {
        return;
      }

      if (event.data.type === 'DODO_SDK_INIT') {
        const payload = event.data.payload || {};
        if (payload.amount) setAmount(payload.amount);
        if (payload.currency) setCurrency(payload.currency);
        if (payload.productName) setProductName(payload.productName);
        if (payload.theme) setTheme(payload.theme);
        if (payload.customerEmail) {
          setFormData((prev) => ({ ...prev, email: payload.customerEmail }));
        }
      }
    };

    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, [postToHost, sessionId]);

  // 4. Close request handler
  const handleRequestClose = (reason = 'user_dismissed') => {
    postToHost({
      type: 'DODO_CHECKOUT_REQUEST_CLOSE',
      payload: { reason },
    });
  };

  // 5. Payment Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'processing') return; // prevent double clicks

    setStatus('processing');
    setErrorMessage(null);
    setIsRetryable(false);

    try {
      const result = await processPayment(formData, sessionId);

      if (result.success) {
        setStatus('success');
        setConfirmedPayment({
          paymentId: result.paymentId || `pay_${Date.now()}`,
          brand: result.brand || 'generic',
          last4: result.last4 || '4242',
        });

        // Inform Host via PostMessage
        postToHost({
          type: 'DODO_CHECKOUT_SUCCESS',
          payload: {
            sessionId,
            paymentId: result.paymentId,
            productId,
            amount,
            currency,
            customerEmail: formData.email,
            cardBrand: result.brand,
            last4: result.last4,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        if (result.isRetryable) {
          setStatus('retry_needed');
          setIsRetryable(true);
        } else {
          setStatus('declined');
          setIsRetryable(false);
        }
        setErrorMessage(result.errorMessage || 'Payment could not be completed.');

        // Inform Host of the error
        postToHost({
          type: 'DODO_CHECKOUT_ERROR',
          payload: {
            code: result.errorCode || 'PAYMENT_FAILED',
            message: result.errorMessage || 'Payment failed',
            details: { isRetryable: result.isRetryable },
          },
        });
      }
    } catch {
      setStatus('error');
      const fallbackMsg = 'An unexpected error occurred. Please try again.';
      setErrorMessage(fallbackMsg);
      postToHost({
        type: 'DODO_CHECKOUT_ERROR',
        payload: {
          code: 'UNKNOWN_ERROR',
          message: fallbackMsg,
        },
      });
    }
  };

  return (
    <div className="checkout-container">
      {/* Top Header */}
      <header className="checkout-header">
        <div className="brand-badge">
          <DodoLogo className="w-6 h-6" />
          <div>
            <div className="brand-title">Dodo Payments</div>
            <div className="brand-subtitle">Merchant of Record</div>
          </div>
        </div>

        <button
          type="button"
          className="close-btn"
          onClick={() => handleRequestClose('user_dismissed')}
          aria-label="Close checkout"
        >
          <X size={16} />
        </button>
      </header>

      {/* Body Flow */}
      {status === 'success' && confirmedPayment ? (
        <SuccessView
          paymentId={confirmedPayment.paymentId}
          sessionId={sessionId}
          brand={confirmedPayment.brand}
          last4={confirmedPayment.last4}
          onDone={() => handleRequestClose('completed')}
        />
      ) : (
        <>
          <div style={{ padding: '16px 22px 0' }}>
            <OrderSummary
              productName={productName}
              amount={amount}
              currency={currency}
              merchantOrigin={hostOrigin}
            />
          </div>

          <PaymentForm
            formData={formData}
            setFormData={setFormData}
            status={status}
            errorMessage={errorMessage}
            amount={amount}
            currency={currency}
            onSubmit={handleSubmit}
            isRetryable={isRetryable}
          />
        </>
      )}

      {/* Footer / Trust Badges */}
      <footer className="checkout-footer">
        <div className="trust-badges">
          <div className="trust-badge-item">
            <Lock size={12} color="#10b981" />
            <span>256-bit SSL</span>
          </div>
          <div className="trust-badge-item">
            <ShieldCheck size={12} color="#6366f1" />
            <span>PCI-DSS Level 1</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
