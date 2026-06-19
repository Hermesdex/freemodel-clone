'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { ApiKeysPanel } from '@/components/ApiKeysPanel';
import { getApiKeys, createApiKey, revokeApiKey, deleteApiKey } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import { useState } from 'react';

export default function KeysPage() {
  const { addToast } = useToast();
  const [keys, setKeys] = useState(() => getApiKeys());
  const [creatingKey, setCreatingKey] = useState(false);

  const handleCreateKey = async (name: string, telegramId: number, sessionToken: string) => {
    setCreatingKey(true);
    try {
      // Key creation happens in ApiKeysPanel via API call
      // This is just for UI state tracking
      addToast({
        type: 'success',
        title: 'Creating key...',
        message: `Telegram auth verified for user ${telegramId}, creating "${name}"`,
      });
    } catch {
      addToast({ type: 'error', title: 'Failed', message: 'Please try again' });
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const success = revokeApiKey('user_coinpump', keyId);
      if (success) {
        setKeys(prev => prev.map(k => k.id === keyId ? { ...k, isActive: false } : k));
        addToast({ type: 'success', title: 'Key revoked', message: 'API key has been revoked' });
      }
    } catch {
      addToast({ type: 'error', title: 'Failed', message: 'Please try again' });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const success = deleteApiKey('user_coinpump', keyId);
      if (success) {
        setKeys(prev => prev.filter(k => k.id !== keyId));
        addToast({ type: 'success', title: 'Key deleted', message: 'API key permanently deleted' });
      }
    } catch {
      addToast({ type: 'error', title: 'Failed', message: 'Please try again' });
    }
  };

  const handleCopyKey = (key: string, rawKey?: string) => {
    navigator.clipboard.writeText(rawKey || key);
    addToast({ type: 'success', title: 'Copied!', message: 'API key copied to clipboard' });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ API KEYS</p>
        <h1 className="text-3xl font-bold text-fm-text">API keys</h1>
        <p className="text-fm-text-muted mt-1">Manage your API keys for secure access to FreeModel</p>
      </div>

      <ApiKeysPanel
        keys={keys}
        maxKeys={5}
        onCreateKey={handleCreateKey}
        onRevokeKey={handleRevokeKey}
        onDeleteKey={handleDeleteKey}
        onCopyKey={handleCopyKey}
        creatingKey={creatingKey}
      />
    </DashboardLayout>
  );
}