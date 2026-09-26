import React from 'react';
import { Layers, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="brand-icon-wrap">
          <Layers size={20} />
        </div>
        <div>
          <span className="brand-title">Dodo Demo</span>
        </div>
        <span className="sdk-pill">Powered by Dodo Payments</span>
      </div>

      <div className="nav-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Terminal size={14} />
          <span>SDK v1.0.0</span>
        </div>
      </div>
    </nav>
  );
};
