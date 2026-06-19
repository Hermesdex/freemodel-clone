'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { FileText, Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';

const logs = [
  { id: 'log_1', timestamp: '2026-06-19 14:32:15', method: 'POST', endpoint: '/v1/chat/completions', status: 200, latency: '127ms', tokens: 1240, model: 'gpt-4o' },
  { id: 'log_2', timestamp: '2026-06-19 14:31:42', method: 'POST', endpoint: '/v1/chat/completions', status: 200, latency: '98ms', tokens: 890, model: 'gpt-4o-mini' },
  { id: 'log_3', timestamp: '2026-06-19 14:30:55', method: 'POST', endpoint: '/v1/embeddings', status: 200, latency: '45ms', tokens: 512, model: 'text-embedding-3-small' },
  { id: 'log_4', timestamp: '2026-06-19 14:29:11', method: 'POST', endpoint: '/v1/chat/completions', status: 429, latency: '0ms', tokens: 0, model: 'gpt-4o' },
  { id: 'log_5', timestamp: '2026-06-19 14:28:33', method: 'POST', endpoint: '/v1/chat/completions', status: 200, latency: '156ms', tokens: 2100, model: 'gpt-4o' },
  { id: 'log_6', timestamp: '2026-06-19 14:27:09', method: 'GET', endpoint: '/v1/models', status: 200, latency: '23ms', tokens: 0, model: '-' },
];

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.endpoint.toLowerCase().includes(search.toLowerCase()) ||
                         log.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'success' && log.status === 200) ||
                         (statusFilter === 'error' && log.status !== 200);
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ LOGS</p>
        <h1 className="text-3xl font-bold text-fm-text">Request Logs</h1>
        <p className="text-fm-text-muted mt-1">Monitor and debug your API requests</p>
      </div>

      {/* Filters */}
      <div className="bg-fm-surface border border-fm-border rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fm-text-dim" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search endpoint, model..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="success">Success (200)</option>
            <option value="error">Errors</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-fm-surface border border-fm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-fm-text-dim border-b border-fm-border bg-fm-surface-hover">
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Endpoint</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Latency</th>
                <th className="px-5 py-3 font-medium">Tokens</th>
                <th className="px-5 py-3 font-medium">Model</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={i} className="border-b border-fm-border/50 last:border-0 hover:bg-fm-surface-hover transition-colors">
                  <td className="px-5 py-3 text-fm-text font-mono text-sm">{log.timestamp}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-fm-blue/10 text-fm-blue">
                      {log.method}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-fm-text font-mono text-sm">{log.endpoint}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      log.status === 200 ? 'bg-fm-green/10 text-fm-green' : 'bg-fm-red/10 text-fm-red'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-fm-text-muted font-mono text-sm">{log.latency}</td>
                  <td className="px-5 py-3 text-fm-text">{log.tokens.toLocaleString()}</td>
                  <td className="px-5 py-3 text-fm-text-muted">{log.model}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-fm-text-dim">
                    No logs found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}