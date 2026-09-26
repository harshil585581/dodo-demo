# Dodo Payments — Embeddable Checkout

A lightweight, embeddable checkout SDK that opens a secure payment modal on any merchant website.

---

## 🚀 How to Run It

### 1. Install dependencies
```bash
npm install
```

### 2. Start development servers
```bash
npm run dev
```

This starts all three packages concurrently:
- **Demo Storefront**: `http://localhost:5173`
- **Hosted Checkout App**: `http://localhost:5174`
- **SDK Watcher**: Compiles `@dodo/sdk` in real-time

Open [http://localhost:5173](http://localhost:5173) in your browser to test the checkout flow.

---

## 🏗️ How the Pieces Talk to Each Other

The project is split into three separate layers:

```
┌────────────────────────────────────────────────────────┐
│ 1. Demo Storefront (Merchant Website)                  │
│    Calls DodoCheckout.open({ productId, onSuccess... })│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Embeddable SDK (@dodo/sdk)                          │
│    Injects backdrop overlay & sandboxed <iframe>       │
└───────────────────────────┬────────────────────────────┘
                            │ postMessage
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Isolated Checkout App (@dodo/checkout)              │
│    Collects card details securely inside the iframe    │
└────────────────────────────────────────────────────────┘
```

### Communication Flow:
1. **User clicks "Buy Plan"** on the merchant storefront.
2. **SDK** dynamically injects a backdrop overlay, a loading spinner, and an `<iframe>` pointing to the checkout app.
3. Once the checkout app inside the iframe is loaded, it sends a `DODO_CHECKOUT_READY` message to the SDK via `window.postMessage`.
4. **SDK** dismisses the spinner, displays the checkout modal, and sends the plan details (`amount`, `currency`, `productId`) to the iframe via `DODO_SDK_INIT`.
5. The customer fills in their card details and clicks **Pay**.
6. The checkout app validates the card, simulates payment processing, and sends back:
   - `DODO_CHECKOUT_SUCCESS` on successful payment ➔ SDK triggers `onSuccess` callback.
   - `DODO_CHECKOUT_ERROR` if the card declines ➔ SDK triggers `onError` callback.
7. When the user closes the modal or payment finishes, `DODO_CHECKOUT_REQUEST_CLOSE` is sent and the SDK cleanly unmounts the DOM elements.

---

## 🧪 Test Cards

| Card Number | Expiry | CVC | Expected Result |
| :--- | :--- | :--- | :--- |
| `4242 4242 4242 4242` | `12/28` | `123` | **Succeeds** (shows receipt screen & triggers `onSuccess`) |
| `4000 0000 0000 0002` | `12/28` | `123` | **Declines** (shows card decline badge & triggers `onError`) |
| `4000 0000 0000 0341` | `12/28` | `123` | **Fails once, then succeeds on retry** (network timeout simulation) |

---

## ⚖️ Two Decisions I Went Back and Forth On

### 1. Using an `<iframe>` instead of Shadow DOM
At first, I thought about building the checkout popup with Shadow DOM / Web Components because passing data around in JavaScript would have been simpler than setting up `postMessage`.

I ended up choosing an `<iframe>` for two main reasons:
- **Card Security & PCI Compliance**: If the checkout form lives directly on the merchant's webpage, any script on their site (like analytics or browser extensions) could potentially read the card inputs. Putting the checkout inside a separate domain iframe completely isolates and protects customer card numbers.
- **CSS Isolation**: Websites often have aggressive global CSS resets (like `* { box-sizing: content-box !important; }`) that bleed into Shadow DOM and mess up buttons and inputs. An iframe guarantees the checkout form looks clean and identical on every website.

### 2. How the Modal Opens & Handles Loading
I had to figure out how to handle the loading experience when a user clicks "Buy":
- If I showed the iframe immediately, people on slower internet would see an ugly blank white box while assets were downloading.
- If I waited until the iframe finished loading before showing anything at all, clicking "Buy" felt laggy and unresponsive.

To fix this, I made the background overlay and a small spinner show up immediately when the user clicks the button so they get instant feedback. The checkout form stays hidden until it finishes loading and sends a quick message saying it's ready, then it smoothly appears. I also added an 8-second timeout so that if the user is offline or the server fails, the popup automatically closes and returns an error instead of getting stuck forever.

---

## 🔮 What I'd Explore Next

1. **Server-Signed Checkout Sessions**:
   Generate secure session tokens from the backend (client secret) instead of passing raw amounts in client-side JavaScript, preventing price tampering via browser DevTools.

2. **3D Secure (OTP / SCA Challenge)**:
   Support step-up bank authentication screens for cards requiring SMS OTP verification before charge confirmation.

3. **UPI & 1-Tap Wallets (Google Pay / Apple Pay)**:
   Integrate browser Payment Request APIs for Google Pay / Apple Pay and add a quick UPI QR/VPA collect flow to reduce manual typing friction.

4. **Dynamic Currency & Localization**:
   Auto-detect customer location to format local currency symbols and translations automatically.
