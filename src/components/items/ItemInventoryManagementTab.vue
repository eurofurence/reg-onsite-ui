<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div class="flex flex-col gap-4 pt-4">
    <div v-if="loading" class="flex justify-center p-8">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>
    <div v-else class="flex justify-center">
      <DataTable :value="flatRows" dataKey="key" class="w-fit" size="small">
        <Column style="width: 3rem">
          <template #body="{ data }">
            <button
              v-if="data.hasChildren"
              class="flex items-center justify-center w-7 h-7 rounded hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
              @click="toggleExpand(data.key)"
            >
              <span :class="['pi', 'text-xs', data.isExpanded ? 'pi-chevron-down' : 'pi-chevron-right']" />
            </button>
          </template>
        </Column>
        <Column header="Item">
          <template #body="{ data }">
            <span v-if="data.depth === 0" class="font-bold">{{ data.label }}</span>
            <span v-else :class="{ 'ml-6': data.depth === 2 }">
              {{ data.label }} <span class="text-muted-color text-sm">({{ data.value }})</span>
            </span>
          </template>
        </Column>
        <Column header="Inventory">
          <template #body="{ data }">
            <InputNumber
              v-if="data.editable"
              :modelValue="inventoryCounts[data.value] ?? 0"
              @update:modelValue="(value: number | null) => updateCount(data.value, value ?? 0)"
              :min="0"
              showButtons
              buttonLayout="horizontal"
              inputClass="w-20 text-center"
            />
          </template>
        </Column>
        <Column header="Payment">
          <template #body="{ data }">
            <div v-if="data.editable" class="flex items-center gap-2">
              <ToggleSwitch
                :modelValue="itemPayments[data.value]?.enabled ?? false"
                @update:modelValue="(value: boolean) => updatePaymentEnabled(data.value, value)"
              />
              <template v-if="itemPayments[data.value]?.enabled">
                <InputNumber
                  :modelValue="itemPayments[data.value]?.grossPriceCents ?? 0"
                  @update:modelValue="(value: number | null) => updatePaymentField(data.value, 'grossPriceCents', value ?? 0)"
                  :min="0"
                  suffix=" ct"
                  inputClass="w-24 text-right"
                  v-tooltip="'Gross price (already includes VAT)'"
                />
                <InputNumber
                  :modelValue="(itemPayments[data.value]?.vatRate ?? 0)"
                  @update:modelValue="(value: number | null) => updatePaymentField(data.value, 'vatRate', value ?? 0)"
                  :min="0"
                  :max="100"
                  suffix="%"
                  inputClass="w-16 text-right"
                  v-tooltip="'VAT rate'"
                />
              </template>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getSponsorDeskConfig,
  type ItemPaymentSettings,
  type SponsorDeskConfigRecord,
} from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import { putSponsorDeskConfig } from "@/composables/api/attsrv/additional-info/putSponsorDeskConfig";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { GoodieConfig } from "@/config/convention";
import { TShirtSize } from "@/config/metadata/tshirt/metadataForTShirtSizes";
import { ToastSeverity } from "@/types/internal/primevue";
import DataTable from "@/volt/DataTable.vue";
import InputNumber from "@/volt/InputNumber.vue";
import Toast from "@/volt/Toast.vue";
import ToggleSwitch from "@/volt/ToggleSwitch.vue";
import { Column } from "primevue";
import { computed, onMounted, ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const loading = ref(true);
const inventoryCounts = ref<Record<string, number>>({});
const itemPayments = ref<Record<string, ItemPaymentSettings>>({});

const OTHER_YEAR = "Other";
const CURRENT_YEAR = String(getConventionSetup().conDates.start.getFullYear());

function getGoodieYear(goodieConfig: GoodieConfig): string {
  const match = /_(\d{4})$/.exec(goodieConfig.value);
  return match ? match[1]! : OTHER_YEAR;
}

interface FlatRow {
  key: string;
  value: string;
  label: string;
  depth: 0 | 1 | 2;
  hasChildren: boolean;
  isExpanded: boolean;
  editable: boolean;
}

const expandedRows = ref<Record<string, boolean>>({});

function defaultExpanded(key: string): boolean {
  return !key.startsWith("year:") || key === `year:${CURRENT_YEAR}`;
}

function isExpanded(key: string): boolean {
  return expandedRows.value[key] ?? defaultExpanded(key);
}

function toggleExpand(key: string): void {
  expandedRows.value = { ...expandedRows.value, [key]: !isExpanded(key) };
}

const goodiesByYear = computed<Map<string, GoodieConfig[]>>(() => {
  const map = new Map<string, GoodieConfig[]>();
  for (const goodieConfig of getConventionSetup().metadata.forAbstractGoodies.list) {
    const year = getGoodieYear(goodieConfig);
    const list = map.get(year) ?? [];
    list.push(goodieConfig);
    map.set(year, list);
  }
  return map;
});

const flatRows = computed<FlatRow[]>(() => {
  const years = [...goodiesByYear.value.keys()].sort((a, b) => (a === OTHER_YEAR ? 1 : b === OTHER_YEAR ? -1 : b.localeCompare(a)));
  const rows: FlatRow[] = [];

  for (const year of years) {
    const yearKey = `year:${year}`;
    rows.push({ key: yearKey, value: "", label: year, depth: 0, hasChildren: true, isExpanded: isExpanded(yearKey), editable: false });
    if (!isExpanded(yearKey)) continue;

    for (const goodieConfig of goodiesByYear.value.get(year)!) {
      const concreteItems = getConcreteItemsForGoodie(goodieConfig);
      if (goodieConfig.variants == null) {
        rows.push({
          key: concreteItems[0]!,
          value: concreteItems[0]!,
          label: goodieConfig.label,
          depth: 1,
          hasChildren: false,
          isExpanded: false,
          editable: true,
        });
        continue;
      }

      // "Ask attendee!" is a placeholder meaning "use the attendee's
      // registered size" — there's no physical stock to configure for it.
      const stockableVariants = goodieConfig.variants
        .map((variant, index) => ({ variant, concreteItem: concreteItems[index]! }))
        .filter(({ variant }) => variant.value !== TShirtSize.size_unknown);

      if (stockableVariants.length === 0) continue;

      const parentKey = `goodie:${goodieConfig.value}`;
      rows.push({ key: parentKey, value: goodieConfig.value, label: goodieConfig.label, depth: 1, hasChildren: true, isExpanded: isExpanded(parentKey), editable: false });
      if (!isExpanded(parentKey)) continue;

      for (const { variant, concreteItem } of stockableVariants) {
        rows.push({
          key: concreteItem,
          value: concreteItem,
          label: variant.label,
          depth: 2,
          hasChildren: false,
          isExpanded: false,
          editable: true,
        });
      }
    }
  }

  return rows;
});

// Cached reg #0 config — loaded once, merged on every write
let cachedConfig: SponsorDeskConfigRecord = {};

onMounted(async () => {
  const config = await getSponsorDeskConfig(errorHandler);
  cachedConfig = config ?? {};
  inventoryCounts.value = cachedConfig.inventoryCounts ?? {};
  itemPayments.value = cachedConfig.itemPayments ?? {};
  loading.value = false;
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(newConfig: SponsorDeskConfigRecord): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const result = await putSponsorDeskConfig(errorHandler, newConfig);
    if (result !== undefined) {
      cachedConfig = newConfig;
    } else {
      props.toastService.add({ severity: ToastSeverity.error, summary: "Save failed", life: 5000 });
    }
  }, 1000);
}

function updateCount(item: string, count: number): void {
  inventoryCounts.value = { ...inventoryCounts.value, [item]: count };
  scheduleSave({ ...cachedConfig, inventoryCounts: inventoryCounts.value });
}

const DEFAULT_VAT_RATE = 0.19;

const DEFAULT_PAYMENT_SETTINGS: ItemPaymentSettings = {
  enabled: false,
  grossPriceCents: 0,
  vatRate: DEFAULT_VAT_RATE,
};

function updatePaymentEnabled(item: string, enabled: boolean): void {
  const current = itemPayments.value[item] ?? DEFAULT_PAYMENT_SETTINGS;
  itemPayments.value = { ...itemPayments.value, [item]: { ...current, enabled } };
  scheduleSave({ ...cachedConfig, itemPayments: itemPayments.value });
}

function updatePaymentField(
  item: string,
  field: "grossPriceCents" | "vatRate",
  value: number,
): void {
  const current = itemPayments.value[item] ?? DEFAULT_PAYMENT_SETTINGS;
  itemPayments.value = { ...itemPayments.value, [item]: { ...current, [field]: value } };
  scheduleSave({ ...cachedConfig, itemPayments: itemPayments.value });
}
</script>
