/**
 * File: src/components/layout/Sidebar.tsx
 *
 * Purpose:
 * Primary left-hand navigation sidebar for the Fireflies application shell.
 *
 * Responsibilities:
 * - Render brand logo linking back to the dashboard (/).
 * - Render functional navigation items (Meetings, Active Workspace) via Next.js Links with usePathname().
 * - Ensure active navigation state strictly reflects the current URL (/ and /meetings/[id]).
 * - Distinguish between functional routes and explicitly labeled placeholder items.
 * - Support responsive collapse/expand toggling without breaking navigation or layout.
 * - Provide a theme switcher (Dark / Light) in both expanded and collapsed states.
 * - Render Fred assistant status indicator in both expanded and collapsed modes.
 *
 * This component does NOT:
 * - Fetch workspace or meeting statistics directly from APIs.
 * - Contain route-specific meeting page logic.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FireflyLogo,
  CalendarIcon,
  VideoIcon,
  CheckCircleIcon,
  SparklesIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from '@/components/common/Icons';
import { useTheme } from '@/context/ThemeContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isDashboardActive = pathname === '/';
  const isMeetingWorkspaceActive = pathname.startsWith('/meetings');

  // Placeholder items outside assignment scope
  const placeholderItems = [
    {
      label: 'Action Items',
      icon: <CheckCircleIcon size={18} />,
      tooltip: 'Placeholder — Action items are fully functional inside each meeting workspace',
    },
    {
      label: 'AI Summaries',
      icon: <SparklesIcon size={18} />,
      tooltip: 'Placeholder — AI summaries and takeaways are available inside each meeting workspace',
    },
    {
      label: 'Team & Speakers',
      icon: <UsersIcon size={18} />,
      tooltip: 'Placeholder — Speaker diarization is available inside each meeting workspace',
    },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '68px' : '260px',
        height: '100vh',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color var(--transition-fast)',
        overflowX: 'hidden',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '1.25rem 0.5rem' : '1.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '0.5rem',
        }}
      >
        <Link
          href="/"
          title="Fireflies.ai - Return to Dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit',
            minWidth: 0,
            flex: isCollapsed ? 'none' : 1,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <FireflyLogo size={32} />
          {!isCollapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Fireflies<span style={{ color: 'var(--primary)' }}>.ai</span>
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Meeting Workspace
              </div>
            </div>
          )}
        </Link>

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            color: 'var(--text-muted)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            transition: 'all var(--transition-fast)',
            flexShrink: 0,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
        </button>
      </div>

      {/* Primary Navigation */}
      <nav
        style={{
          padding: isCollapsed ? '1rem 0.4rem' : '1rem 0.75rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '0.5rem 0.75rem',
            }}
          >
            Navigation
          </div>
        )}

        {/* Functional Link: Meetings Dashboard */}
        <Link
          href="/"
          title="Meetings Dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0.65rem' : '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: isDashboardActive ? 600 : 500,
            color: isDashboardActive ? 'var(--text-primary)' : 'var(--text-muted)',
            backgroundColor: isDashboardActive ? 'var(--primary-faint)' : 'transparent',
            border: isDashboardActive ? '1px solid var(--border-focus)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isDashboardActive) {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDashboardActive) {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              minWidth: 0,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            <span
              style={{
                color: isDashboardActive ? 'var(--primary)' : 'inherit',
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <CalendarIcon size={18} />
            </span>
            {!isCollapsed && (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Meetings
              </span>
            )}
          </div>
        </Link>

        {/* Functional Link: Meeting Workspace (Shown when on /meetings/[id]) */}
        {isMeetingWorkspaceActive && (
          <Link
            href={pathname}
            title="Active Meeting Workspace"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '0.65rem' : '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--primary-faint)',
              border: '1px solid var(--border-focus)',
              transition: 'all var(--transition-fast)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: 0,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
            >
              <span
                style={{
                  color: 'var(--primary)',
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <VideoIcon size={18} />
              </span>
              {!isCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Workspace
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                }}
              >
                Active
              </span>
            )}
          </Link>
        )}

        {/* Section divider for placeholders */}
        {!isCollapsed && (
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '0.75rem 0.75rem 0.25rem',
              marginTop: '0.25rem',
            }}
          >
            Modules
          </div>
        )}

        {/* Explicitly labeled placeholder items */}
        {placeholderItems.map((item) => (
          <div
            key={item.label}
            title={item.tooltip}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: isCollapsed ? '0.65rem' : '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              opacity: 0.75,
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                minWidth: 0,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
            >
              <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-faint)' }}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  padding: '0.1rem 0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-faint)',
                  border: '1px solid var(--border-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Soon
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Theme Switcher in Sidebar */}
      <div
        style={{
          padding: isCollapsed ? '0.75rem 0.4rem' : '0.75rem 0.75rem',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          aria-label={theme === 'dark' ? 'Switch to Light theme' : 'Switch to Dark theme'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0.6rem' : '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--border-medium)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ display: 'flex', color: 'var(--primary)' }}>
              {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </span>
            {!isCollapsed && <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>}
          </div>
          {!isCollapsed && (
            <span
              style={{
                fontSize: '0.65rem',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                textTransform: 'capitalize',
              }}
            >
              {theme}
            </span>
          )}
        </button>
      </div>

      {/* Workspace Live Status Box */}
      {!isCollapsed ? (
        <div
          style={{
            margin: '0.5rem 0.75rem 0.75rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-completed)',
                boxShadow: '0 0 8px var(--status-completed)',
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Fred Assistant Active
            </span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.35, marginBottom: '0.5rem' }}>
            Auto-joining meetings and generating transcripts.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: 'var(--text-faint)',
            }}
          >
            <span>Storage: 4.2 / 50 hrs</span>
            <span style={{ color: 'var(--accent-purple)' }}>8%</span>
          </div>
          <div
            style={{
              height: '4px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-full)',
              marginTop: '0.25rem',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '8%',
                height: '100%',
                backgroundColor: 'var(--accent-purple)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
        </div>
      ) : (
        <div
          title="Fred Assistant Active - 4.2 / 50 hrs used"
          style={{
            margin: '0.5rem auto 0.75rem',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-completed)',
              boxShadow: '0 0 8px var(--status-completed)',
            }}
          />
        </div>
      )}
    </aside>
  );
};
