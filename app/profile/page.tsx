'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { User, Mail, Lock, Bell, Shield, Palette, Save } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-fm-text-dim mb-1">§ PROFILE</p>
        <h1 className="text-3xl font-bold text-fm-text">Profile Settings</h1>
        <p className="text-fm-text-muted mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-fm-surface border border-fm-border rounded-xl p-4 sticky top-24">
            <div className="flex items-center gap-3 p-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-fm-green flex items-center justify-center">
                <span className="text-fm-bg font-semibold text-xl">C</span>
              </div>
              <div>
                <p className="font-semibold text-fm-text">Coin Pump</p>
                <p className="text-sm text-fm-text-dim">coinpump83@gmail.com</p>
              </div>
            </div>
            <nav className="space-y-1" aria-label="Profile sections">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-fm-green/10 text-fm-green'
                      : 'text-fm-text-muted hover:bg-fm-surface-hover hover:text-fm-text'
                  }`}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-fm-surface border border-fm-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-fm-text mb-6">Profile Information</h2>
              <div className="space-y-5 max-w-xl">
                <div>
                  <label className="input-label">Display Name</label>
                  <input type="text" defaultValue="Coin Pump" className="input-field" />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input type="email" defaultValue="coinpump83@gmail.com" className="input-field" />
                  <p className="text-sm text-fm-text-dim mt-1">Verified <span className="text-fm-green">✓</span></p>
                </div>
                <div>
                  <label className="input-label">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fm-text-dim">@</span>
                    <input type="text" defaultValue="coinpump" className="input-field pl-8" />
                  </div>
                </div>
                <div>
                  <label className="input-label">Bio</label>
                  <textarea rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." />
                </div>
                <button className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-fm-surface border border-fm-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-fm-text mb-6">Security Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div className="flex items-center justify-between p-4 bg-fm-bg rounded-lg border border-fm-border">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-fm-text-muted" />
                    <div>
                      <p className="font-medium text-fm-text">Two-Factor Authentication</p>
                      <p className="text-sm text-fm-text-dim">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-fm-bg rounded-lg border border-fm-border">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-fm-text-muted" />
                    <div>
                      <p className="font-medium text-fm-text">Change Password</p>
                      <p className="text-sm text-fm-text-dim">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="btn-secondary">Change</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-fm-bg rounded-lg border border-fm-border">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-fm-text-muted" />
                    <div>
                      <p className="font-medium text-fm-text">Active Sessions</p>
                      <p className="text-sm text-fm-text-dim">Manage your logged-in devices</p>
                    </div>
                  </div>
                  <button className="btn-secondary">View Sessions</button>
                </div>
                <div className="border-t border-fm-border pt-6">
                  <h3 className="font-medium text-fm-text mb-4">Danger Zone</h3>
                  <button className="btn-danger">Delete Account</button>
                  <p className="text-sm text-fm-text-dim mt-2">This action is irreversible. All your data will be permanently deleted.</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-fm-surface border border-fm-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-fm-text mb-6">Notification Preferences</h2>
              <div className="space-y-4 max-w-xl">
                {[
                  { title: 'Email Notifications', desc: 'Receive important updates via email', enabled: true },
                  { title: 'Usage Alerts', desc: 'Get notified when approaching limits', enabled: true },
                  { title: 'Billing Receipts', desc: 'Receive invoice copies by email', enabled: true },
                  { title: 'Product Updates', desc: 'Learn about new features and improvements', enabled: false },
                  { title: 'Security Alerts', desc: 'Critical security notifications', enabled: true },
                  { title: 'Marketing Emails', desc: 'Tips, tutorials, and promotional content', enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-fm-bg rounded-lg border border-fm-border">
                    <div>
                      <p className="font-medium text-fm-text">{item.title}</p>
                      <p className="text-sm text-fm-text-dim">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-fm-border peer-focus:ring-2 peer-focus:ring-fm-green rounded-full peer peer-checked:bg-fm-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-fm-surface border border-fm-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-fm-text mb-6">Appearance</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="font-medium text-fm-text mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'dark', label: 'Dark', icon: '🌙' },
                      { id: 'light', label: 'Light', icon: '☀️' },
                      { id: 'system', label: 'System', icon: '💻' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          theme.id === 'dark'
                            ? 'border-fm-green bg-fm-green/5'
                            : 'border-fm-border hover:border-fm-green/30'
                        }`}
                      >
                        <div className="text-2xl mb-1">{theme.icon}</div>
                        <div className="font-medium text-fm-text">{theme.label}</div>
                        <div className="text-sm text-fm-text-dim">{theme.id === 'system' ? 'Matches OS' : 'Fixed theme'}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-fm-text mb-4">Compact Mode</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-fm-border peer-focus:ring-2 peer-focus:ring-fm-green rounded-full peer peer-checked:bg-fm-green peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    <span className="ml-3 text-fm-text">Reduce spacing and density</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}