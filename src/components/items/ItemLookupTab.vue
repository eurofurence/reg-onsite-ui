<template>
  <div class="flex flex-col gap-4 pt-4">

    <!-- Controls -->
    <div class="flex gap-2 items-center flex-wrap">
      <Button icon="pi pi-clipboard" label="Paste from Clipboard" @click="pasteFromClipboard" severity="secondary" />
      <Button icon="pi pi-plus" label="Add Row" @click="addRawRow" severity="secondary" :disabled="rawData.length === 0" />
      <Button icon="pi pi-trash" label="Clear" @click="clearData" severity="danger" outlined :disabled="rawData.length === 0" />
      <span v-if="rawData.length > 0" class="text-xs text-surface-400">{{ rawData.length }} row(s), {{ numColumns }} column(s)</span>
    </div>

    <!-- Column mapping + data preview -->
    <div v-if="rawData.length > 0" class="flex gap-4 items-start">

      <!-- Input table with mapping header -->
      <div class="flex flex-col gap-2 flex-1 min-w-0">
        <div class="text-xs text-surface-500 font-medium">Assign columns</div>
        <DataTable :value="rawData" class="max-h-96" scrollable scrollHeight="24rem" size="small">
          <Column v-for="(_, ci) in numColumns" :key="ci">
            <template #header>
              <Select
                :modelValue="columnMapping[ci] ?? ''"
                @update:modelValue="setColumnMapping(ci, $event)"
                :options="FIELD_OPTIONS"
                optionLabel="label"
                optionValue="value"
                class="w-28 text-xs"
              />
            </template>
            <template #body="{ data }">
              <span
                class="text-xs whitespace-nowrap max-w-48 truncate block"
                :class="columnMapping[ci] ? '' : 'text-surface-400'"
              >{{ data[ci] }}</span>
            </template>
          </Column>
          <Column style="width: 2.5rem">
            <template #body="{ index }">
              <button @click="removeRawRow(index)" class="text-surface-400 hover:text-red-500 w-5 h-5 flex items-center justify-center">
                <i class="pi pi-times text-xs" />
              </button>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Results table -->
      <div v-if="results.length > 0" class="flex flex-col gap-2 flex-shrink-0">
        <div class="text-xs text-surface-500 font-medium">
          Results — {{ results.filter(r => r.found).length }} found, {{ results.filter(r => !r.found).length }} not found
        </div>
        <DataTable :value="results" class="max-h-96" scrollable scrollHeight="24rem" size="small">
          <Column v-for="field in mappedFields" :key="field" :header="fieldLabel(field)">
            <template #body="{ data }">
              <span class="text-xs text-surface-400">{{ inputFieldValue(data.input, field) }}</span>
            </template>
          </Column>
          <Column header="Matched ID">
            <template #body="{ data }">
              <span class="text-xs font-mono">{{ data.id ?? '—' }}</span>
            </template>
          </Column>
          <Column header="Matched Nick">
            <template #body="{ data }">
              <span class="text-xs">
                {{ data.nickname ?? '' }}
                <i
                  v-if="nicknameWarning(data)"
                  class="pi pi-exclamation-triangle text-amber-500 ml-1"
                  v-tooltip="'Nickname mismatch: input was \'' + (data.input.nickname ?? '') + '\''"
                />
              </span>
            </template>
          </Column>
          <Column style="width: 2.5rem">
            <template #body="{ data, index }">
              <i v-if="!data.found" class="pi pi-exclamation-triangle text-amber-500" v-tooltip="'Not found'" />
              <button @click="removeResultRow(index)" class="text-surface-400 hover:text-red-500 w-5 h-5 flex items-center justify-center">
                <i class="pi pi-times text-xs" />
              </button>
            </template>
          </Column>
        </DataTable>
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
import DataTable from "@/volt/DataTable.vue";
import Select from "@/volt/Select.vue";
import { Column } from "primevue";
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

function addRawRow(): void {
  rawData.value = [...rawData.value, Array(numColumns.value).fill("")];
}

function removeRawRow(index: number): void {
  rawData.value = rawData.value.filter((_, i) => i !== index);
}

function removeResultRow(index: number): void {
  results.value = results.value.filter((_, i) => i !== index);
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
