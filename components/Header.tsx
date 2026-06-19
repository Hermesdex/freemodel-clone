'use client';

import { useState } from 'react';
import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <header className="h-16 bg-fm-surface/80 backdrop-blur-xl border-b border-fm-border sticky top-0 z-30 lg:ml-0">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Mobile menu button + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="btn-ghost p-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fm-green flex items-center justify-center">
              <svg className="w-5 h-5 text-fm-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-fm-text">
              <span className="text-fm-text">Free</span><span className="text-fm-green">Model</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="btn-ghost p-2"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="btn-ghost p-2 relative" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-fm-red rounded-full" />
          </button>

          {/* TG Group FAB - only on mobile, desktop has it in sidebar */}
          <a
            href="https://t.me/freemodel"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex tg-fab"
            aria-label="Join Telegram Group"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.931 7.614l-1.342 1.277c-.287.295-.729.246-1.013-.082l-3.178-3.678c-.81-.913-3.093-.33-3.379 1.129l-.536 2.766 2.999 3.214c.207.213.183.562-.028.762l-1.492 1.437c-.316.295-.8-.038-1.029-.367l-2.492-3.605v.008c-.123 3.937 3.195 7.145 7.098 6.63.231-.031.469-.041.713-.041.53 0 1.055.043 1.567.122.375.059.745.145 1.091.293l3.603 2.039c.751.414 1.742-.004 2.038-.854l.524-1.609c.08-.267.074-.552.006-.812l-1.774-6.813c-.164-.572-.673-.94-1.233-.836z"/>
            </svg>
            <span>TG Group</span>
          </a>
        </div>
      </div>
    </header>
  );
}