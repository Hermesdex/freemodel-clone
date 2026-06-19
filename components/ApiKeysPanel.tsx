import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ApiKey } from '@/types';

interface ApiKeysPanelProps {
  keys: ApiKey[];
  maxKeys: number;
  onCreateKey: (name: string, phoneNumber: string) => Promise<void>;
  onRevokeKey: (keyId: string) => Promise<void>;
  onDeleteKey: (keyId: string) => Promise<void>;
  onCopyKey: (key: string, rawKey?: string) => void;
  creatingKey?: boolean;
}

export function ApiKeysPanel({
  keys,
  maxKeys = 5,
  onCreateKey,
  onRevokeKey,
  onDeleteKey,
  onToggleKey,
  onCopyKey,
  creatingKey,
}: ApiKeysPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'name' | 'phone' | 'otp' | 'success'>('name');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);

  const handleCreateStart = useCallback(() => {
    if (!keyName.trim()) {
      setError('Key name is required');
      return;
    }
    setError('');
    setStep('phone');
  }, [keyName]);

  const handleSendOtp = useCallback(async () => {
    if (!phoneNumber.trim()) {
      setError('Telegram number is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', phoneNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        setOtp('');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp.trim() || otp.length !== 5) {
      setError('5-digit OTP required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', phoneNumber, otp }),
      });
      const data = await res.json();
      if (data.success) {
        const createRes = await fetch('/api/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', keyName, phoneNumber }),
        });
        const createData = await createRes.json();
        if (createData.success) {
          setRawKey(createData.rawKey);
          setStep('success');
        } else {
          setError(createData.error || 'Failed to create key');
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [otp, phoneNumber, keyName]);

  const handleClose = useCallback(() => {
    setShowCreateModal(false);
    setKeyName('');
    setPhoneNumber('');
    setOtp('');
    setStep('name');
    setError('');
    setRawKey(null);
  }, []);

  const handleCopyRawKey = useCallback(() => {
    if (rawKey) {
      navigator.clipboard.writeText(rawKey);
      setRawKey(null);
    }
  }, [rawKey]);

  // Mask secret for display: fe_oa_abc123...xyz789 -> fe_oa_...........xyz789
  const maskSecret = (secret: string): string => {
    if (secret.length <= 16) return secret;
    const prefix = secret.slice(0, 7); // fe_oa_
    const suffix = secret.slice(-4);
    return `${prefix}...........${suffix}`;
  };

  return (
    <>
      {/* Header with button and counter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={creatingKey || keys.length >= maxKeys}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          title={keys.length >= maxKeys ? `Maximum ${maxKeys} keys reached` : ''}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create key</span>
        </button>

        <div className="text-center sm:text-right text-sm text-fm-text-muted">
          <span className="font-mono text-fm-text">{keys.length} / {maxKeys}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-fm-text-muted mb-6">
        Use a secret key to authenticate API requests. Never expose your key in client-side code.
      </p>

      {/* Keys Table */}
      <div className="bg-fm-surface border border-fm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-fm-text-dim bg-fm-surface-hover border-b border-fm-border">
                <th className="px-5 py-3">NAME</th>
                <th className="px-5 py-3">SECRET</th>
                <th className="px-5 py-3">CREATED</th>
                <th className="px-5 py-3">LAST USED</th>
                <th className="px-5 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-fm-text-dim">
                    No API keys yet. Click "Create key" to get started.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="border-b border-fm-border/50 last:border-0 hover:bg-fm-surface-hover transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-fm-text">{key.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="font-mono text-sm text-fm-text-dim bg-fm-bg px-2 py-1 rounded">
                        {maskSecret(key.key)}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-fm-text-muted text-sm">{key.createdAt}</td>
                    <td className="px-5 py-4 text-fm-text-muted text-sm">
                      {key.lastUsed || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onCopyKey(key.key, (key as any).rawKey)}
                          className="btn-ghost p-2"
                          title="Copy secret"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        {key.isActive ? (
                          <button
                            onClick={() => onRevokeKey(key.id)}
                            className="btn-ghost p-2 text-fm-red hover:bg-fm-red/10"
                            title="Revoke"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => onDeleteKey(key.id)}
                            className="btn-ghost p-2 text-fm-red hover:bg-fm-red/10"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v12m-6 0h12m-6 0v-3m0-6v-3M3 7h18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-fm-text">Create key</h2>
              <button onClick={handleClose} className="btn-ghost p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step 1: Key Name */}
            {step === 'name' && (
              <div className="modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Key name</label>
                    <input
                      type="text"
                      value={keyName}
                      onChange={e => { setKeyName(e.target.value); setError(''); }}
                      placeholder="e.g., Production Server"
                      className="input-field"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-fm-text-dim">
                    Give your key a memorable name. Telegram verification required for security.
                  </p>
                  {error && <p className="text-sm text-fm-red">{error}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Phone Number */}
            {step === 'phone' && (
              <div className="modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Telegram number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={e => { setPhoneNumber(e.target.value); setError(''); }}
                      placeholder="+62 8xx xxx xxxx"
                      className="input-field"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-fm-text-dim">
                    We'll send a 5-digit OTP to your Telegram. Make sure the number is registered.
                  </p>
                  {error && <p className="text-sm text-fm-red">{error}</p>}
                </div>
              </div>
            )}

            {/* Step 3: OTP */}
            {step === 'otp' && (
              <div className="modal-body">
                <div className="space-y-4">
                  <div>
                    <label className="input-label">OTP code (5 digits)</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 5)); setError(''); }}
                      placeholder="12345"
                      className="input-field text-2xl tracking-widest text-center font-mono"
                      autoFocus
                      maxLength={5}
                    />
                  </div>
                  <p className="text-sm text-fm-text-dim text-center">
                    OTP sent to Telegram <span className="text-fm-text">{phoneNumber}</span>
                  </p>
                  <p className="text-sm text-fm-text-dim text-center">Valid for 5 minutes</p>
                  {error && <p className="text-sm text-fm-red text-center">{error}</p>}
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="modal-body text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-fm-green/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-fm-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-fm-text mb-2">Key created!</h3>
                <p className="text-fm-text-muted mb-6">Save this now - it won't be shown again</p>
                <div className="bg-fm-bg border border-fm-border rounded-lg p-4 mb-4 text-left">
                  <code className="font-mono text-sm text-fm-text break-all">{rawKey}</code>
                </div>
                <button onClick={handleCopyRawKey} className="btn-primary w-full mb-3">
                  Copy key
                </button>
                <button onClick={handleClose} className="btn-secondary w-full">
                  Done
                </button>
              </div>
            )}

            <div className="modal-footer">
              {step === 'name' && (
                <button onClick={handleCreateStart} disabled={loading} className="btn-primary">
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              )}
              {step === 'phone' && (
                <>
                  <button onClick={() => setStep('name')} className="btn-secondary">Back</button>
                  <button onClick={handleSendOtp} disabled={loading} className="btn-primary">
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              )}
              {step === 'otp' && (
                <>
                  <button onClick={() => setStep('phone')} className="btn-secondary">Back</button>
                  <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary">
                    {loading ? 'Verifying...' : 'Verify & create'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}