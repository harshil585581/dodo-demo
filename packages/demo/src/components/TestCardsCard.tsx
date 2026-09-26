import React, { useState } from 'react';
import { CreditCard, Copy, Check } from 'lucide-react';

export const TestCardsCard: React.FC = () => {
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const testCards = [
    {
      num: '4242 4242 4242 4242',
      badge: 'Succeeds',
      badgeClass: 'event-success',
      desc: 'Simulates successful charge',
    },
    {
      num: '4000 0000 0000 0002',
      badge: 'Declines',
      badgeClass: 'event-error',
      desc: 'Simulates card declined error',
    },
    {
      num: '4000 0000 0000 0341',
      badge: 'Retry Once',
      badgeClass: 'event-close',
      desc: 'Fails 1st try, succeeds on retry',
    },
  ];

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s/g, ''));
    setCopiedCard(num);
    setTimeout(() => setCopiedCard(null), 1800);
  };

  return (
    <div className="panel-box">
      <div className="panel-header">
        <div className="panel-title">
          <CreditCard size={16} color="#6366f1" />
          <span>Test Payment Cards</span>
        </div>
      </div>

      <div className="card-pill-row">
        {testCards.map((c) => (
          <div
            key={c.num}
            className="card-pill-item"
            onClick={() => handleCopy(c.num)}
            title="Click to copy card number"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span className="card-num">{c.num}</span>
                <span className={`event-badge ${c.badgeClass}`}>{c.badge}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>

            <div style={{ color: copiedCard === c.num ? '#10b981' : 'var(--text-muted)' }}>
              {copiedCard === c.num ? <Check size={14} /> : <Copy size={14} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
