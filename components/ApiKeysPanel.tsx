'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ApiKey } from '@/types';

interface ApiKeysPanelProps {
  keys: ApiKey[];
  onCreateKey: (name: string, phoneNumber: string) => Promise<void>;
  onRevokeKey: (keyId: string) => Promise<void>;
  onDeleteKey: (keyId: string) => Promise<void>;
  onToggleKey: (keyId: string) => Promise<void>;
  onCopyKey: (key: string, rawKey?: string) => void;
  creatingKey?: boolean;
}

export function ApiKeysPanel({
  keys,
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
      setError('Nama key wajib diisi');
      return;
    }
    setError('');
    setStep('phone');
  }, [keyName]);

  const handleSendOtp = useCallback(async () => {
    if (!phoneNumber.trim()) {
      setError('Nomor Telegram wajib diisi');
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
        setError(data.message || 'Gagal mengirim OTP');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Kode OTP 6 digit wajib diisi');
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
        // Now create the key
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
          setError(createData.error || 'Gagal membuat key');
        }
      } else {
        setError(data.message || 'Kode OTP salah');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
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

  return (
    <>
      {/* Create Key Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        disabled={creatingKey}
        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Create API Key</span>
      </button>

      {/* API Keys List */}
      <div className="space-y-3 mt-6">
        {keys.length === 0 ? (
          <div className="text-center py-12 bg-fm-surface/50 rounded-xl border border-fm-border">
            <svg className="w-12 h-12 mx-auto text-fm-text-dim mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="text-fm-text-muted">Belum ada API key</p>
            <p className="text-sm text-fm-text-dim mt-1">Klik "Create API Key" untuk membuat key baru</p>
          </div>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="bg-fm-surface border border-fm-border rounded-xl p-4 transition-all hover:border-fm-green/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-fm-text truncate">{key.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      key.isActive 
                        ? 'bg-fm-green/10 text-fm-green border border-fm-green/20' 
                        : 'bg-fm-red/10 text-fm-red border border-fm-red/20'
                    }`}>
                      {key.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-fm-text-muted">
                    <span className="font-mono text-fm-text-dim bg-fm-bg px-2 py-1 rounded">{key.prefix}••••</span>
                    <span>Created {key.createdAt}</span>
                    {key.lastUsed && <span>Last used {key.lastUsed}</span>}
                    <span>{key.requests.toLocaleString()} requests</span>
                    <span>{key.tokens.toLocaleString()} tokens</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onCopyKey(key.key, (key as any).rawKey)}
                    className="btn-ghost p-2"
                    title="Copy key"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  {key.isActive ? (
                    <button
                      onClick={() => onRevokeKey(key.id)}
                      className="btn-ghost p-2 text-fm-red hover:bg-fm-red/10"
                      title="Revoke key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => onDeleteKey(key.id)}
                      className="btn-ghost p-2 text-fm-red hover:bg-fm-red/10"
                      title="Delete key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v12m-6 0h12m-6 0v-3m0-6v-3M3 7h18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-fm-text">Create API Key</h2>
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
                    <label className="input-label">Key Name</label>
                    <input
                      type="text"
                      value={keyName}
                      onChange={e => { setKeyName(e.target.value); setError(''); }}
                      placeholder="e.g., Production Server, My App"
                      className="input-field"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-fm-text-dim">
                    Berikan nama yang mudah diingat untuk key ini. Verifikasi Telegram diperlukan untuk keamanan.
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
                    <label className="input-label">Nomor Telegram</label>
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
                    Kami akan mengirim kode OTP 6 digit ke Telegram Anda. Pastikan nomor sudah terdaftar di Telegram.
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
                    <label className="input-label">Kode OTP (6 Digit)</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      placeholder="123456"
                      className="input-field text-2xl tracking-widest text-center font-mono"
                      autoFocus
                      maxLength={6}
                    />
                  </div>
                  <p className="text-sm text-fm-text-dim text-center">
                    Kode OTP telah dikirim ke Telegram <span className="text-fm-text">{phoneNumber}</span>
                  </p>
                  <p className="text-sm text-fm-text-dim text-center">Berlaku 5 menit</p>
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
                <h3 className="text-xl font-semibold text-fm-text mb-2">API Key Dibuat!</h3>
                <p className="text-fm-text-muted mb-6">Simpan key ini sekarang - tidak akan ditampilkan lagi</p>
                <div className="bg-fm-bg border border-fm-border rounded-lg p-4 mb-4 text-left">
                  <code className="font-mono text-sm text-fm-text break-all">{rawKey}</code>
                </div>
                <button
                  onClick={handleCopyRawKey}
                  className="btn-primary w-full mb-3"
                >
                  Copy Key
                </button>
                <button
                  onClick={handleClose}
                  className="btn-secondary w-full"
                >
                  Done
                </button>
              </div>
            )}

            <div className="modal-footer">
              {step === 'name' && (
                <button onClick={handleCreateStart} disabled={loading} className="btn-primary">
                  {loading ? 'Memproses...' : 'Lanjutkan'}
                </button>
              )}
              {step === 'phone' && (
                <>
                  <button onClick={() => setStep('name')} className="btn-secondary">Kembali</button>
                  <button onClick={handleSendOtp} disabled={loading} className="btn-primary">
                    {loading ? 'Mengirim...' : 'Kirim OTP'}
                  </button>
                </>
              )}
              {step === 'otp' && (
                <>
                  <button onClick={() => setStep('phone')} className="btn-secondary">Kembali</button>
                  <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary">
                    {loading ? 'Memverifikasi...' : 'Verifikasi & Buat Key'}
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