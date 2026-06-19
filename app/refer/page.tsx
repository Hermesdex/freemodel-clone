'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Link2, Copy, Share2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function ReferPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'COINPUMP2026';
  const referralLink = `https://freemodel.dev/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'Total Referrals', value: '47', icon: Users, color: 'text-fm-blue' },
    { label: 'Earned Credits', value: '$235.00', icon: DollarSign, color: 'text-fm-green' },
    { label: 'Conversion Rate', value: '12.8%', icon: TrendingUp, color: 'text-fm-amber' },
  ];

  const referrals = [
    { name: 'Alex Chen', email: 'alex@example.com', joined: 'Jun 15, 2026', status: 'Active', earnings: '$15.00' },
    { name: 'Sarah Kim', email: 'sarah@example.com', joined: 'Jun 10, 2026', status: 'Active', earnings: '$12.00' },
    { name: 'Mike Ro', email: 'mike@example.com', joined: 'Jun 5, 2026', status: 'Pending', earnings: '$0.00' },
    { name: 'Emily T.', email: 'emily@example.com', joined: 'May 28, 2026', status: 'Active', earnings: '$25.00' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ REFER & EARN</p>
        <h1 className="text-3xl font-bold text-fm-text">Referral Program</h1>
        <p className="text-fm-text-muted mt-1">Earn credits by inviting friends to FreeModel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">{stat.label}</span>
              <div className="w-10 h-10 rounded-lg bg-fm-surface-hover flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="bg-fm-surface border border-fm-border rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-fm-text mb-4">Your Referral Link</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="input-field pr-12"
            />
            <button
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-2"
            >
              {copied ? (
                <span className="text-fm-green font-medium">Copied!</span>
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
        <p className="text-sm text-fm-text-dim mt-3">
          Share this link. When someone signs up and makes their first payment, you both get <strong className="text-fm-text">$10 credit</strong>.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { step: '1', title: 'Share Your Link', desc: 'Copy your unique referral link and share it with friends or on social media.' },
          { step: '2', title: 'They Sign Up', desc: 'Your friend creates an account using your link and adds a payment method.' },
          { step: '3', title: 'You Both Earn', desc: 'After their first payment, you both receive $10 in FreeModel credits instantly.' },
        ].map((item, i) => (
          <div key={i} className="stat-card text-center">
            <div className="w-12 h-12 rounded-xl bg-fm-green/10 flex items-center justify-center mx-auto mb-4 text-fm-green text-xl font-bold">
              {item.step}
            </div>
            <h3 className="font-semibold text-fm-text mb-1">{item.title}</h3>
            <p className="text-fm-text-muted text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Referral History */}
      <div className="bg-fm-surface border border-fm-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fm-border">
          <h2 className="text-lg font-semibold text-fm-text">Your Referrals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-fm-text-dim border-b border-fm-border">
                <th className="px-5 py-3 font-medium">Referral</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Your Earnings</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref, i) => (
                <tr key={i} className="border-b border-fm-border/50 last:border-0">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-fm-text font-medium">{ref.name}</p>
                      <p className="text-fm-text-dim text-sm">{ref.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-fm-text-muted">{ref.joined}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      ref.status === 'Active' ? 'bg-fm-green/10 text-fm-green' : 'bg-fm-amber/10 text-fm-amber'
                    }`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-fm-green font-medium">{ref.earnings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}