import { CardBrand } from '../types';

/**
 * Detect card brand from leading digits
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) return 'generic';

  if (/^4/.test(clean)) {
    return 'visa';
  }
  if (/^(5[1-5]|2[2-7])/.test(clean)) {
    return 'mastercard';
  }
  if (/^3[47]/.test(clean)) {
    return 'amex';
  }
  if (/^(6011|65|64[4-9]|622)/.test(clean)) {
    return 'discover';
  }

  return 'generic';
}

/**
 * Format card number with spacing (4-4-4-4 or 4-6-5 for Amex)
 */
export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '');
  const brand = detectCardBrand(clean);

  if (brand === 'amex') {
    const trimmed = clean.slice(0, 15);
    const p1 = trimmed.slice(0, 4);
    const p2 = trimmed.slice(4, 10);
    const p3 = trimmed.slice(10, 15);

    return [p1, p2, p3].filter(Boolean).join(' ');
  }

  const trimmed = clean.slice(0, 16);
  const parts = [];
  for (let i = 0; i < trimmed.length; i += 4) {
    parts.push(trimmed.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Format Expiry as MM / YY
 */
export function formatExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length === 0) return '';
  if (clean.length === 1) {
    if (parseInt(clean, 10) > 1) {
      return `0${clean} / `;
    }
    return clean;
  }
  if (clean.length === 2) {
    let month = parseInt(clean, 10);
    if (month > 12) month = 12;
    if (month === 0) month = 1;
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;
    return `${formattedMonth} / `;
  }
  const month = clean.slice(0, 2);
  const year = clean.slice(2, 4);
  return `${month} / ${year}`;
}

/**
 * Format CVC (3 or 4 digits)
 */
export function formatCvc(value: string, brand: CardBrand): string {
  const maxLen = brand === 'amex' ? 4 : 3;
  return value.replace(/\D/g, '').slice(0, maxLen);
}

/**
 * Luhn checksum verification
 */
export function isValidLuhn(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate expiration date
 */
export function isValidExpiry(expiry: string): boolean {
  const clean = expiry.replace(/\D/g, '');
  if (clean.length !== 4) return false;

  const month = parseInt(clean.slice(0, 2), 10);
  const year = parseInt(clean.slice(2, 4), 10) + 2000;

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 25) return false;

  return true;
}

/**
 * Format currency amount
 */
export function formatCurrency(amountInCents: number, currency = 'INR'): string {
  const amount = (amountInCents || 0) / 100;
  const isINR = currency.toUpperCase() === 'INR';
  try {
    return new Intl.NumberFormat(isINR ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}
