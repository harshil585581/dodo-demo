/**
 * Injected styles for Dodo Checkout host overlay
 */

const STYLE_ELEMENT_ID = 'dodo-checkout-sdk-styles';

export const INJECTED_CSS = `
.dodo-overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: rgba(4, 7, 13, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2147483640;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s ease;
  padding: 16px;
  box-sizing: border-box;
}

.dodo-overlay-backdrop.dodo-visible {
  opacity: 1;
  visibility: visible;
}

.dodo-iframe-container {
  position: relative;
  width: 100%;
  max-width: 480px;
  height: 640px;
  max-height: 90vh;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: scale(0.96) translateY(8px);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  background: #0d1117;
}

.dodo-overlay-backdrop.dodo-visible .dodo-iframe-container {
  transform: scale(1) translateY(0);
}

.dodo-checkout-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: transparent;
  color-scheme: normal;
}

.dodo-loader-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: dodo-spin 0.8s linear infinite;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.dodo-loader-spinner.dodo-hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes dodo-spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@media (max-width: 520px) {
  .dodo-overlay-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .dodo-iframe-container {
    max-width: 100%;
    height: 88vh;
    border-radius: 20px 20px 0 0;
    transform: translateY(100%);
  }
  .dodo-overlay-backdrop.dodo-visible .dodo-iframe-container {
    transform: translateY(0);
  }
}
`;

export function ensureStylesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ELEMENT_ID;
  styleEl.textContent = INJECTED_CSS;
  document.head.appendChild(styleEl);
}
