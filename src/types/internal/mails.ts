export interface MailTemplate {
  cid: string;
  lang: string;
  subject: string | null;
  text: string | null;
  html: string | null;
}

export interface MailTemplateList {
  templates: MailTemplate[];
}

export interface MailFailure {
  attendee_id: number | null;
  recipient: string;
  status_code: number | null;
  detail: string | null;
}

export interface MailSendEntry {
  attendee_id: number | null;
  recipient: string;
  status_code: number | null;
  attendee_lang: string | null;
  template_lang: string | null;
}

export interface MailSendSummary {
  total: number;
  sent: number;
  failed: number;
  sent_entries: MailSendEntry[];
  failures: MailFailure[];
}

export const enum MailSendStateValue {
  pending = "pending",
  sending = "sending",
  sent = "sent",
  failed = "failed",
}
export type MailSendState = `${MailSendStateValue}`;

export interface MailAttendeeEntry {
  badgeId: number | null;
  email: string;
  nickname: string | null;
  firstName: string | null;
  lastName: string | null;
  state: MailSendState;
  detail: string | null;
}

export interface MassMailRequest {
  cid: string;
  attendee_ids: number[];
  cc: string[];
  bcc: string[];
  variables: Record<string, string>;
}

export interface MailPreviewRequest {
  cid: string;
  lang: string;
  attendee_ids: number[];
  variables: Record<string, string>;
}

export interface MailPreviewEntry {
  id: number;
  email: string | null;
  variables: Record<string, string>;
  subject: string | null;
  text: string | null;
  html: string | null;
  error?: string | null;
}

export interface MailPreviewResult {
  recipients: MailPreviewEntry[];
}

export interface MailSendPacingConfig {
  ratePerMinute: number;
  batchSize: number;
  backoffSeconds: number;
  rateFactor: number;
  minRatePerMinute: number;
  maxConsecutiveErrors: number;
}

export const DEFAULT_MAIL_SEND_PACING: MailSendPacingConfig = {
  ratePerMinute: 20,
  batchSize: 1,
  backoffSeconds: 10,
  rateFactor: 0.5,
  minRatePerMinute: 2,
  maxConsecutiveErrors: 10,
};
