/**
 * File: src/components/layout/AppShell.tsx
 *
 * Purpose:
 * Top-level application shell uniting sidebar, header navigation, and scrollable content area.
 *
 * Responsibilities:
 * - Structure the layout grid (Sidebar + Header + Page Content).
 * - Manage global modal state (e.g. New Meeting creation modal triggered from header).
 *
 * This component does NOT:
 * - Query meetings data directly (delegated to pages or feature hooks).
 * - Contain specific page presentation logic.
 */

'use client';

import React, { useState, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { NewMeetingModal } from '@/components/dashboard/NewMeetingModal';
import { useMeetings } from '@/hooks/useMeetings';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const { createMeeting } = useMeetings();

  return (
    <div className="app-container">
      {/* Permanent Left Sidebar */}
      <Suspense fallback={<aside style={{ width: '260px', backgroundColor: 'var(--bg-sidebar)' }} />}>
        <Sidebar />
      </Suspense>

      {/* Main Right Area */}
      <div className="main-content">
        <TopNav onNewMeetingClick={() => setIsNewMeetingOpen(true)} />
        <main className="scrollable-content">{children}</main>
      </div>

      {/* Quick Add Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingOpen}
        onClose={() => setIsNewMeetingOpen(false)}
        onSubmit={async (input) => {
          await createMeeting(input);
          // Optional window reload/event or state dispatch
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('meeting-created'));
          }
        }}
      />
    </div>
  );
};
