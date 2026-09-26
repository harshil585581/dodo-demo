/**
 * Dodo Payments Embeddable Checkout SDK
 * Plain TypeScript, zero-dependency, ultra-lightweight client script
 */

import { CheckoutOptions, CheckoutInstance } from './types';
import { CheckoutModalManager } from './modal';

export * from './types';

export class DodoCheckout {
  public static readonly version = '1.0.0';

  /**
   * Opens the secure Dodo Checkout modal overlay.
   *
   * @example
   * ```ts
   * DodoCheckout.open({
   *   productId: "prod_123",
   *   onSuccess: ({ sessionId }) => console.log('Payment succeeded!', sessionId),
   *   onClose: ({ reason }) => console.log('Closed:', reason),
   *   onError: ({ code, message }) => console.error('Error:', code, message),
   * });
   * ```
   */
  public static open(options: CheckoutOptions): CheckoutInstance {
    if (!options || !options.productId) {
      const err = {
        code: 'INITIALIZATION_FAILED' as const,
        message: 'DodoCheckout.open() requires a valid "productId" in options.',
      };
      options?.onError?.(err);
      throw new Error(`[DodoCheckout] ${err.message}`);
    }

    return CheckoutModalManager.open(options);
  }

  /**
   * Programmatically close any active checkout session
   */
  public static close(): void {
    CheckoutModalManager.closeActive('programmatic');
  }
}

// Attach to global window object for script tag consumers (<script src="..."></script>)
if (typeof window !== 'undefined') {
  (window as any).DodoCheckout = DodoCheckout;
}

export default DodoCheckout;
