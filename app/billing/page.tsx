'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { CreditCard, Crown, Calendar, ArrowRight, Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: ['10,000 requests/month', '1M tokens/month', 'Standard support', 'Community models'],
    cta: 'Current Plan',
    popular: false,
    color: 'border-fm-border',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing applications',
    features: ['100,000 requests/month', '50M tokens/month', 'Priority support', 'All models including GPT-4o', 'Custom rate limits'],
    cta: 'Upgrade to Pro',
    popular: true,
    color: 'border-fm-green',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large scale deployments',
    features: ['Unlimited requests', 'Dedicated infrastructure', '24/7 dedicated support', 'SLA guarantee', 'Custom models', 'SSO & audit logs'],
    cta: 'Contact Sales',
    popular: false,
    color: 'border-fm-blue',
  },
];

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ BILLING</p>
        <h1 className="text-3xl font-bold text-fm-text">Billing & Plans</h1>
        <p className="text-fm-text-muted mt-1">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-fm-green/10 border border-fm-green/30 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-fm-green/20 flex items-center justify-center">
            <Crown className="w-7 h-7 text-fm-green" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-fm-text">Pro Plan Active</h2>
            <p className="text-fm-text-muted">Renews on June 23, 2026 • Auto-renew enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Manage Subscription</span>
          </button>
          <button className="btn-ghost text-fm-red">
            Cancel Plan
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-2xl p-6 transition-all ${
              plan.popular 
                ? 'bg-fm-green/5 border-2 border-fm-green' 
                : 'bg-fm-surface border border-fm-border hover:border-fm-green/30'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-fm-green text-fm-bg text-xs font-medium rounded-full">
                Most Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-fm-text mb-1">{plan.name}</h3>
              <p className="text-fm-text-muted text-sm">{plan.description}</p>
            </div>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-fm-text">{plan.price}</span>
              <span className="text-fm-text-muted">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, fi) => (
                <li key={fi} className="flex items-center gap-3 text-fm-text-muted">
                  <Check className="w-5 h-5 text-fm-green flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
              {plan.cta}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div className="bg-fm-surface border border-fm-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fm-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fm-text">Billing History</h2>
          <a href="#" className="btn-ghost text-sm">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-fm-text-dim border-b border-fm-border">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Jun 1, 2026', desc: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                { date: 'May 1, 2026', desc: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
                { date: 'Apr 1, 2026', desc: 'Pro Plan - Monthly', amount: '$29.00', status: 'Paid' },
              ].map((item, i) => (
                <tr key={i} className="border-b border-fm-border/50 last:border-0">
                  <td className="px-5 py-3 text-fm-text">{item.date}</td>
                  <td className="px-5 py-3 text-fm-text-muted">{item.desc}</td>
                  <td className="px-5 py-3 text-fm-text font-medium">${item.amount}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-fm-green/10 text-fm-green">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <a href="#" className="text-sm text-fm-blue hover:underline">Download</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}