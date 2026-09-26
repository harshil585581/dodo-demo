import { CardFormData, PaymentResult, CardBrand } from '../types';
import { detectCardBrand, isValidLuhn, isValidExpiry } from './cardUtils';

// Track attempt counters for the retry-after-fail card (4000 0000 0000 0341)
const attemptTracker = new Map<string, number>();

export async function processPayment(
  formData: CardFormData,
  sessionId: string
): Promise<PaymentResult> {
  const cleanNumber = formData.cardNumber.replace(/\D/g, '');
  const brand: CardBrand = detectCardBrand(cleanNumber);
  const last4 = cleanNumber.slice(-4);

  // Simulate network latency (1.0 - 1.4s)
  await new Promise((resolve) => setTimeout(resolve, 1100));

  // 1. Test Card: Always Decline (4000 0000 0000 0002)
  if (cleanNumber === '4000000000000002') {
    return {
      success: false,
      errorCode: 'CARD_DECLINED',
      errorMessage: 'Your card was declined by the issuing bank. Please use another payment method.',
      isRetryable: false,
      brand,
      last4,
    };
  }

  // 2. Test Card: Fail once, then succeed on retry (4000 0000 0000 0341)
  if (cleanNumber === '4000000000000341') {
    const attempts = attemptTracker.get(sessionId) || 0;
    attemptTracker.set(sessionId, attempts + 1);

    if (attempts === 0) {
      return {
        success: false,
        errorCode: 'NETWORK_TIMEOUT',
        errorMessage: 'Temporary payment gateway timeout. Please click "Retry Payment".',
        isRetryable: true,
        brand,
        last4,
      };
    }

    // Second attempt onwards succeeds
    return {
      success: true,
      paymentId: `dodo_pay_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
      sessionId,
      brand,
      last4,
    };
  }

  // 3. Test Card: Always Succeed (4242 4242 4242 4242)
  if (cleanNumber === '4242424242424242') {
    return {
      success: true,
      paymentId: `dodo_pay_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
      sessionId,
      brand,
      last4,
    };
  }

  // 4. Arbitrary Card Validation
  if (!isValidLuhn(cleanNumber)) {
    return {
      success: false,
      errorCode: 'INVALID_CARD_NUMBER',
      errorMessage: 'The card number entered is invalid. Please double check.',
      isRetryable: false,
      brand,
      last4,
    };
  }

  if (!isValidExpiry(formData.expiry)) {
    return {
      success: false,
      errorCode: 'INVALID_EXPIRY',
      errorMessage: 'Card expiration date is invalid or has passed.',
      isRetryable: false,
      brand,
      last4,
    };
  }

  // Default success for any valid card
  return {
    success: true,
    paymentId: `dodo_pay_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
    sessionId,
    brand,
    last4,
  };
}
