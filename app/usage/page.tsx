'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { BarChart2, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function UsagePage() {
  const stats = [
    { label: 'Total Requests', value: '146', change: '+12.5%', icon: BarChart2, color: 'text-fm-blue' },
    { label: 'Total Tokens', value: '9.02M', change: '+8.2%', icon: TrendingUp, color: 'text-fm-amber' },
    { label: 'Cost', value: '$42.30', change: '-2.1%', icon: DollarSign, color: 'text-fm-green' },
    { label: 'Avg Latency', value: '127ms', change: '-8ms', icon: Clock, color: 'text-fm-text-muted' },
  ];

  const dailyData = [
    { date: 'Jun 13', requests: 12, tokens: 145000, cost: 0.89 },
    { date: 'Jun 14', requests: 18, tokens: 234000, cost: 1.42 },
    { date: 'Jun 15', requests: 8, tokens: 98000, cost: 0.61 },
    { date: 'Jun 16', requests: 24, tokens: 312000, cost: 1.98 },
    { date: 'Jun 17', requests: 16, tokens: 189000, cost: 1.15 },
    { date: 'Jun 18', requests: 32, tokens: 421000, cost: 2.56 },
    { date: 'Jun 19', requests: 36, tokens: 489000, cost: 2.98 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ USAGE</p>
        <h1 className="text-3xl font-bold text-fm-text">Usage Analytics</h1>
        <p className="text-fm-text-muted mt-1">Monitor your API usage and costs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">{stat.label}</span>
              <div className="w-10 h-10 rounded-lg bg-fm-surface-hover flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-sub">
              <span className="font-mono text-fm-green">{stat.change}</span>
              <span>vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Usage Table */}
      <div className="bg-fm-surface border border-fm-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fm-border">
          <h2 className="text-lg font-semibold text-fm-text">Daily Usage (Last 7 Days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-fm-text-dim border-b border-fm-border">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Tokens</th>
                <th className="px-5 py-3 font-medium">Cost</th>
                <th className="px-5 py-3 font-medium">Avg Latency</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((day, i) => (
                <tr key={i} className="border-b border-fm-border/50 last:border-0 hover:bg-fm-surface-hover transition-colors">
                  <td className="px-5 py-3 text-fm-text">{day.date}</td>
                  <td className="px-5 py-3 text-fm-text">{day.requests.toLocaleString()}</td>
                  <td className="px-5 py-3 text-fm-text">{day.tokens.toLocaleString()}</td>
                  <td className="px-5 py-3 text-fm-text">${day.cost.toFixed(2)}</td>
                  <td className="px-5 py-3 text-fm-text-muted">{120 + Math.floor(Math.random() * 30)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-8 stat-card">
        <h3 className="text-lg font-semibold text-fm-text mb-4">Requests Over Time</h3>
        <div className="h-64 flex items-end justify-between gap-2 px-2 py-4">
          {dailyData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-fm-green rounded-t transition-all hover:bg-fm-green-dim"
                style={{ height: `${(day.requests / 36) * 100}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-fm-text-dim mt-2">{day.date.split(' ')[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}