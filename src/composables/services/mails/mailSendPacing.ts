import type { MailSendPacingConfig } from "@/types/internal/mails";

export interface SendRunSignal {
  readonly aborted: boolean;
  cancel(): void;
  onCancel(callback: () => void): () => void;
}

export function createSendRunSignal(): SendRunSignal {
  let aborted: boolean = false;
  let cancelListeners: Array<() => void> = [];
  return {
    get aborted(): boolean {
      return aborted;
    },
    cancel(): void {
      if (aborted) {
        return;
      }
      aborted = true;
      const listeners: Array<() => void> = cancelListeners;
      cancelListeners = [];
      for (const listener of listeners) {
        listener();
      }
    },
    onCancel(callback: () => void): () => void {
      if (aborted) {
        callback();
        return () => {};
      }
      cancelListeners.push(callback);
      return () => {
        const index: number = cancelListeners.indexOf(callback);
        if (index >= 0) {
          cancelListeners.splice(index, 1);
        }
      };
    },
  };
}

function sleep(
  milliseconds: number,
  signal?: SendRunSignal
): Promise<void> {
  return new Promise((resolve) => {
    let unsubscribe: (() => void) | undefined;
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      unsubscribe?.();
      resolve();
    }, milliseconds);
    unsubscribe = signal?.onCancel(() => {
      unsubscribe?.();
      clearTimeout(timer);
      resolve();
    });
  });
}

export function getMailIntervalMs(ratePerMinute: number): number {
  return ratePerMinute <= 0 ? 0 : 60_000 / ratePerMinute;
}

export interface PacingUpdate {
  backoffMs: number;
  nextRatePerMinute: number;
}

export interface SendOutcome {
  aborted: boolean;
  consecutiveErrors: number;
}

function clampRate(
  ratePerMinute: number,
  minRatePerMinute: number
): number {
  return Math.max(1, Math.max(ratePerMinute, minRatePerMinute));
}

export async function sendSequentiallyWithRateLimit<T>(
  targets: readonly T[],
  config: MailSendPacingConfig,
  sendBatch: (batch: readonly T[]) => Promise<boolean[]>,
  onPacingChange: (update: PacingUpdate) => void,
  signal?: SendRunSignal
): Promise<SendOutcome> {
  const batchSize: number = Math.max(1, Math.floor(config.batchSize));
  let currentRate: number = clampRate(
    config.ratePerMinute,
    config.minRatePerMinute
  );
  let consecutiveErrors: number = 0;

  let index: number = 0;
  while (index < targets.length && !signal?.aborted) {
    const batch: T[] = targets.slice(index, index + batchSize);
    index += batch.length;

    const results: boolean[] = await sendBatch(batch);
    let batchHadError: boolean = false;
    for (const success of results) {
      if (success) {
        consecutiveErrors = 0;
      } else {
        consecutiveErrors += 1;
        batchHadError = true;
        if (consecutiveErrors >= config.maxConsecutiveErrors) {
          return { aborted: true, consecutiveErrors };
        }
      }
    }

    if (signal?.aborted) {
      break;
    }

    const intervalMs: number = getMailIntervalMs(currentRate);
    const batchBudgetMs: number = intervalMs * batch.length;

    if (batchHadError) {
      currentRate = clampRate(
        currentRate * config.rateFactor,
        config.minRatePerMinute
      );
      const backoffMs: number =
        Math.max(0, config.backoffSeconds) * 1000 + batchBudgetMs;
      onPacingChange({
        backoffMs: Math.round(backoffMs),
        nextRatePerMinute: currentRate,
      });
      if (backoffMs > 0) {
        console.debug(
          `[mail-send] backoff: sleeping ${Math.round(backoffMs)}ms ` +
            `(${formatDuration(backoffMs)}) after errors before the next API call`
        );
        await sleep(backoffMs, signal);
      }
    } else if (batchBudgetMs > 0) {
      console.debug(
        `[mail-send] pacing: sleeping ${Math.round(batchBudgetMs)}ms ` +
          `(${formatDuration(batchBudgetMs)}) between API calls`
      );
      await sleep(batchBudgetMs, signal);
    }
  }

  return { aborted: false, consecutiveErrors };
}

export function formatDuration(milliseconds: number): string {
  const totalSeconds: number = Math.round(milliseconds / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const minutes: number = Math.floor(totalSeconds / 60);
  const seconds: number = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}
