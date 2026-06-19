import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FreeModel - AI Model API Dashboard',
  description: 'Manage your API keys, monitor usage, and scale your AI applications',
  keywords: ['AI', 'API', 'dashboard', 'FreeModel', 'machine learning'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-fm-bg text-fm-text">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}