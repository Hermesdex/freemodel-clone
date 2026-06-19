'use client';

import { cn } from '@/lib/utils';
import {
  Crown,
  Zap,
  BarChart2,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, icon, sub, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">{label}</span>
        <div className="w-10 h-10 rounded-lg bg-fm-surface-hover flex items-center justify-center text-fm-text-muted">
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {(trend || trendValue) && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-fm-green" />}
          {trend === 'down' && <TrendingUp className="w-4 h-4 text-fm-red rotate-180" />}
          {trend === 'neutral' && <span className="w-4 h-4" />}
          <span className={cn(
            'font-medium',
            trend === 'up' ? 'text-fm-green' : trend === 'down' ? 'text-fm-red' : 'text-fm-text-muted'
          )}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}

// Pre-built stat cards for the dashboard
export function DashboardStats({ stats }: { stats: {
  currentPlan: string;
  planRenewal: string;
  cacheHitRate: number | null;
  requests30d: number;
  tokens30d: number;
  avgLatency: number;
} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="CURRENT PLAN"
        value={stats.currentPlan}
        icon={<Crown className="w-5 h-5 text-fm-green" />}
        sub={
          <>
            <span className="w-2 h-2 rounded-full bg-fm-green" />
            <span>Renews {stats.planRenewal}</span>
          </>
        }
      />
      <StatCard
        label="CACHE HIT RATE · TODAY"
        value={stats.cacheHitRate !== null ? `${stats.cacheHitRate}%` : '—'}
        icon={<Zap className="w-5 h-5 text-fm-blue" />}
        sub={stats.cacheHitRate === null ? (
          <span className="text-fm-text-dim">No requests yet</span>
        ) : (
          <>
            <span className="font-mono text-fm-text-dim">Updated just now</span>
          </>
        )}
        trend="neutral"
        trendValue={stats.cacheHitRate !== null ? '+2.1% vs yesterday' : ''}
      />
      <StatCard
        label="REQUESTS · 30D"
        value={stats.requests30d.toLocaleString()}
        icon={<BarChart2 className="w-5 h-5 text-fm-amber" />}
        sub={<span>{stats.tokens30d.toLocaleString()} tokens</span>}
        trend="up"
        trendValue="+12.5% vs prev period"
      />
      <StatCard
        label="AVG LATENCY"
        value={`${stats.avgLatency}ms`}
        icon={<Clock className="w-5 h-5 text-fm-text-muted" />}
        sub={<span className="text-fm-text-dim">p95: 245ms</span>}
        trend="down"
        trendValue="-8ms vs last week"
      />
    </div>
  );
}