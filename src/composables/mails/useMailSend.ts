import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { mailService } from "@/composables/services/mailService";
import {
  countMailEntryStates,
  getEntryFailureDetail,
  getSendProgress,
  type MailEntryCounts,
} from "@/composables/services/mails/mailEntryState";
import {
  createSendRunSignal,
  formatDuration,
  getMailIntervalMs,
  sendSequentiallyWithRateLimit,
  type PacingUpdate,
  type SendRunSignal,
} from "@/composables/services/mails/mailSendPacing";
import type {
  MailAttendeeEntry,
  MailSendPacingConfig,
  MailSendSummary,
  MailTemplate,
  MassMailRequest,
} from "@/types/internal/mails";
import {
  DEFAULT_MAIL_SEND_PACING,
  MailSendStateValue,
} from "@/types/internal/mails";
import {
  computed,
  ref,
  type ComputedRef,
  type Ref,
} from "vue";

interface UseMailSendOptions {
  entries: Ref<MailAttendeeEntry[]>;
  template: ComputedRef<MailTemplate | null>;
  variableOverrides: Ref<Record<string, string>>;
  errorHandler: RestErrorHandler;
}

export interface MailSendController {
  pacing: Ref<MailSendPacingConfig>;
  sending: Ref<boolean>;
  stopped: Ref<boolean>;
  effectiveRate: Ref<number>;
  displayedRate: ComputedRef<number>;
  backoffNotice: Ref<string | null>;
  abortNotice: Ref<string | null>;
  stopNotice: Ref<string | null>;
  counts: ComputedRef<MailEntryCounts>;
  progressPercent: ComputedRef<number>;
  estimatedRemainingMs: ComputedRef<number>;
  send: (retryOnly: boolean) => void;
  stop: () => void;
}

export function useMailSend(
  options: UseMailSendOptions
): MailSendController {
  const pacing: Ref<MailSendPacingConfig> = ref({
    ...DEFAULT_MAIL_SEND_PACING,
  });
  const sending: Ref<boolean> = ref(false);
  const stopped: Ref<boolean> = ref(false);
  const effectiveRate: Ref<number> = ref(
    DEFAULT_MAIL_SEND_PACING.ratePerMinute
  );
  const backoffNotice: Ref<string | null> = ref(null);
  const abortNotice: Ref<string | null> = ref(null);
  const stopNotice: Ref<string | null> = ref(null);
  const runSignal: Ref<SendRunSignal | null> = ref(null);

  const displayedRate: ComputedRef<number> = computed(() =>
    sending.value ? effectiveRate.value : pacing.value.ratePerMinute
  );

  const counts: ComputedRef<MailEntryCounts> = computed(() =>
    countMailEntryStates(options.entries.value)
  );

  const progressPercent: ComputedRef<number> = computed(() =>
    getSendProgress(counts.value, options.entries.value.length)
  );

  const estimatedRemainingMs: ComputedRef<number> = computed(
    () => counts.value.pending * getMailIntervalMs(displayedRate.value)
  );

  async function sendBatch(
    batch: readonly MailAttendeeEntry[]
  ): Promise<boolean[]> {
    for (const entry of batch) {
      entry.state = MailSendStateValue.sending;
      entry.detail = null;
    }
    const request: MassMailRequest = {
      cid: options.template.value?.cid ?? "",
      attendee_ids: batch
        .map((entry: MailAttendeeEntry) => entry.badgeId)
        .filter((id: number | null): id is number => id !== null),
      cc: [],
      bcc: [],
      variables: { ...options.variableOverrides.value },
    };
    const summary: MailSendSummary | undefined = await mailService.mails.send(
      options.errorHandler,
      request
    );
    return batch.map((entry: MailAttendeeEntry): boolean => {
      if (summary === undefined) {
        entry.state = MailSendStateValue.failed;
        entry.detail = getEntryFailureDetail(
          summary,
          entry.email,
          entry.badgeId,
          "Request failed"
        );
        return false;
      }
      if (
        summary.failed > 0 &&
        summary.failures.some(
          (failure) => failure.recipient === entry.email
        )
      ) {
        entry.state = MailSendStateValue.failed;
        entry.detail = getEntryFailureDetail(
          summary,
          entry.email,
          entry.badgeId,
          "Request failed"
        );
        return false;
      }
      entry.state = MailSendStateValue.sent;
      return true;
    });
  }

  function onPacingChange(update: PacingUpdate): void {
    effectiveRate.value = update.nextRatePerMinute;
    backoffNotice.value =
      `Rate reduced to ${update.nextRatePerMinute} mails/min after errors. ` +
      `Pausing for ${formatDuration(update.backoffMs)} before continuing.`;
  }

  async function runSend(targets: MailAttendeeEntry[]): Promise<void> {
    sending.value = true;
    const signal: SendRunSignal = createSendRunSignal();
    runSignal.value = signal;
    try {
      const outcome = await sendSequentiallyWithRateLimit<MailAttendeeEntry>(
        targets,
        pacing.value,
        sendBatch,
        onPacingChange,
        signal
      );
      if (outcome.aborted) {
        abortNotice.value =
          `Aborted after ${outcome.consecutiveErrors} consecutive send errors. ` +
          `The remaining mail(s) were left pending.`;
      } else if (signal.aborted) {
        stopped.value = true;
        stopNotice.value =
          "Sending stopped. Use Resume to send the remaining mail(s).";
      }
    } finally {
      runSignal.value = null;
      sending.value = false;
    }
  }

  function send(retryOnly: boolean): void {
    if (sending.value) {
      return;
    }
    const targets: MailAttendeeEntry[] = options.entries.value.filter(
      (entry: MailAttendeeEntry) =>
        retryOnly
          ? entry.state === MailSendStateValue.failed
          : entry.state === MailSendStateValue.pending
    );
    if (targets.length === 0) {
      return;
    }
    effectiveRate.value = pacing.value.ratePerMinute;
    stopped.value = false;
    backoffNotice.value = null;
    abortNotice.value = null;
    stopNotice.value = null;
    void runSend(targets);
  }

  function stop(): void {
    runSignal.value?.cancel();
  }

  return {
    pacing,
    sending,
    stopped,
    effectiveRate,
    displayedRate,
    backoffNotice,
    abortNotice,
    stopNotice,
    counts,
    progressPercent,
    estimatedRemainingMs,
    send,
    stop,
  };
}