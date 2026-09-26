
import React, { useState, useCallback } from 'react';
import { DodoCheckout, CheckoutSuccessPayload, CheckoutClosePayload, CheckoutErrorPayload } from '@dodo/sdk';
import { Navbar } from './components/Navbar';
import { PricingTiers, PlanItem } from './components/PricingTiers';
import { EventInspector, LogEvent } from './components/EventInspector';
import { TestCardsCard } from './components/TestCardsCard';
import { Layers } from 'lucide-react';
import './styles/demo.css';

export const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [selectedTheme] = useState<'light'>('light');

  const addLog = useCallback((type: LogEvent['type'], payload: Record<string, unknown>) => {
    const newLog: LogEvent = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toLocaleTimeString(),
      payload,
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  const handleBuy = (plan: PlanItem) => {
    DodoCheckout.open({
      productId: plan.id,
      productName: plan.name,
      amount: plan.priceCents,
      currency: 'INR',
      customerEmail: 'alex.mercer@dodo.dev',
      theme: selectedTheme,
      // Pass the hosted checkout URL (defaults to localhost:5174 or VITE_CHECKOUT_URL from env)
      checkoutUrl: import.meta.env.VITE_CHECKOUT_URL || 'http://localhost:5174',
      onReady: () => {
        addLog('onReady', { message: 'Checkout iframe loaded and ready.' });
      },
      onSuccess: (payload: CheckoutSuccessPayload) => {
        addLog('onSuccess', payload as unknown as Record<string, unknown>);
      },
      onClose: (payload: CheckoutClosePayload) => {
        addLog('onClose', payload as unknown as Record<string, unknown>);
      },
      onError: (payload: CheckoutErrorPayload) => {
        addLog('onError', payload as unknown as Record<string, unknown>);
      },
    });
  };

  return (
    <div className="demo-app">
      <Navbar />

      <main className="main-layout">
        {/* Left: Merchant Storefront */}
        <section className="store-section">
          <div className="hero-banner">
            <div className="hero-badge">
              <Layers size={13} />
              <span>Live Checkout Integration</span>
            </div>
            <h1 className="hero-title">
              Empower your team with <span>high-velocity workflows</span>
            </h1>
            <p className="hero-desc">
              Dodo Demo provides real-time collaboration and workspace infrastructure. Choose a plan below to test the embedded Dodo Checkout flow.
            </p>
          </div>

          <PricingTiers onBuy={handleBuy} />
        </section>

        {/* Right Sidebar: Developer Console & Test Cards */}
        <aside className="sidebar-panel">
          <TestCardsCard />
          <EventInspector logs={logs} onClear={() => setLogs([])} />
        </aside>
      </main>
    </div>
  );
};
