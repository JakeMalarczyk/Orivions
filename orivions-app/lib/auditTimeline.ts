// Backward planner for a Solana audit, used by /tools/solana-audit-timeline-planner.
// The phase ranges match the article "How long does a Solana audit take"; the review
// phase reuses the audit cost calculator so the two tools never disagree.
import { estimateAudit, type AuditInput } from '@/lib/auditEstimate';

export interface Phase {
  id: string;
  label: string;
  note: string;
  /** Duration in days: [fast case, slow case]. */
  days: [number, number];
}

export const FIND_DAYS: [number, number] = [7, 14];
export const QUEUE_DAYS: [number, number] = [14, 56];
export const FIX_DAYS: [number, number] = [3, 14];
export const FIX_REVIEW_DAYS: [number, number] = [3, 10];

export function auditPhases(input: AuditInput): Phase[] {
  const review = estimateAudit({ ...input, fixReview: false });
  const phases: Phase[] = [
    { id: 'find', label: 'Find and book an auditor', note: 'Shortlist, scoping calls, quotes, contract', days: FIND_DAYS },
    { id: 'queue', label: 'Wait for the start date', note: 'Established firms are often booked weeks ahead', days: QUEUE_DAYS },
    { id: 'review', label: 'The review itself', note: 'From the audit cost calculator method', days: [review.weeks[0] * 7, review.weeks[1] * 7] },
    { id: 'fix', label: 'Fix the findings', note: 'Your team, partly in parallel with the report', days: FIX_DAYS },
  ];
  if (input.fixReview) {
    phases.push({ id: 'recheck', label: 'Fix review and final report', note: 'Auditors re-check every fix', days: FIX_REVIEW_DAYS });
  }
  return phases;
}

export interface TimelinePlan {
  phases: Phase[];
  totalDays: [number, number];
  /** Latest date to start contacting auditors: [comfortable, tight]. */
  contactBy: [Date, Date];
  status: 'comfortable' | 'tight' | 'late';
}

const DAY_MS = 86_400_000;

export function planTimeline(input: AuditInput, launch: Date, today: Date): TimelinePlan {
  const phases = auditPhases(input);
  const fast = phases.reduce((n, p) => n + p.days[0], 0);
  const slow = phases.reduce((n, p) => n + p.days[1], 0);
  const comfortable = new Date(launch.getTime() - slow * DAY_MS);
  const tight = new Date(launch.getTime() - fast * DAY_MS);
  const status = today <= comfortable ? 'comfortable' : today <= tight ? 'tight' : 'late';
  return { phases, totalDays: [fast, slow], contactBy: [comfortable, tight], status };
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
