'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStats } from '@/components/StatCards';
import { ApiKeysPanel } from '@/components/ApiKeysPanel';
import { getStats, getApiKeys, createApiKey, revokeApiKey, deleteApiKey, toggleApiKey } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

export default function DashboardPage() {
  const { addToast } = useToast();
  const [stats] = useState(() => getStats()!);
  const [keys, setKeys] = useState(() => getApiKeys());
  const [creatingKey, setCreatingKey] = useState(false);

  const handleCreateKey = async (name: string, phoneNumber: string) => {
    setCreatingKey(true);
    try {
      // The actual creation happens in the ApiKeysPanel via API calls
      // This is just for UI state
      const newKey = createApiKey('user_coinpump', name);
      if (newKey) {
        setKeys(prev => [newKey, ...prev]);
        addToast({
          type: 'success',
          title: 'API Key Created',
          message: `${name} has been created successfully`,
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Create Key',
        message: 'Please try again',
      });
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const success = revokeApiKey('user_coinpump', keyId);
      if (success) {
        setKeys(prev => prev.map(k => k.id === keyId ? { ...k, isActive: false } : k));
        addToast({
          type: 'success',
          title: 'Key Revoked',
          message: 'API key has been revoked',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to Revoke',
        message: 'Please try again',
      });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const success = deleteApiKey('user_coinpump', keyId);
      if (success) {
        setKeys(prev => prev.filter(k => k.id !== keyId));
        addToast({
          type: 'success',
          title: 'Key Deleted',
          message: 'API key has been permanently deleted',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to Delete',
        message: 'Please try again',
      });
    }
  };

  const handleToggleKey = async (keyId: string) => {
    try {
      const key = toggleApiKey('user_coinpump', keyId);
      if (key) {
        setKeys(prev => prev.map(k => k.id === keyId ? key : k));
        addToast({
          type: 'success',
          title: key.isActive ? 'Key Activated' : 'Key Deactivated',
          message: `API key has been ${key.isActive ? 'activated' : 'deactivated'}`,
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to Toggle',
        message: 'Please try again',
      });
    }
  };

  const handleCopyKey = (key: string, rawKey?: string) => {
    const keyToCopy = rawKey || key;
    navigator.clipboard.writeText(keyToCopy);
    addToast({
      type: 'success',
      title: 'Copied!',
      message: 'API key copied to clipboard',
    });
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ HOME</p>
        <h1 className="text-3xl font-bold text-fm-text">Welcome back, Coin</h1>
        <p className="text-fm-text-muted mt-1">Friday, June 19</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats!} />

      {/* API Keys Section */}
      <section className="mt-10" aria-labelledby="keys-heading">
        <div className="flex items-center justify-between mb-6">
          <h2 id="keys-heading" className="text-xl font-semibold text-fm-text">API Keys</h2>
          <ApiKeysPanel
            keys={keys}
            onCreateKey={handleCreateKey}
            onRevokeKey={handleRevokeKey}
            onDeleteKey={handleDeleteKey}
            onToggleKey={handleToggleKey}
            onCopyKey={handleCopyKey}
            creatingKey={creatingKey}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-10" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="text-xl font-semibold text-fm-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/docs"
            className="stat-card hover:border-fm-blue/30 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Documentation</span>
              <svg className="w-10 h-10 rounded-lg bg-fm-blue/10 flex items-center justify-center text-fm-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-fm-text-muted">API reference & guides</p>
          </a>
          <a
            href="/usage"
            className="stat-card hover:border-fm-amber/30 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Usage Analytics</span>
              <svg className="w-10 h-10 rounded-lg bg-fm-amber/10 flex items-center justify-center text-fm-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-fm-text-muted">Detailed metrics & charts</p>
          </a>
          <a
            href="/billing"
            className="stat-card hover:border-fm-green/30 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Billing & Plans</span>
              <svg className="w-10 h-10 rounded-lg bg-fm-green/10 flex items-center justify-center text-fm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-fm-text-muted">Manage subscription</p>
          </a>
          <a
            href="/refer"
            className="stat-card hover:border-fm-blue/30 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">Refer & Earn</span>
              <svg className="w-10 h-10 rounded-lg bg-fm-blue/10 flex items-center justify-center text-fm-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <p className="text-fm-text-muted">Invite friends, earn credits</p>
          </a>
        </div>
      </section>
    </DashboardLayout>
  );
}