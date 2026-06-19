'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Key,
  Activity,
  FileText,
  CreditCard,
  Star,
  User,
  BookOpen,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'API Keys', href: '/keys', icon: Key },
  { name: 'Usage', href: '/usage', icon: Activity },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

const accountNavigation = [
  { name: 'Refer & Earn', href: '/refer', icon: Star },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Docs', href: '/docs', icon: BookOpen },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          'sidebar-overlay',
          isOpen && 'sidebar-overlay-open'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'sidebar-mobile',
          isOpen ? 'sidebar-open' : 'sidebar-closed'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-fm-border">
            <Link href="/" className="flex items-center gap-2" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-fm-green flex items-center justify-center">
                <svg className="w-5 h-5 text-fm-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span className="font-semibold text-lg text-fm-text">
                <span className="text-fm-text">Free</span><span className="text-fm-green">Model</span>
              </span>
            </Link>
            <button
              onClick={onClose}
              className="btn-ghost p-1.5 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Workspace">
            <div className="sidebar-section-title">WORKSPACE</div>
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'sidebar-item',
                    isActive && 'sidebar-item-active'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Account Navigation */}
          <nav className="px-3 pb-4 space-y-1" aria-label="Account">
            <div className="sidebar-section-title">ACCOUNT</div>
            {accountNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'sidebar-item',
                  pathname === item.href && 'sidebar-item-active'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-fm-border p-3">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-fm-surface-hover transition-colors"
              aria-expanded={showAccountMenu}
              aria-haspopup="true"
            >
              <div className="w-9 h-9 rounded-full bg-fm-green flex items-center justify-center flex-shrink-0">
                <span className="text-fm-bg font-semibold text-base">C</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-fm-text truncate flex items-center gap-1.5">
                  Coin Pump
                  <svg className="w-4 h-4 text-fm-blue flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </p>
                <p className="text-xs text-fm-text-dim truncate">coinpump83@gmail.com</p>
              </div>
              <svg
                className={cn(
                  'w-4 h-4 text-fm-text-dim flex-shrink-0 transition-transform',
                  showAccountMenu && 'rotate-180'
                )}
                aria-hidden="true"
              >
                <ChevronDown />
              </svg>
            </button>

            {showAccountMenu && (
              <div className="mt-2 space-y-1 animate-fade-in" role="menu">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="sidebar-item"
                  role="menuitem"
                >
                  <User className="w-5 h-5" aria-hidden="true" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="/billing"
                  onClick={onClose}
                  className="sidebar-item"
                  role="menuitem"
                >
                  <CreditCard className="w-5 h-5" aria-hidden="true" />
                  <span>Billing & Plans</span>
                </Link>
                <a
                  href="https://t.me/freemodel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-item text-fm-blue"
                  role="menuitem"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.931 7.614l-1.342 1.277c-.287.295-.729.246-1.013-.082l-3.178-3.678c-.81-.913-3.093-.33-3.379 1.129l-.536 2.766 2.999 3.214c.207.213.183.562-.028.762l-1.492 1.437c-.316.295-.8-.038-1.029-.367l-2.492-3.605v.008c-.123 3.937 3.195 7.145 7.098 6.63.231-.031.469-.041.713-.041.53 0 1.055.043 1.567.122.375.059.745.145 1.091.293l3.603 2.039c.751.414 1.742-.004 2.038-.854l.524-1.609c.08-.267.074-.552.006-.812l-1.774-6.813c-.164-.572-.673-.94-1.233-.836z"/>
                  </svg>
                  <span>Join Telegram</span>
                </a>
                <hr className="border-fm-border my-1" />
                <button className="sidebar-item text-fm-red" role="menuitem">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}