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
          <span v-if="productCounts !== null" class="text-xs text-surface-400">{{ Object.keys(productCounts).length }} product(s)</span>
        </div>

        <div v-if="productCounts !== null" class="border border-surface-300 dark:border-surface-600 rounded-md overflow-auto max-h-80">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-surface-100 dark:bg-surface-800 z-10">
              <tr>
                <th class="px-2 py-1 text-left text-xs font-medium">SumUp Product</th>
                <th class="px-2 py-1 text-left text-xs font-medium w-14">Count</th>
                <th class="px-2 py-1 text-left text-xs font-medium">Item Value</th>
                <th class="px-2 py-1 text-left text-xs font-medium">Label</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(count, productKey) in productCounts"
                :key="productKey"
                class="border-t border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50"
              >
                <td class="px-2 py-0.5 text-xs">{{ productKey }}</td>
                <td class="px-2 py-0.5 text-xs text-center">{{ count }}</td>
                <td class="px-1 py-0.5">
                  <input
                    :value="mapping[productKey] ?? ''"
                    @input="updateMapping(String(productKey), ($event.target as HTMLInputElement).value)"
                    class="w-full bg-transparent border border-transparent focus:border-primary-400 rounded px-1 outline-none font-mono text-xs"
                    placeholder="tshirt_2026_m"
                  />
                </td>
                <td class="px-2 py-0.5 text-xs text-surface-500 max-w-48 truncate">
                  {{ labelFor(mapping[String(productKey)]) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { getSumUpProductCounts } from "@/composables/api/backend/getSumUpProductCounts";
import { setSumUpSetup } from "@/composables/api/backend/setSumUpSetup";
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ConcreteGoodieValue } from "@/config/convention";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputText from "@/volt/InputText.vue";
import { useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

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

async function fetchProducts(): Promise<void> {
  fetching.value = true;
  const result = await getSumUpProductCounts(errorHandler);
  fetching.value = false;
  if (result !== undefined) productCounts.value = result;
}

// Mapping: SumUp product key → ConcreteGoodieValue (empty string = skip)
// Loaded from reg #0; debounce-saved on every change
const mapping = ref<Record<string, string>>({});
let mappingTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
  const config = await getSponsorDeskConfig(errorHandler);
  cachedConfig = config ?? {};
  mapping.value = cachedConfig.sumupMapping ?? {};
});

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
