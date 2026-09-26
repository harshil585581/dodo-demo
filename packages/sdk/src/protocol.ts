/**
 * Typed postMessage protocol contract between Dodo SDK and Checkout Iframe
 */

import {
  CheckoutSuccessPayload,
  CheckoutClosePayload,
  CheckoutErrorPayload,
  CheckoutOptions,
} from './types';

export const MESSAGE_SOURCE_SDK = 'DODO_SDK';
export const MESSAGE_SOURCE_CHECKOUT = 'DODO_CHECKOUT';

export type InboundMessage =
  | {
      source: typeof MESSAGE_SOURCE_CHECKOUT;
      type: 'DODO_CHECKOUT_READY';
      sessionId: string;
    }
  | {
      source: typeof MESSAGE_SOURCE_CHECKOUT;
      type: 'DODO_CHECKOUT_SUCCESS';
      sessionId: string;
      payload: CheckoutSuccessPayload;
    }
  | {
      source: typeof MESSAGE_SOURCE_CHECKOUT;
      type: 'DODO_CHECKOUT_ERROR';
      sessionId: string;
      payload: CheckoutErrorPayload;
    }
  | {
      source: typeof MESSAGE_SOURCE_CHECKOUT;
      type: 'DODO_CHECKOUT_REQUEST_CLOSE';
      sessionId: string;
      payload: CheckoutClosePayload;
    };

export type OutboundMessage =
  | {
      source: typeof MESSAGE_SOURCE_SDK;
      type: 'DODO_SDK_INIT';
      sessionId: string;
      payload: Omit<CheckoutOptions, 'onSuccess' | 'onClose' | 'onError' | 'onReady'>;
    }
  | {
      source: typeof MESSAGE_SOURCE_SDK;
      type: 'DODO_SDK_CLOSE';
      sessionId: string;
      payload: CheckoutClosePayload;
    };

export function isValidCheckoutMessage(data: unknown): data is InboundMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return (
    msg.source === MESSAGE_SOURCE_CHECKOUT &&
    typeof msg.type === 'string' &&
    typeof msg.sessionId === 'string'
  );
}
