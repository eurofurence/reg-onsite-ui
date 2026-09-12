import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type {
  MailAttendeeEntry,
  MailSendState,
  MailSendSummary,
} from "@/types/internal/mails";
import { MailSendStateValue } from "@/types/internal/mails";

export interface MailEntryCounts {
  sent: number;
  failed: number;
  pending: number;
  sending: number;
}

export function makeMailAttendeeEntry(
  attendee: TransformedAttendeeInfo
): MailAttendeeEntry {
  return {
    badgeId: attendee.id,
    email: attendee.email as string,
    nickname: attendee.nickname,
    firstName: attendee.first_name,
    lastName: attendee.last_name,
    state: MailSendStateValue.pending,
    detail: null,
  };
}

export function countMailEntryStates(
  entries: readonly MailAttendeeEntry[]
): MailEntryCounts {
  const counts: MailEntryCounts = {
    sent: 0,
    failed: 0,
    pending: 0,
    sending: 0,
  };
  for (const entry of entries) {
    counts[entry.state] += 1;
  }
  return counts;
}

export function getSendProgress(
  counts: MailEntryCounts,
  total: number
): number {
  if (total === 0) {
    return 0;
  }
  return ((counts.sent + counts.failed) / total) * 100;
}

export function stateTagSeverity(
  state: MailSendState
): "success" | "warn" | "danger" | "secondary" {
  switch (state) {
    case MailSendStateValue.sent:
      return "success";
    case MailSendStateValue.failed:
      return "danger";
    case MailSendStateValue.sending:
      return "warn";
    default:
      return "secondary";
  }
}

const _ERROR_KEY_LABELS: Record<string, string> = {
  "attendee.notfound.error": "Attendee not found",
  "attendee.nobulkmail.error": "Attendee has opted out of bulk mail",
  "attendee.noemail.error": "Attendee has no email address",
};

function _translateDetail(detail: string | null): string {
  if (detail === null) return "Unknown error";
  return _ERROR_KEY_LABELS[detail] ?? detail;
}

export function getEntryFailureDetail(
  summary: MailSendSummary | undefined,
  email: string,
  badgeId: number | null,
  fallbackDetail: string
): string {
  if (summary === undefined) {
    return fallbackDetail;
  }
  const failure = summary.failures.find(
    (candidate) =>
      candidate.recipient === email ||
      (badgeId !== null && candidate.attendee_id === badgeId)
  );
  if (failure === undefined) {
    return "Unknown error";
  }
  const detail = _translateDetail(failure.detail);
  return failure.status_code === null
    ? detail
    : `HTTP ${failure.status_code}: ${detail}`;
}