<template>
  <div class="flex flex-col gap-4 pt-4">

    <!-- Controls -->
    <div class="flex gap-2 items-center flex-wrap">
      <Button icon="pi pi-clipboard" label="Paste from Clipboard" @click="pasteFromClipboard" severity="secondary" />
      <Button icon="pi pi-trash" label="Clear" @click="clearData" severity="danger" outlined :disabled="rawData.length === 0" />
      <span v-if="rawData.length > 0" class="text-xs text-surface-400">{{ rawData.length }} row(s), {{ numColumns }} column(s)</span>
    </div>

    <!-- Column mapping + data preview -->
    <div v-if="rawData.length > 0" class="flex gap-4 items-start">

      <!-- Input table with mapping header -->
      <div class="flex flex-col gap-2 flex-1 min-w-0">
        <div class="text-xs text-surface-500 font-medium">Assign columns</div>
        <div class="border border-surface-300 dark:border-surface-600 rounded-md overflow-auto max-h-96">
          <table class="text-sm">
            <thead class="sticky top-0 bg-surface-100 dark:bg-surface-800 z-10">
              <tr>
                <th v-for="(_, ci) in numColumns" :key="ci" class="px-1 py-1 text-xs font-normal">
                  <Select
                    :modelValue="columnMapping[ci] ?? ''"
                    @update:modelValue="setColumnMapping(ci, $event)"
                    :options="FIELD_OPTIONS"
                    optionLabel="label"
                    optionValue="value"
                    class="w-28 text-xs"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in rawData" :key="ri"
                class="border-t border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <td v-for="(cell, ci) in row" :key="ci"
                  class="px-2 py-0.5 text-xs whitespace-nowrap max-w-48 truncate"
                  :class="columnMapping[ci] ? '' : 'text-surface-400'">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Results table -->
      <div v-if="results.length > 0" class="flex flex-col gap-2 flex-shrink-0">
        <div class="text-xs text-surface-500 font-medium">
          Results — {{ results.filter(r => r.found).length }} found, {{ results.filter(r => !r.found).length }} not found
        </div>
        <div class="border border-surface-300 dark:border-surface-600 rounded-md overflow-auto max-h-96">
          <table class="text-sm">
            <thead class="sticky top-0 bg-surface-100 dark:bg-surface-800 z-10">
              <tr>
                <th v-for="field in mappedFields" :key="'h-' + field"
                  class="px-3 py-1 text-left text-xs font-medium text-surface-400">
                  {{ fieldLabel(field) }}
                </th>
                <th class="px-3 py-1 text-left text-xs font-medium">Matched ID</th>
                <th class="px-3 py-1 text-left text-xs font-medium">Matched Nick</th>
                <th class="px-3 py-1 text-left text-xs font-medium w-6"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, ri) in results" :key="ri"
                class="border-t border-surface-200 dark:border-surface-700"
                :class="result.found ? '' : 'text-surface-400'">
                <td v-for="field in mappedFields" :key="'c-' + field"
                  class="px-3 py-0.5 text-xs text-surface-400">
                  {{ inputFieldValue(result.input, field) }}
                </td>
                <td class="px-3 py-0.5 text-xs font-mono">{{ result.id ?? '—' }}</td>
                <td class="px-3 py-0.5 text-xs">
                  {{ result.nickname ?? '' }}
                  <i
                    v-if="nicknameWarning(result)"
                    class="pi pi-exclamation-triangle text-amber-500 ml-1"
                    v-tooltip="'Nickname mismatch: input was \'' + (result.input.nickname ?? '') + '\''"
                  />
                </td>
                <td class="px-3 py-0.5 text-xs">
                  <i v-if="!result.found" class="pi pi-exclamation-triangle text-amber-500" v-tooltip="'Not found'" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 flex-wrap">
      <Button
        icon="pi pi-search"
        label="Look Up Attendees"
        @click="doLookup"
        :loading="loading"
        :disabled="rawData.length === 0 || !hasAnyMapping"
      />
      <template v-if="results.length > 0">
        <Button icon="pi pi-copy" label="Copy CSV (reg;item)" @click="copyCSV" severity="secondary" outlined />
        <Button icon="pi pi-copy" label="Copy Reg IDs" @click="copyRegIds" severity="secondary" outlined />
      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { postAttendeeLookup, type LookupResult, type LookupRow } from "@/composables/api/backend/postAttendeeLookup";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Select from "@/volt/Select.vue";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const FIELD_OPTIONS = [
  { value: "", label: "— skip —" },
  { value: "regId", label: "Reg ID" },
  { value: "nickname", label: "Nickname" },
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "fullName", label: "Full Name" },
  { value: "email", label: "Email" },
  { value: "idpId", label: "IDP ID" },
  { value: "item", label: "Item" },
];

// Pasted data
const rawData = ref<string[][]>([]);
const numColumns = computed(() => rawData.value[0]?.length ?? 0);

// Column mapping persisted across sessions (index → field key)
const columnMapping = useLocalStorage<Record<number, string>>("item-lookup-col-mapping", {});

function setColumnMapping(colIndex: number, value: string): void {
  columnMapping.value = { ...columnMapping.value, [colIndex]: value };
}

const hasAnyMapping = computed(() =>
  Object.values(columnMapping.value).some(v => v && v !== "")
);

async function pasteFromClipboard(): Promise<void> {
  try {
    const text = await navigator.clipboard.readText();
    const rows = text
      .split(/\r?\n/)
      .map(line => line.split("\t"))
      .filter(row => row.some(cell => cell.trim()));
    rawData.value = rows;
    results.value = [];
  } catch {
    props.toastService.add({ severity: ToastSeverity.warn, summary: "Clipboard unavailable", life: 3000 });
  }
}

function clearData(): void {
  rawData.value = [];
  results.value = [];
}

// Lookup
const loading = ref(false);
const results = ref<LookupResult[]>([]);

async function doLookup(): Promise<void> {
  loading.value = true;
  const mapping = columnMapping.value;
  const rows: LookupRow[] = rawData.value.map(row => {
    const entry: LookupRow = {};
    for (const [ci, field] of Object.entries(mapping)) {
      if (!field) continue;
      const cell = (row[Number(ci)] ?? "").trim();
      if (cell) (entry as any)[field] = cell;
    }
    return entry;
  });
  const res = await postAttendeeLookup(errorHandler, rows);
  loading.value = false;
  if (res !== undefined) {
    results.value = res;
    const found = res.filter(r => r.found).length;
    props.toastService.add({
      severity: found === res.length ? ToastSeverity.success : ToastSeverity.warn,
      summary: `${found} of ${res.length} found`,
      life: 4000,
    });
  }
}

// Mapped fields for the results table (ordered by column index, deduplicated)
const mappedFields = computed<string[]>(() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of Object.keys(columnMapping.value).map(Number).sort((a, b) => a - b)) {
    const field = columnMapping.value[k];
    if (field && !seen.has(field)) { seen.add(field); out.push(field); }
  }
  return out;
});

const FIELD_LABEL = Object.fromEntries(FIELD_OPTIONS.filter(o => o.value).map(o => [o.value, o.label]));
function fieldLabel(field: string): string { return FIELD_LABEL[field] ?? field; }
function inputFieldValue(input: LookupRow, field: string): string {
  return (input as Record<string, string | undefined>)[field] ?? "";
}

// Nickname warning helpers
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

function nicknameWarning(result: LookupResult): boolean {
  const input = result.input.nickname;
  if (!input || !result.nickname) return false;
  return normalize(input) !== normalize(result.nickname);
}

// Export
async function copyCSV(): Promise<void> {
  const lines = results.value
    .filter(r => r.found && r.id !== null)
    .map(r => `${r.id};${r.item ?? ""}`)
    .join("\n");
  await navigator.clipboard.writeText(lines);
  props.toastService.add({ severity: ToastSeverity.info, summary: "Copied to clipboard", life: 2000 });
}

async function copyRegIds(): Promise<void> {
  const ids = results.value
    .filter(r => r.found && r.id !== null)
    .map(r => String(r.id))
    .join(", ");
  await navigator.clipboard.writeText(ids);
  props.toastService.add({ severity: ToastSeverity.info, summary: "Copied to clipboard", life: 2000 });
}
</script>
