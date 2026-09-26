import React from 'react';
import { Check, Zap, CreditCard } from 'lucide-react';

export interface PlanItem {
  id: string;
  name: string;
  priceCents: number;
  priceFormatted: string;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
}

export const PLANS: PlanItem[] = [
  {
    id: 'prod_starter_1499',
    name: 'Starter Plan',
    priceCents: 149900,
    priceFormatted: '₹1,499',
    period: '/ month',
    description: 'Essential tools for solo creators and independent builders.',
    features: [
      'Up to 3 active project workspaces',
      '10GB high-speed cloud storage',
      'Real-time team collaboration',
      'Standard email & community support',
    ],
  },
  {
    id: 'prod_pro_3999',
    name: 'Pro Tier',
    priceCents: 399900,
    priceFormatted: '₹3,999',
    period: '/ month',
    description: 'Advanced workspace infrastructure for growing product teams.',
    features: [
      'Unlimited collaborative workspaces',
      '250GB fast asset storage',
      'Custom domains & SSL certificates',
      'Advanced role-based access control',
      '24/7 priority support with 1hr SLA',
    ],
    featured: true,
  },
  {
    id: 'prod_scale_14999',
    name: 'Enterprise Scale',
    priceCents: 1499900,
    priceFormatted: '₹14,999',
    period: '/ month',
    description: 'Dedicated cloud infrastructure with enterprise compliance.',
    features: [
      'Dedicated private cloud instances',
      'Unlimited storage & bandwidth',
      'SAML 2.0 & Okta Single Sign-On (SSO)',
      'SOC2 Type II compliance audit logs',
      'Dedicated technical account manager',
    ],
  },
];

interface PricingTiersProps {
  onBuy: (plan: PlanItem) => void;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({ onBuy }) => {
  return (
    <div className="pricing-grid">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`pricing-card ${plan.featured ? 'featured' : ''}`}
        >
          {plan.featured && <span className="featured-badge">Most Popular</span>}

          <div>
            <h3 className="card-tier-name">{plan.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {plan.description}
            </p>
          </div>

          <div className="card-price-wrap">
            <span className="card-price">{plan.priceFormatted}</span>
            <span className="card-period">{plan.period}</span>
          </div>

          <ul className="card-features">
            {plan.features.map((feature, i) => (
              <li key={i}>
                <Check size={15} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={`buy-btn ${plan.featured ? 'primary-btn' : ''}`}
            onClick={() => onBuy(plan)}
          >
            {plan.featured ? <Zap size={16} /> : <CreditCard size={16} />}
            <span>Buy {plan.name}</span>
          </button>
        </div>
      ))}
    </div>
  );
};
