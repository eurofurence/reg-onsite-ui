<template>
  <div class="flex flex-col gap-4 pt-4">

    <Fieldset legend="SumUp Setup" class="p-2">
      <div class="flex gap-3 flex-wrap items-end">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-500">Access Token</label>
          <InputText v-model="setupToken" type="password" placeholder="Paste SumUp access token" class="w-72 font-mono text-xs" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-500">Merchant Code</label>
          <InputText v-model="setupMerchantCode" placeholder="e.g. MC1234ABC" class="w-40" />
        </div>
        <Button @click="configureSumUp" :loading="configuring" icon="pi pi-check" label="Configure" />
      </div>
    </Fieldset>

    <Fieldset legend="Sold Products" class="p-2">
      <div class="flex flex-col gap-3">
        <div class="flex gap-2 items-center">
          <Button @click="fetchProducts" :loading="fetching" icon="pi pi-refresh" label="Fetch from SumUp" severity="secondary" />
          <span v-if="fetching && fetchProgress" class="text-xs text-surface-400">
            Fetching… {{ fetchProgress.pages_fetched }} page(s){{ fetchProgress.transactions_found > 0 ? `, ${fetchProgress.transactions_found} transaction(s) found, ${fetchProgress.details_fetched}/${fetchProgress.transactions_found} detail(s) fetched` : '' }}
          </span>
          <span v-else-if="productCounts !== null" class="text-xs text-surface-400">{{ Object.keys(productCounts).length }} product(s)</span>
        </div>

        <DataTable v-if="productCounts !== null" :value="productRows" dataKey="productKey" class="max-h-80" scrollable scrollHeight="20rem" size="small">
          <Column field="productKey" header="SumUp Product" />
          <Column field="count" header="Count" style="width: 4rem" />
          <Column header="Item Value">
            <template #body="{ data }">
              <AutoComplete
                :modelValue="mapping[data.productKey] ?? ''"
                @update:modelValue="(value: string | undefined) => updateMapping(data.productKey, value ?? '')"
                :suggestions="itemSuggestions"
                @complete="onItemComplete"
                placeholder="tshirt_2026_m"
                size="small"
                inputClass="w-full font-mono text-xs"
                class="w-full"
              />
            </template>
          </Column>
          <Column header="Label">
            <template #body="{ data }">
              <span class="text-xs text-surface-500 max-w-48 truncate block">{{ labelFor(mapping[data.productKey]) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </Fieldset>

    <Fieldset v-if="soldItemsPreview.length > 0" legend="Store Results" class="p-2">
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="entry in condensedPreview"
            :key="entry.value"
            class="bg-surface-100 dark:bg-surface-800 rounded px-2 py-1 text-xs"
          >
            {{ entry.label }} ×{{ entry.count }}
          </div>
        </div>
        <div class="text-xs text-surface-400">{{ soldItemsPreview.length }} total entries → reg #0 <code>soldItems</code></div>
        <div>
          <Button @click="saveSoldItems" :loading="saving" icon="pi pi-save" label="Save Sold Items to Reg #0" />
        </div>
      </div>
    </Fieldset>

  </div>
</template>

<script setup lang="ts">
import { getSponsorDeskConfig, type SponsorDeskConfigRecord } from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import { putSponsorDeskConfig } from "@/composables/api/attsrv/additional-info/putSponsorDeskConfig";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getSumUpProductCountsStatus, startSumUpProductCountsFetch, type SumUpProductCountsJobStatus } from "@/composables/api/backend/getSumUpProductCounts";
import { setSumUpSetup } from "@/composables/api/backend/setSumUpSetup";
import { getAllConcreteItems } from "@/composables/items/getAllConcreteItems";
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import { getMetadataEntryListFromRecord } from "@/composables/collection_tools/metadata/getMetadataEntryListFromRecord";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { conventionIterations, type ConcreteGoodieValue, type GoodieConfig } from "@/config/convention";
import { ToastSeverity } from "@/types/internal/primevue";
import AutoComplete from "@/volt/AutoComplete.vue";
import Button from "@/volt/Button.vue";
import DataTable from "@/volt/DataTable.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputText from "@/volt/InputText.vue";
import { Column } from "primevue";
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import { useLocalStorage } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

// Cached reg #0 config — loaded once, merged on every write
let cachedConfig: SponsorDeskConfigRecord = {};

// Setup
const setupToken = ref("");
const setupMerchantCode = useLocalStorage<string>("item-sumup-merchant-code", "");
const configuring = ref(false);

async function configureSumUp(): Promise<void> {
  configuring.value = true;
  const ok = await setSumUpSetup(errorHandler, setupToken.value, setupMerchantCode.value);
  configuring.value = false;
  props.toastService.add(ok
    ? { severity: ToastSeverity.success, summary: "SumUp configured", life: 3000 }
    : { severity: ToastSeverity.error, summary: "Configuration failed", life: 5000 });
}

// Product counts
const fetching = ref(false);
const productCounts = ref<Record<string, number> | null>(null);
const fetchProgress = ref<SumUpProductCountsJobStatus | null>(null);
let pollTimer: ReturnType<typeof setTimeout> | null = null;

function stopPolling(): void {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = null;
}

async function pollJob(): Promise<void> {
  const status = await getSumUpProductCountsStatus(errorHandler);
  if (status === undefined) {
    fetching.value = false;
    fetchProgress.value = null;
    return;
  }
  fetchProgress.value = status;
  if (status.status === "running") {
    pollTimer = setTimeout(() => pollJob(), 2000);
    return;
  }
  fetching.value = false;
  if (status.status === "done") {
    productCounts.value = status.counts;
  } else {
    props.toastService.add({ severity: ToastSeverity.error, summary: "Fetch failed", detail: status.error ?? undefined, life: 6000 });
  }
}

async function fetchProducts(): Promise<void> {
  fetching.value = true;
  fetchProgress.value = null;
  const result = await startSumUpProductCountsFetch(errorHandler);
  if (result === undefined) {
    fetching.value = false;
    return;
  }
  await pollJob();
}

onUnmounted(stopPolling);

const productRows = computed(() =>
  Object.entries(productCounts.value ?? {}).map(([productKey, count]) => ({ productKey, count }))
);

// Mapping: SumUp product key → ConcreteGoodieValue (empty string = skip)
// Loaded from reg #0; debounce-saved on every change
const mapping = ref<Record<string, string>>({});
let mappingTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  const config = await getSponsorDeskConfig(errorHandler);
  cachedConfig = config ?? {};
  mapping.value = cachedConfig.sumupMapping ?? {};
});

// All known item values across iterations, for autocomplete
const allItemValues: ConcreteGoodieValue[] = conventionIterations.flatMap((iteration) =>
  getAllConcreteItems(getMetadataEntryListFromRecord(iteration.record) as GoodieConfig[])
);

const itemSuggestions = ref<ConcreteGoodieValue[]>([]);

function onItemComplete(event: AutoCompleteCompleteEvent): void {
  const query = event.query.toLowerCase();
  itemSuggestions.value = query
    ? allItemValues.filter((value) => value.toLowerCase().includes(query))
    : allItemValues;
}

function updateMapping(productKey: string, value: string): void {
  mapping.value = { ...mapping.value, [productKey]: value };
  if (mappingTimer) clearTimeout(mappingTimer);
  mappingTimer = setTimeout(async () => {
    const newConfig = { ...cachedConfig, sumupMapping: mapping.value };
    const result = await putSponsorDeskConfig(errorHandler, newConfig);
    if (result !== undefined) cachedConfig = newConfig;
  }, 1000);
}

function labelFor(itemValue: string | undefined): string {
  if (!itemValue?.trim()) return "";
  return getItemDisplayLabel(itemValue as ConcreteGoodieValue);
}

// Preview of soldItems
const soldItemsPreview = computed<ConcreteGoodieValue[]>(() => {
  if (!productCounts.value) return [];
  const items: ConcreteGoodieValue[] = [];
  for (const [productKey, count] of Object.entries(productCounts.value)) {
    const goodieValue = (mapping.value[productKey] ?? "").trim();
    if (!goodieValue) continue;
    for (let i = 0; i < count; i++) items.push(goodieValue as ConcreteGoodieValue);
  }
  return items;
});

const condensedPreview = computed(() => {
  const counts = new Map<string, number>();
  for (const item of soldItemsPreview.value) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return [...counts.entries()].map(([value, count]) => ({
    value,
    count,
    label: getItemDisplayLabel(value as ConcreteGoodieValue),
  }));
});

// Save sold items
const saving = ref(false);

async function saveSoldItems(): Promise<void> {
  saving.value = true;
  const newConfig = { ...cachedConfig, soldItems: soldItemsPreview.value };
  const result = await putSponsorDeskConfig(errorHandler, newConfig);
  if (result !== undefined) cachedConfig = newConfig;
  saving.value = false;
  props.toastService.add(result !== undefined
    ? { severity: ToastSeverity.success, summary: "Sold items saved to reg #0", life: 4000 }
    : { severity: ToastSeverity.error, summary: "Save failed", life: 5000 });
}
</script>
