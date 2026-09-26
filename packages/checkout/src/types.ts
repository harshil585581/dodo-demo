export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic';

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'declined' | 'retry_needed' | 'error';

export interface CheckoutSessionData {
  sessionId: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  customerEmail: string;
  theme: 'dark' | 'light' | 'auto';
  hostOrigin: string;
}

export interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  cvc: string;
  email: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  sessionId?: string;
  brand?: CardBrand;
  last4?: string;
  errorCode?: string;
  errorMessage?: string;
  isRetryable?: boolean;
}
