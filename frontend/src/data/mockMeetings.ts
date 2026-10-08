/**
 * File: src/data/mockMeetings.ts
 *
 * Purpose:
 * Provides realistic, seeded mock meeting data for the frontend workspace and dashboard.
 *
 * Responsibilities:
 * - Define sample meeting records matching the Meeting domain interface.
 * - Serve as the mock database for client-side prototype and offline development.
 *
 * This file does NOT:
 * - Query external APIs or database drivers.
 * - Mutate persistent server state.
 * - Contain UI presentation logic.
 */

import { Meeting } from '@/types/meeting';

export const INITIAL_MOCK_MEETINGS: Meeting[] = [
  {
    id: 'meet-001',
    title: 'Product Strategy & Q4 Roadmap Alignment',
    description: 'Quarterly roadmap planning covering AI transcription features, user retention metrics, and API platform launch.',
    date: '2026-10-07T14:30:00Z',
    duration: 1845, // ~30m 45s
    status: 'completed',
    platform: 'google_meet',
    attendees: [
      { id: 'att-1', name: 'Elena Rostova', email: 'elena@fireflies.ai', isHost: true },
      { id: 'att-2', name: 'Marcus Chen', email: 'marcus@fireflies.ai' },
      { id: 'att-3', name: 'Aaliyah Patel', email: 'aaliyah@fireflies.ai' },
      { id: 'att-4', name: 'David Kim', email: 'david@fireflies.ai' }
    ],
    tags: ['Product', 'Roadmap', 'Q4 Strategy'],
    summaryPreview: 'Agreed on prioritising low-latency audio streaming for the upcoming v2 release. Marcus will draft the API specification by Friday, and Elena will finalize budget headcount.',
    actionItemsCount: 4,
    completedActionItemsCount: 2,
    transcriptSegmentsCount: 28,
    createdAt: '2026-10-07T14:00:00Z',
    updatedAt: '2026-10-07T15:10:00Z'
  },
  {
    id: 'meet-002',
    title: 'AI Pipeline Architecture & Speech Model Benchmarks',
    description: 'Technical deep-dive on diarization accuracy, Whisper fine-tuning latency, and fallback mechanisms.',
    date: '2026-10-06T10:00:00Z',
    duration: 2520, // 42m
    status: 'completed',
    platform: 'zoom',
    attendees: [
      { id: 'att-2', name: 'Marcus Chen', email: 'marcus@fireflies.ai', isHost: true },
      { id: 'att-5', name: 'Sophia Becker', email: 'sophia@fireflies.ai' },
      { id: 'att-6', name: 'Tariq Johnson', email: 'tariq@fireflies.ai' }
    ],
    tags: ['Engineering', 'AI Architecture', 'Performance'],
    summaryPreview: 'Evaluated benchmark models across noisy enterprise calls. Decided to decouple speaker diarization from chunked transcription to improve time-to-first-token by 35%.',
    actionItemsCount: 5,
    completedActionItemsCount: 1,
    transcriptSegmentsCount: 44,
    createdAt: '2026-10-06T09:50:00Z',
    updatedAt: '2026-10-06T11:00:00Z'
  },
  {
    id: 'meet-003',
    title: 'Customer Advisory Board: Enterprise Workspace Feedback',
    description: 'Direct feedback session with Acme Corp and StarkTech design partners regarding summary sharing and permissions.',
    date: '2026-10-05T16:00:00Z',
    duration: 3180, // 53m
    status: 'completed',
    platform: 'teams',
    attendees: [
      { id: 'att-1', name: 'Elena Rostova', email: 'elena@fireflies.ai', isHost: true },
      { id: 'att-7', name: 'Rachel Vance (Acme)', email: 'rachel@acmeworks.com' },
      { id: 'att-8', name: 'Bruce Wayne (WayneTech)', email: 'bruce@waynetech.com' },
      { id: 'att-3', name: 'Aaliyah Patel', email: 'aaliyah@fireflies.ai' }
    ],
    tags: ['Customer Feedback', 'Enterprise', 'Design Partners'],
    summaryPreview: 'Customer feedback on workspace permissions was overwhelmingly positive. Requested feature: automatic Slack notification when action items are tagged with specific owners.',
    actionItemsCount: 3,
    completedActionItemsCount: 3,
    transcriptSegmentsCount: 52,
    createdAt: '2026-10-05T15:45:00Z',
    updatedAt: '2026-10-05T17:05:00Z'
  },
  {
    id: 'meet-004',
    title: 'Engineering Sprint 42 Planning & Backlog Refinement',
    description: 'Bi-weekly sprint planning focusing on SQLite persistence, database indexing, and transcript audio synchronization.',
    date: '2026-10-04T09:15:00Z',
    duration: 1950, // 32m 30s
    status: 'completed',
    platform: 'google_meet',
    attendees: [
      { id: 'att-2', name: 'Marcus Chen', email: 'marcus@fireflies.ai', isHost: true },
      { id: 'att-4', name: 'David Kim', email: 'david@fireflies.ai' },
      { id: 'att-6', name: 'Tariq Johnson', email: 'tariq@fireflies.ai' }
    ],
    tags: ['Sprint Planning', 'Engineering', 'Scrum'],
    summaryPreview: 'Committed 38 story points for Sprint 42. Primary epic is synchronizing playback timeline with interactive transcript segments and building responsive filters.',
    actionItemsCount: 6,
    completedActionItemsCount: 4,
    transcriptSegmentsCount: 36,
    createdAt: '2026-10-04T09:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z'
  },
  {
    id: 'meet-005',
    title: 'Client Demo & Sales Discovery: FinCorp Global',
    description: 'Demonstrating automated meeting summaries, sentiment analysis, and CRM sync to FinCorp leadership team.',
    date: '2026-10-03T11:30:00Z',
    duration: 2100, // 35m
    status: 'completed',
    platform: 'zoom',
    attendees: [
      { id: 'att-3', name: 'Aaliyah Patel', email: 'aaliyah@fireflies.ai', isHost: true },
      { id: 'att-9', name: 'Nathan Drake (FinCorp)', email: 'ndrake@fincorp.io' },
      { id: 'att-10', name: 'Chloe Frazer (FinCorp)', email: 'cfrazer@fincorp.io' }
    ],
    tags: ['Sales', 'Demo', 'Enterprise'],
    summaryPreview: 'FinCorp expressed high interest in automated action-item tracking and SOC2 compliance. Scheduled follow-up security review call for next Tuesday.',
    actionItemsCount: 2,
    completedActionItemsCount: 1,
    transcriptSegmentsCount: 31,
    createdAt: '2026-10-03T11:15:00Z',
    updatedAt: '2026-10-03T12:15:00Z'
  },
  {
    id: 'meet-006',
    title: 'Design Critique: Workspace Sidebar & Media Scrubbing',
    description: 'UI/UX review of playback scrubber, transcript match highlight states, and responsive drawer transitions.',
    date: '2026-10-02T15:00:00Z',
    duration: 1560, // 26m
    status: 'completed',
    platform: 'in_person',
    attendees: [
      { id: 'att-1', name: 'Elena Rostova', email: 'elena@fireflies.ai', isHost: true },
      { id: 'att-5', name: 'Sophia Becker', email: 'sophia@fireflies.ai' },
      { id: 'att-4', name: 'David Kim', email: 'david@fireflies.ai' }
    ],
    tags: ['Design', 'UI/UX', 'Critique'],
    summaryPreview: 'Approved high-contrast dark theme tokens and pill badges. Refined seek bar hover tooltip to show elapsed time preview before clicking.',
    actionItemsCount: 3,
    completedActionItemsCount: 2,
    transcriptSegmentsCount: 22,
    createdAt: '2026-10-02T14:45:00Z',
    updatedAt: '2026-10-02T15:40:00Z'
  },
  {
    id: 'meet-007',
    title: 'Podcast Audio Upload: The Future of Autonomous Agents',
    description: 'Guest appearance discussion on AI workflows, LLM orchestration, and meeting intelligence.',
    date: '2026-10-01T18:00:00Z',
    duration: 3600, // 60m
    status: 'completed',
    platform: 'audio_upload',
    attendees: [
      { id: 'att-1', name: 'Elena Rostova', email: 'elena@fireflies.ai', isHost: true },
      { id: 'att-11', name: 'Alex Rivera (Host)', email: 'alex@aipodcast.dev' }
    ],
    tags: ['Podcast', 'Audio Upload', 'Marketing'],
    summaryPreview: 'In-depth conversation covering future developer tools, structured knowledge retrieval from team meetings, and autonomous pair-programming paradigms.',
    actionItemsCount: 1,
    completedActionItemsCount: 0,
    transcriptSegmentsCount: 68,
    createdAt: '2026-10-01T17:30:00Z',
    updatedAt: '2026-10-01T19:10:00Z'
  }
];
