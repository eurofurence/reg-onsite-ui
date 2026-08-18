<template>
  <Fieldset legend="Payment Date Cache" class="p-2">
    <div class="flex flex-col gap-3">
      <p class="text-sm text-surface-500">
        Preload payment dates for all attendees so the "First N by payment date" and
        "Up to" filters don't have to fetch them one by one during Check. The cache is
        kept for this browser tab — export it to reuse across sessions.
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <Button @click="() => runFetch(false)" :loading="fetchLoading" icon="pi pi-cloud-download" label="Preload" severity="secondary" />
        <Button @click="() => runFetch(true)" :loading="fetchLoading" icon="pi pi-refresh" label="Refresh" severity="secondary" outlined />
        <Button @click="exportCache" :disabled="cache.size.value === 0" icon="pi pi-download" label="Export" severity="secondary" outlined />
        <Button @click="pickFile" icon="pi pi-upload" label="Import" severity="secondary" outlined />
        <input ref="fileInput" type="file" accept=".json" class="hidden" @change="onFileChange" />
        <span class="text-xs text-surface-400">
          {{ cache.size.value }} attendee(s) cached<template v-if="cache.createdAt.value">, as of {{ formatTimestamp(cache.createdAt.value) }}</template>
        </span>
      </div>
      <div v-if="fetchProgress !== null" class="flex flex-col gap-1.5">
        <ProgressBar :value="fetchProgress.total > 0 ? Math.round((fetchProgress.current / fetchProgress.total) * 100) : 0" />
        <div class="text-center text-xs text-surface-400">{{ fetchProgress.current }} / {{ fetchProgress.total }}</div>
      </div>
    </div>

    <RetryFailedDialog
      ref="retryFailedDialog"
      message="Payment dates could not be loaded for the following reg number(s) — likely due to a persistent error or ongoing throttling:"
      itemLabelSingular="reg number"
      itemLabelPlural="reg numbers"
      :itemKey="(regNum: RegNumber) => regNum"
    />
  </Fieldset>
</template>

<script setup lang="ts">
import RetryFailedDialog from "@/components/common/RetryFailedDialog.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getPackagePayments } from "@/composables/api/backend/getPackagePayments";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { downloadJSON } from "@/composables/logic/downloadJSON";
import { formatTimestamp } from "@/composables/items/itemHistoryRestore";
import { usePaymentDateCache } from "@/composables/items/paymentDateCache";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import { ref, useTemplateRef } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);
const cache = usePaymentDateCache();

const fetchLoading = ref(false);
const fetchProgress = ref<{ current: number; total: number } | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const retryFailedDialog = useTemplateRef("retryFailedDialog");

const FETCH_CONCURRENCY = 5;
const FETCH_RETRY_ATTEMPTS = 3;
const FETCH_RETRY_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let nextIndex = 0;
  async function runNext(): Promise<void> {
    for (;;) {
      const index = nextIndex++;
      if (index >= items.length) return;
      await worker(items[index]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runNext()));
}

interface PendingEntry { regNum: RegNumber; packageName: string; }

async function fetchPaymentDateWithRetry(entry: PendingEntry): Promise<"fetched" | "failed"> {
  for (let attempt = 1; ; attempt++) {
    const packages = await getPackagePayments(errorHandler, entry.regNum);
    if (packages !== undefined) {
      const paidAt = packages.find((pkg) => pkg.name === entry.packageName)?.fully_paid_at ?? null;
      cache.setPaymentDate(entry.regNum, entry.packageName, paidAt);
      return "fetched";
    }
    if (attempt >= FETCH_RETRY_ATTEMPTS) return "failed";
    await sleep(FETCH_RETRY_DELAY_MS);
  }
}

async function runFetch(force: boolean): Promise<void> {
  fetchLoading.value = true;
  fetchProgress.value = { current: 0, total: 1 };

  const attendees = await attendeeService.getAllAttendees(errorHandler, true);
  if (!attendees) { fetchLoading.value = false; fetchProgress.value = null; return; }

  const packageNameByLevel = new Map<string, string>(
    getConventionSetup().metadata.forGoodiesLevels.list
      .map((level) => [level.value, Object.keys(level.search.packages ?? {})[0]])
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
  );

  let pending: PendingEntry[] = [];
  for (const attendee of attendees) {
    if (attendee.id === null || attendee.transGoodieChoice === null) continue;
    const packageName = packageNameByLevel.get(attendee.transGoodieChoice as string);
    if (!packageName) continue;
    if (!force && cache.getPaymentDate(attendee.id as RegNumber, packageName) !== undefined) continue;
    pending.push({ regNum: attendee.id as RegNumber, packageName });
  }

  const totalCount = pending.length;
  let successCount = 0, cancelled = false;
  fetchProgress.value = { current: 0, total: totalCount };

  for (;;) {
    const stillFailing: PendingEntry[] = [];
    await runWithConcurrency(pending, FETCH_CONCURRENCY, async (entry) => {
      const outcome = await fetchPaymentDateWithRetry(entry);
      if (outcome === "fetched") successCount++;
      else stillFailing.push(entry);
      fetchProgress.value!.current++;
    });
    if (stillFailing.length === 0) break;
    const decision = await retryFailedDialog.value!.confirmRetry(stillFailing.map((entry) => entry.regNum));
    if (decision === "cancel") { cancelled = true; break; }
    if (decision === "skip") break;
    pending = stillFailing;
    fetchProgress.value = { current: totalCount - stillFailing.length, total: totalCount };
  }

  const failCount = cancelled ? 0 : totalCount - successCount;
  fetchProgress.value = null;
  fetchLoading.value = false;
  if (!cancelled) cache.markUpdated(new Date());

  if (cancelled) {
    props.toastService.add({ severity: ToastSeverity.warn, summary: "Preload cancelled", detail: `${successCount} payment date(s) were already loaded before cancelling.`, life: 8000 });
    return;
  }
  if (failCount === 0) {
    props.toastService.add({ severity: ToastSeverity.success, summary: "Preload complete", detail: `${successCount} payment date(s) loaded.`, life: 6000 });
  } else {
    props.toastService.add({ severity: ToastSeverity.warn, summary: "Preload partially complete", detail: `${successCount} succeeded, ${failCount} failed.`, life: 8000 });
  }
}

function exportCache(): void {
  const filename = `payment-dates-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  downloadJSON(cache.exportData(), filename);
}

function pickFile(): void {
  fileInput.value?.click();
}

async function onFileChange(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  (event.target as HTMLInputElement).value = "";
  if (!file) return;
  const text = await file.text();
  try {
    const count = cache.importData(text);
    props.toastService.add({ severity: ToastSeverity.success, summary: "Payment dates imported", detail: `${count} attendee(s) loaded.`, life: 5000 });
  } catch {
    props.toastService.add({ severity: ToastSeverity.error, summary: "Invalid payment date file", life: 4000 });
  }
}
</script>
