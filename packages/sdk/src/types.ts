/**
 * Dodo Checkout SDK Types
 */

export type CheckoutTheme = 'light';

export interface CheckoutSuccessPayload {
  sessionId: string;
  paymentId: string;
  productId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  cardBrand?: string;
  last4?: string;
  timestamp: string;
}

export type CheckoutCloseReason =
  | 'user_dismissed'
  | 'completed'
  | 'escape_key'
  | 'programmatic'
  | 'error_abort';

export interface CheckoutClosePayload {
  reason: CheckoutCloseReason;
  sessionId?: string;
}

export type CheckoutErrorCode =
  | 'INITIALIZATION_FAILED'
  | 'FRAME_LOAD_TIMEOUT'
  | 'INVALID_PRODUCT'
  | 'NETWORK_ERROR'
  | 'CARD_DECLINED'
  | 'PAYMENT_FAILED'
  | 'SECURITY_VIOLATION'
  | 'UNKNOWN_ERROR';

export interface CheckoutErrorPayload {
  code: CheckoutErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface CheckoutOptions {
  /**
   * Product ID or Plan identifier
   */
  productId: string;

  /**
   * Merchant product name (optional)
   */
  productName?: string;

  /**
   * Amount in paise/smallest currency unit (e.g. 149900 for ₹1,499.00)
   */
  amount?: number;

  /**
   * Three-letter ISO currency code (default: 'INR')
   */
  currency?: string;

  /**
   * Pre-fill customer email if already authenticated on merchant site
   */
  customerEmail?: string;

  /**
   * Theme mode: 'dark' (default), 'light', or 'auto' (system preference)
   */
  theme?: CheckoutTheme;

  /**
   * URL of the hosted checkout app.
   * Defaults to window.DODO_CHECKOUT_URL or http://localhost:5174 in dev.
   */
  checkoutUrl?: string;

  /**
   * Custom metadata to attach to the checkout session
   */
  metadata?: Record<string, string>;

  /**
   * Fired when the payment succeeds and checkout is confirmed
   */
  onSuccess?: (payload: CheckoutSuccessPayload) => void;

  /**
   * Fired when the checkout modal is closed
   */
  onClose?: (payload: CheckoutClosePayload) => void;

  /**
   * Fired when an unrecoverable error occurs or modal fails to mount
   */
  onError?: (payload: CheckoutErrorPayload) => void;

  /**
   * Optional callback when checkout iframe is loaded and ready
   */
  onReady?: () => void;
}

export interface CheckoutInstance {
  /**
   * Unique session ID generated for this checkout invocation
   */
  readonly sessionId: string;

  /**
   * Programmatically close the checkout modal
   */
  close: (reason?: CheckoutCloseReason) => void;

  /**
   * Check if the checkout modal is currently open and visible
   */
  isOpen: () => boolean;
}
