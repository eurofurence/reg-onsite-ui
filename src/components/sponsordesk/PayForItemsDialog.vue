<template>
  <Dialog v-model:visible="visible" modal dismissableMask header="Pay for Items" class="w-[40rem]">
    <div class="flex flex-col gap-3">
      <p v-if="loading" class="text-sm text-surface-400">Loading payable items...</p>
      <p v-else-if="rows.length === 0" class="text-sm text-surface-400">
        No items are configured for payment. Enable payment for items in Inventory Management.
      </p>
      <div v-else class="flex flex-col gap-2">
        <div v-for="row in rows" :key="row.item" class="flex items-center gap-3">
          <Checkbox
            binary
            :modelValue="getQuantity(row.item) > 0"
            @update:modelValue="(checked: boolean) => setChecked(row.item, checked)"
          />
          <span class="flex-1">{{ row.label }}</span>
          <span class="text-sm text-surface-400">{{ formatCents(row.settings.grossPriceCents) }} / ea</span>
          <InputNumber
            v-if="getQuantity(row.item) > 0"
            :modelValue="getQuantity(row.item)"
            @update:modelValue="(value: number | null) => setQuantity(row.item, value ?? 1)"
            :min="1"
            showButtons
            buttonLayout="horizontal"
            inputClass="w-14 text-center"
          />
        </div>
      </div>

      <div v-if="rows.length > 0" class="flex items-center justify-between border-t pt-3">
        <span class="font-bold">Total: {{ formatCents(totalCents) }}</span>
        <div v-if="readers && readers.length > 1" class="flex gap-2 flex-wrap justify-end">
          <Button
            v-for="reader in readers"
            :key="reader.id"
            :label="reader.name"
            size="small"
            :disabled="charging"
            @click="chargeWithReader(reader.id)"
          />
        </div>
        <Button
          v-else
          label="Charge"
          :disabled="totalCents <= 0 || charging"
          :loading="charging"
          @click="onChargeClick"
        />
      </div>
      <p v-if="statusMessage" class="text-sm">{{ statusMessage }}</p>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {
  getSponsorDeskConfig,
  type ItemPaymentSettings,
} from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import { getSumUpReaders, type SumUpReader } from "@/composables/api/backend/getSumUpReaders";
import {
  getSumUpReaderCheckoutJobStatus,
  type SumUpReaderCheckoutJobStatus,
} from "@/composables/api/backend/getSumUpReaderCheckoutJob";
import { startSumUpItemCheckout } from "@/composables/api/backend/postSumUpItemCheckout";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import type { ConcreteGoodieValue } from "@/config/convention";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Checkbox from "@/volt/Checkbox.vue";
import Dialog from "@/volt/Dialog.vue";
import InputNumber from "@/volt/InputNumber.vue";
import { computed, onUnmounted, ref, watch, type Ref } from "vue";

interface Props {
  attendeeInfo: TransformedAttendeeInfo;
  toastService: OnsiteToastService;
  onPaid: (items: ConcreteGoodieValue[]) => void;
}
const props = defineProps<Props>();
const visible: Ref<boolean> = defineModel<boolean>("visible", { required: true });

const errorHandler = getErrorHandlerFunction(props.toastService);

interface PayableRow {
  item: ConcreteGoodieValue;
  label: string;
  settings: ItemPaymentSettings;
}

const loading: Ref<boolean> = ref(true);
const rows: Ref<PayableRow[]> = ref([]);
const quantities: Ref<Record<string, number>> = ref({});

async function loadPayableItems(): Promise<void> {
  loading.value = true;
  const config = await getSponsorDeskConfig(errorHandler);
  const itemPayments = config?.itemPayments ?? {};
  rows.value = Object.entries(itemPayments)
    .filter(([, settings]) => settings.enabled)
    .map(([item, settings]) => ({
      item: item as ConcreteGoodieValue,
      label: getItemDisplayLabel(item as ConcreteGoodieValue),
      settings,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  quantities.value = {};
  loading.value = false;
}

watch(visible, (isVisible) => {
  if (isVisible) {
    void loadPayableItems();
    readers.value = null;
    statusMessage.value = null;
  }
});

function getQuantity(item: string): number {
  return quantities.value[item] ?? 0;
}

function setChecked(item: string, checked: boolean): void {
  quantities.value = { ...quantities.value, [item]: checked ? 1 : 0 };
}

function setQuantity(item: string, quantity: number): void {
  quantities.value = { ...quantities.value, [item]: quantity };
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(cents / 100);
}

const totalCents = computed<number>(() =>
  rows.value.reduce((sum, row) => sum + row.settings.grossPriceCents * getQuantity(row.item), 0)
);

const readers: Ref<SumUpReader[] | null> = ref(null);
const charging: Ref<boolean> = ref(false);
const statusMessage: Ref<string | null> = ref(null);
let pollTimer: ReturnType<typeof setTimeout> | null = null;
onUnmounted(() => { if (pollTimer) clearTimeout(pollTimer); });

function getAttendeeContext(): string {
  const name = `${props.attendeeInfo.first_name ?? ""} ${props.attendeeInfo.last_name ?? ""}`.trim();
  return name ? `Attendee ${props.attendeeInfo.id} (${name})` : `Attendee ${props.attendeeInfo.id}`;
}

async function onChargeClick(): Promise<void> {
  charging.value = true;
  statusMessage.value = null;
  const fetchedReaders = await getSumUpReaders(errorHandler);
  if (!fetchedReaders || fetchedReaders.length === 0) {
    charging.value = false;
    props.toastService.add({ severity: ToastSeverity.error, summary: "No SumUp terminals available", life: 5000 });
    return;
  }
  const onlyReader = fetchedReaders[0];
  if (fetchedReaders.length === 1 && onlyReader) {
    await chargeWithReader(onlyReader.id);
    return;
  }
  charging.value = false;
  readers.value = fetchedReaders;
}

async function pollCheckoutJob(jobId: string): Promise<void> {
  const job: SumUpReaderCheckoutJobStatus | undefined =
    await getSumUpReaderCheckoutJobStatus(errorHandler, jobId);
  if (job === undefined) {
    charging.value = false;
    statusMessage.value = null;
    return;
  }
  if (job.status === "polling") {
    statusMessage.value = "Waiting for terminal...";
    pollTimer = setTimeout(() => pollCheckoutJob(jobId), 2000);
    return;
  }
  charging.value = false;
  statusMessage.value = null;
  if (job.status === "error") {
    props.toastService.add({
      severity: ToastSeverity.error,
      summary: "Payment failed",
      detail: job.error ?? undefined,
      life: 6000,
    });
    return;
  }
  const paidItems = rows.value
    .filter((row) => getQuantity(row.item) > 0)
    .map((row) => row.item);
  props.onPaid(paidItems);
  props.toastService.add({ severity: ToastSeverity.info, summary: "Payment completed", life: 2000 });
  visible.value = false;
}

async function chargeWithReader(readerId: string): Promise<void> {
  charging.value = true;
  readers.value = null;
  const items = rows.value
    .filter((row) => getQuantity(row.item) > 0)
    .map((row) => ({
      name: row.label,
      grossPriceCents: row.settings.grossPriceCents,
      vatRate: row.settings.vatRate,
      quantity: getQuantity(row.item),
    }));
  const result = await startSumUpItemCheckout(errorHandler, readerId, items, getAttendeeContext());
  if (!result) {
    charging.value = false;
    return;
  }
  statusMessage.value = "Waiting for terminal...";
  await pollCheckoutJob(result.job_id);
}
</script>
