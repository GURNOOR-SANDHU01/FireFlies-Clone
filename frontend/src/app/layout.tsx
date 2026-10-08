/**
 * File: src/app/layout.tsx
 *
 * Purpose:
 * Root Next.js App Router layout wrapping all pages in global theme and shell structure.
 *
 * Responsibilities:
 * - Load global CSS tokens and typography.
 * - Set document HTML title, meta tags, and charset.
 * - Render the AppShell wrapper surrounding active page children.
 *
 * This file does NOT:
 * - Contain route-specific business logic or data fetching.
 * - Render individual meeting detail views.
 */

import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Fireflies.ai - AI Meeting Assistant & Workspace',
  description:
    'Automated meeting transcription, AI summaries, smart search, and action-item tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fireflies_theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}

