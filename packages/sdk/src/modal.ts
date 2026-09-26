/**
 * Iframe Modal Controller and DOM Lifecycle Manager
 */

import {
  CheckoutOptions,
  CheckoutCloseReason,
  CheckoutInstance,
} from './types';
import {
  InboundMessage,
  OutboundMessage,
  MESSAGE_SOURCE_SDK,
  isValidCheckoutMessage,
} from './protocol';
import { ensureStylesInjected } from './styles';

const DEFAULT_CHECKOUT_URL =
  typeof window !== 'undefined' && (window as any).DODO_CHECKOUT_URL
    ? (window as any).DODO_CHECKOUT_URL
    : 'http://localhost:5174';

const LOAD_TIMEOUT_MS = 8000;

export class CheckoutModalManager {
  private static activeInstance: CheckoutModalManager | null = null;

  public readonly sessionId: string;
  private options: CheckoutOptions;
  private checkoutOrigin: string;
  private backdropEl: HTMLElement | null = null;
  private containerEl: HTMLElement | null = null;
  private iframeEl: HTMLIFrameElement | null = null;
  private spinnerEl: HTMLElement | null = null;
  private loadTimeoutTimer: number | null = null;
  private isClosed = false;
  private isReady = false;

  constructor(options: CheckoutOptions) {
    this.sessionId = `dodo_ses_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    this.options = options;

    const baseCheckoutUrl = options.checkoutUrl || DEFAULT_CHECKOUT_URL;
    try {
      const urlObj = new URL(baseCheckoutUrl, window.location.origin);
      this.checkoutOrigin = urlObj.origin;
    } catch {
      this.checkoutOrigin = '*';
    }
  }

  public static open(options: CheckoutOptions): CheckoutInstance {
    // Prevent duplicate checkout overlays
    if (CheckoutModalManager.activeInstance) {
      console.warn('[DodoCheckout] Checkout modal is already active. Closing previous session.');
      CheckoutModalManager.activeInstance.close('programmatic');
    }

    ensureStylesInjected();

    const manager = new CheckoutModalManager(options);
    CheckoutModalManager.activeInstance = manager;
    manager.mount();

    return {
      sessionId: manager.sessionId,
      close: (reason?: CheckoutCloseReason) => manager.close(reason || 'programmatic'),
      isOpen: () => !manager.isClosed,
    };
  }

  public static closeActive(reason: CheckoutCloseReason = 'programmatic'): void {
    if (CheckoutModalManager.activeInstance) {
      CheckoutModalManager.activeInstance.close(reason);
    }
  }

  private mount(): void {
    // 1. Create Backdrop
    this.backdropEl = document.createElement('div');
    this.backdropEl.className = 'dodo-overlay-backdrop';
    this.backdropEl.setAttribute('role', 'dialog');
    this.backdropEl.setAttribute('aria-modal', 'true');
    this.backdropEl.setAttribute('aria-label', 'Dodo Secure Checkout');

    // 2. Create Container
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'dodo-iframe-container';

    // 3. Create Spinner
    this.spinnerEl = document.createElement('div');
    this.spinnerEl.className = 'dodo-loader-spinner';
    this.containerEl.appendChild(this.spinnerEl);

    // 4. Construct URL with query params
    const baseCheckoutUrl = this.options.checkoutUrl || DEFAULT_CHECKOUT_URL;
    const url = new URL(baseCheckoutUrl, window.location.origin);
    url.searchParams.set('session_id', this.sessionId);
    url.searchParams.set('product_id', this.options.productId);
    if (this.options.amount) url.searchParams.set('amount', this.options.amount.toString());
    if (this.options.currency) url.searchParams.set('currency', this.options.currency);
    if (this.options.productName) url.searchParams.set('product_name', this.options.productName);
    if (this.options.customerEmail) url.searchParams.set('email', this.options.customerEmail);
    if (this.options.theme) url.searchParams.set('theme', this.options.theme);
    url.searchParams.set('host_origin', window.location.origin);

    // 5. Create Iframe with Sandboxing
    this.iframeEl = document.createElement('iframe');
    this.iframeEl.className = 'dodo-checkout-iframe';
    this.iframeEl.src = url.toString();
    this.iframeEl.allow = 'payment';
    this.iframeEl.title = 'Dodo Secure Payment Frame';
    // Sandbox restrictions: allow-scripts, allow-forms, allow-same-origin, allow-popups for auth
    this.iframeEl.setAttribute(
      'sandbox',
      'allow-scripts allow-forms allow-same-origin allow-popups allow-modals'
    );

    this.containerEl.appendChild(this.iframeEl);
    this.backdropEl.appendChild(this.containerEl);
    document.body.appendChild(this.backdropEl);

    // Prevent background page scrolling
    document.body.style.overflow = 'hidden';

    // 6. Setup Listeners
    window.addEventListener('message', this.handleMessage);
    window.addEventListener('keydown', this.handleKeyDown);
    this.backdropEl.addEventListener('click', this.handleBackdropClick);

    // Trigger visual entry transition
    requestAnimationFrame(() => {
      this.backdropEl?.classList.add('dodo-visible');
    });

    // 7. Load Timeout Watchdog
    this.loadTimeoutTimer = window.setTimeout(() => {
      if (!this.isReady && !this.isClosed) {
        this.options.onError?.({
          code: 'FRAME_LOAD_TIMEOUT',
          message: 'The checkout window took too long to respond. Please check your network.',
        });
        this.close('error_abort');
      }
    }, LOAD_TIMEOUT_MS);
  }

  private handleMessage = (event: MessageEvent): void => {
    // Origin Verification
    if (this.checkoutOrigin !== '*' && event.origin !== this.checkoutOrigin) {
      return;
    }

    if (!isValidCheckoutMessage(event.data)) {
      return;
    }

    const message = event.data as InboundMessage;
    if (message.sessionId !== this.sessionId) {
      return;
    }

    switch (message.type) {
      case 'DODO_CHECKOUT_READY': {
        this.isReady = true;
        if (this.loadTimeoutTimer) {
          clearTimeout(this.loadTimeoutTimer);
          this.loadTimeoutTimer = null;
        }
        this.spinnerEl?.classList.add('dodo-hidden');
        this.options.onReady?.();

        // Send full init state to checkout iframe
        this.postToFrame({
          source: MESSAGE_SOURCE_SDK,
          type: 'DODO_SDK_INIT',
          sessionId: this.sessionId,
          payload: {
            productId: this.options.productId,
            productName: this.options.productName,
            amount: this.options.amount,
            currency: this.options.currency,
            customerEmail: this.options.customerEmail,
            theme: this.options.theme,
            metadata: this.options.metadata,
          },
        });
        break;
      }

      case 'DODO_CHECKOUT_SUCCESS': {
        this.options.onSuccess?.(message.payload);
        break;
      }

      case 'DODO_CHECKOUT_ERROR': {
        this.options.onError?.(message.payload);
        break;
      }

      case 'DODO_CHECKOUT_REQUEST_CLOSE': {
        this.close(message.payload.reason);
        break;
      }
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && !this.isClosed) {
      this.close('escape_key');
    }
  };

  private handleBackdropClick = (event: MouseEvent): void => {
    if (event.target === this.backdropEl && !this.isClosed) {
      this.close('user_dismissed');
    }
  };

  private postToFrame(message: OutboundMessage): void {
    if (this.iframeEl?.contentWindow) {
      this.iframeEl.contentWindow.postMessage(message, this.checkoutOrigin === '*' ? '*' : this.checkoutOrigin);
    }
  }

  public close(reason: CheckoutCloseReason = 'user_dismissed'): void {
    if (this.isClosed) return;
    this.isClosed = true;

    if (this.loadTimeoutTimer) {
      clearTimeout(this.loadTimeoutTimer);
      this.loadTimeoutTimer = null;
    }

    // Inform iframe
    this.postToFrame({
      source: MESSAGE_SOURCE_SDK,
      type: 'DODO_SDK_CLOSE',
      sessionId: this.sessionId,
      payload: { reason },
    });

    // Remove event listeners
    window.removeEventListener('message', this.handleMessage);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.backdropEl?.removeEventListener('click', this.handleBackdropClick);

    // Animate out
    if (this.backdropEl) {
      this.backdropEl.classList.remove('dodo-visible');
      setTimeout(() => {
        if (this.backdropEl && this.backdropEl.parentNode) {
          this.backdropEl.parentNode.removeChild(this.backdropEl);
        }
        document.body.style.overflow = '';
      }, 250);
    } else {
      document.body.style.overflow = '';
    }

    if (CheckoutModalManager.activeInstance === this) {
      CheckoutModalManager.activeInstance = null;
    }

    this.options.onClose?.({
      reason,
      sessionId: this.sessionId,
    });
  }
}
