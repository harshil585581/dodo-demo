import React from 'react';
import { CardBrand } from '../types';

export const VisaIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-4' }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#1434CB" />
    <path
      d="M14.65 16.48H12.35L13.78 7.52H16.08L14.65 16.48ZM23.36 7.73C22.91 7.55 22.2 7.37 21.32 7.37C18.99 7.37 17.37 8.57 17.35 10.3C17.33 11.58 18.52 12.29 19.41 12.72C20.32 13.16 20.63 13.44 20.63 13.83C20.63 14.43 19.9 14.69 19.21 14.69C18.17 14.69 17.58 14.54 16.78 14.18L16.43 14.02L16.06 16.32C16.69 16.61 17.84 16.85 19.04 16.86C21.49 16.86 23.09 15.68 23.11 13.86C23.12 12.83 22.47 12.04 21.05 11.36C20.19 10.93 19.67 10.66 19.67 10.18C19.67 9.75 20.15 9.3 21.14 9.3C21.94 9.28 22.54 9.46 22.99 9.66L23.36 7.73ZM28.02 7.52H26.24C25.68 7.52 25.26 7.68 25.02 8.27L21.37 16.48H23.82L24.31 15.15H27.31L27.6 16.48H29.77L28.02 7.52ZM24.97 13.34L26.17 9.99L26.86 13.34H24.97ZM10.82 7.52L8.58 13.62L8.34 12.44C7.94 11.08 6.78 9.59 5.4 8.87L7.42 16.48H9.91L13.6 7.52H10.82Z"
      fill="white"
    />
  </svg>
);

export const MastercardIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-4' }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#1A1F2C" />
    <circle cx="14" cy="12" r="7" fill="#EB001B" />
    <circle cx="22" cy="12" r="7" fill="#F79E1B" fillOpacity="0.85" />
  </svg>
);

export const AmexIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-4' }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#006FCF" />
    <path
      d="M7 16L10.5 8H13L16.5 16H14L13.2 14.2H10.3L9.5 16H7ZM10.8 12.6H12.7L11.75 10.3L10.8 12.6ZM17 16V8H19.5L21.5 12L23.5 8H26V16H24V11.2L22.2 14.8H20.8L19 11.2V16H17ZM27 16V8H32V9.8H29V11.1H31.8V12.9H29V14.2H32V16H27Z"
      fill="white"
    />
  </svg>
);

export const DiscoverIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-4' }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#231F20" />
    <path
      d="M7 8H10.5C12.5 8 13.5 9.5 13.5 12C13.5 14.5 12.5 16 10.5 16H7V8ZM9 14.2H10.2C11.5 14.2 12 13.3 12 12C12 10.7 11.5 9.8 10.2 9.8H9V14.2Z"
      fill="white"
    />
    <circle cx="18" cy="12" r="4" fill="#F47216" />
    <path d="M23 8H25V16H23V8Z" fill="white" />
  </svg>
);

export const GenericCardIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-4' }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" rx="4" fill="#334155" />
    <rect x="0" y="5" width="36" height="4" fill="#1E293B" />
    <rect x="5" y="14" width="8" height="3" rx="1" fill="#64748B" />
    <circle cx="28" cy="15.5" r="2.5" fill="#64748B" />
  </svg>
);

export function renderBrandIcon(brand: CardBrand, className?: string) {
  switch (brand) {
    case 'visa':
      return <VisaIcon className={className} />;
    case 'mastercard':
      return <MastercardIcon className={className} />;
    case 'amex':
      return <AmexIcon className={className} />;
    case 'discover':
      return <DiscoverIcon className={className} />;
    default:
      return <GenericCardIcon className={className} />;
  }
}

export const DodoLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="8" fill="url(#dodo_gradient)" />
    <path
      d="M14 6C9.58 6 6 9.58 6 14C6 18.42 9.58 22 14 22C18.42 22 22 18.42 22 14C22 9.58 18.42 6 14 6ZM12.2 18.2V9.8L18.5 14L12.2 18.2Z"
      fill="white"
    />
    <defs>
      <linearGradient id="dodo_gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
);
