<template>
  <div class="flex flex-col gap-4 pt-4">

    <!-- Controls -->
    <div class="flex gap-2 items-center flex-wrap">
      <Button icon="pi pi-clipboard" label="Paste from Clipboard" @click="pasteFromClipboard" severity="secondary" />
      <Button icon="pi pi-plus" label="Add Row" @click="addRawRow" severity="secondary" :disabled="rawData.length === 0" />
      <Button icon="pi pi-trash" label="Clear" @click="clearData" severity="danger" outlined :disabled="rawData.length === 0" />
      <span v-if="rawData.length > 0" class="text-xs text-surface-400">{{ rawData.length }} row(s), {{ numColumns }} column(s)</span>
    </div>

    <!-- Filter -->
    <div class="flex gap-2 items-center flex-wrap">
      <label class="text-xs text-surface-500" for="required-packages">Required Packages</label>
      <InputText id="required-packages" v-model="requiredPackagesText" placeholder="e.g. sponsor, dealer" class="text-xs w-56" />
      <label class="text-xs text-surface-500" for="required-flags">Required Flags</label>
      <InputText id="required-flags" v-model="requiredFlagsText" placeholder="e.g. hc, ev" class="text-xs w-56" />
    </div>

    <!-- Column mapping + data preview -->
    <div v-if="rawData.length > 0" class="flex flex-col gap-2">
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

    <!-- Actions -->
    <div class="flex gap-2 flex-wrap">
      <Button
        icon="pi pi-search"
        label="Look Up Attendees"
        @click="doLookup"
        :loading="loading"
        :disabled="rawData.length === 0 || !hasAnyMapping"
      />
      <template v-if="rows.length > 0">
        <Button
          icon="pi pi-copy"
          :label="`Copy CSV (reg;item) — ${checkedRows.length}`"
          @click="copyCSV"
          severity="secondary"
          outlined
          :disabled="checkedRows.length === 0"
        />
        <Button
          icon="pi pi-copy"
          :label="`Copy Reg IDs — ${checkedRows.length}`"
          @click="copyRegIds"
          severity="secondary"
          outlined
          :disabled="checkedRows.length === 0"
        />
        <Button
          icon="pi pi-external-link"
          :label="`Export CSV — ${checkedRows.length}`"
          @click="exportCSV"
          severity="secondary"
          outlined
          :disabled="checkedRows.length === 0"
        />
      </template>
    </div>

    <!-- Validated table -->
    <div v-if="rows.length > 0" class="flex flex-col gap-2">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="text-xs text-surface-500 font-medium">
          Validated — {{ validatedRows.length }} row(s), {{ checkedRows.length }} checked
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="includeNotFound" inputId="include-not-found" />
          <label for="include-not-found" class="text-xs text-surface-500 cursor-pointer">Include not-found rows</label>
        </div>
      </div>
      <DataTable :value="validatedRows" class="max-h-96" scrollable scrollHeight="24rem" size="small" sortMode="multiple" removableSort dataKey="key">
        <Column headerStyle="width: 2.5rem">
          <template #header>
            <Checkbox :modelValue="allValidatedChecked" @update:modelValue="setAllChecked($event)" binary />
          </template>
          <template #body="{ data }">
            <Checkbox v-model="data.included" binary :disabled="data.resolvedMatch === null" v-tooltip="data.resolvedMatch === null ? 'No reg ID to export' : undefined" />
          </template>
        </Column>
        <Column v-for="field in mappedFields" :key="field" :header="fieldLabel(field)" :field="`result.input.${field}`" :sortField="`result.input.${field}`" sortable>
          <template #body="{ data }">
            <span class="text-xs text-surface-400">{{ inputFieldValue(data.result.input, field) }}</span>
          </template>
        </Column>
        <Column header="Match Status" field="resolvedMatch" sortField="resolvedMatch.id" sortable>
          <template #body="{ data }">
            <Tag :value="data.resolvedMatch !== null ? 'Matched' : 'Not Found'" :severity="data.resolvedMatch !== null ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column header="Matched Reg ID" field="resolvedMatch.id" sortField="resolvedMatch.id" sortable>
          <template #body="{ data }">
            <span class="text-xs font-mono">{{ data.resolvedMatch?.id }}</span>
          </template>
        </Column>
        <Column
          v-for="field in MATCH_COMPARE_FIELDS"
          :key="field"
          :header="`Matched ${fieldLabel(field)}`"
          :field="`resolvedMatch.${field}`"
          :sortField="`resolvedMatch.${field}`"
          sortable
        >
          <template #body="{ data }">
            <span class="text-xs">
              {{ data.resolvedMatch?.[field] ?? '' }}
              <i
                v-if="fieldMismatch(data, field)"
                class="pi pi-exclamation-triangle text-amber-500 ml-1"
                v-tooltip="`${fieldLabel(field)} mismatch: input was '${inputFieldValue(data.result.input, field)}'`"
              />
            </span>
          </template>
        </Column>
        <Column style="width: 4rem">
          <template #body="{ data }">
            <button
              v-if="data.result.matches.length > 1"
              @click="selectCandidate(data, null)"
              class="text-surface-400 hover:text-amber-500 w-5 h-5 inline-flex items-center justify-center"
              v-tooltip="'Change match'"
            >
              <i class="pi pi-pencil text-xs" />
            </button>
            <button @click="removeResultRow(data)" class="text-surface-400 hover:text-red-500 w-5 h-5 inline-flex items-center justify-center">
              <i class="pi pi-times text-xs" />
            </button>
          </template>
        </Column>
        <template #empty>No validated rows yet.</template>
      </DataTable>
    </div>

    <!-- Needs Review table -->
    <div v-if="reviewRows.length > 0" class="flex flex-col gap-2">
      <div class="text-xs text-surface-500 font-medium">
        Needs Review — {{ ambiguousCount }} ambiguous, {{ notFoundCount }} not found
      </div>
      <DataTable :value="reviewRows" class="max-h-96" scrollable scrollHeight="24rem" size="small" sortMode="multiple" removableSort dataKey="key" rowGroupMode="subheader" groupRowsBy="status">
        <template #groupheader="{ data }">
          <span class="text-xs font-semibold">{{ data.status === 'ambiguous' ? 'Ambiguous' : 'Not Found' }}</span>
        </template>
        <Column v-for="field in mappedFields" :key="field" :header="fieldLabel(field)" :field="`result.input.${field}`" :sortField="`result.input.${field}`" sortable>
          <template #body="{ data }">
            <span class="text-xs text-surface-400">{{ inputFieldValue(data.result.input, field) }}</span>
          </template>
        </Column>
        <Column header="Candidates">
          <template #body="{ data }">
            <div v-if="data.result.matches.length > 0" class="flex flex-col gap-1">
              <div v-for="match in data.result.matches" :key="match.id" class="flex items-center gap-2">
                <RadioButton v-model="data.resolvedMatch" :value="match" :inputId="`cand-${data.key}-${match.id}`" @update:modelValue="selectCandidate(data, match)" />
                <label :for="`cand-${data.key}-${match.id}`" class="text-xs cursor-pointer">
                  {{ match.id }} — {{ match.nickname ?? '' }} ({{ match.firstName }} {{ match.lastName }}, {{ match.email }}, {{ match.idpId ?? '—' }})
                </label>
              </div>
              <div class="flex items-center gap-2">
                <RadioButton v-model="data.resolvedMatch" :value="null" :inputId="`cand-${data.key}-unmatched`" @update:modelValue="selectCandidate(data, null)" />
                <label :for="`cand-${data.key}-unmatched`" class="text-xs cursor-pointer text-surface-400">Unmatched</label>
              </div>
            </div>
            <span v-else class="text-xs text-surface-400">No match</span>
          </template>
        </Column>
        <Column style="width: 2.5rem">
          <template #body="{ data }">
            <button @click="removeResultRow(data)" class="text-surface-400 hover:text-red-500 w-5 h-5 flex items-center justify-center">
              <i class="pi pi-times text-xs" />
            </button>
          </template>
        </Column>
      </DataTable>
    </div>

  </div>
</template>

<script setup lang="ts">
import { postAttendeeLookup, type AttendeeMatch, type LookupResult, type LookupRow } from "@/composables/api/backend/postAttendeeLookup";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { ToastSeverity } from "@/types/internal/primevue";
import { downloadCSV } from "@/composables/logic/downloadCSV";
import Button from "@/volt/Button.vue";
import Checkbox from "@/volt/Checkbox.vue";
import DataTable from "@/volt/DataTable.vue";
import InputText from "@/volt/InputText.vue";
import RadioButton from "@/volt/RadioButton.vue";
import Select from "@/volt/Select.vue";
import Tag from "@/volt/Tag.vue";
import ToggleSwitch from "@/volt/ToggleSwitch.vue";
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
    const parsedRows = text
      .split(/\r?\n/)
      .map(line => line.split("\t"))
      .filter(row => row.some(cell => cell.trim()));
    rawData.value = parsedRows;
    rows.value = [];
  } catch {
    props.toastService.add({ severity: ToastSeverity.warn, summary: "Clipboard unavailable", life: 3000 });
  }
}

function clearData(): void {
  rawData.value = [];
  rows.value = [];
}

function addRawRow(): void {
  rawData.value = [...rawData.value, Array(numColumns.value).fill("")];
}

// Package/flag filter persisted across sessions
const requiredPackagesText = useLocalStorage("item-lookup-required-packages", "");
const requiredFlagsText = useLocalStorage("item-lookup-required-flags", "");

function parseCodes(text: string): string[] {
  return text.split(",").map(code => code.trim()).filter(code => code.length > 0);
}

function removeRawRow(index: number): void {
  rawData.value = rawData.value.filter((_, i) => i !== index);
}

// Lookup
interface ResultRow {
  key: number;
  result: LookupResult;
  resolvedMatch: AttendeeMatch | null;
  included: boolean;
  status: "ambiguous" | "not_found";
}

const loading = ref(false);
const rows = ref<ResultRow[]>([]);
let nextKey = 0;

function singleMatch(result: LookupResult): AttendeeMatch | undefined {
  return result.matches.length === 1 ? result.matches[0] : undefined;
}

function removeResultRow(row: ResultRow): void {
  rows.value = rows.value.filter(r => r.key !== row.key);
}

function selectCandidate(row: ResultRow, match: AttendeeMatch | null): void {
  row.resolvedMatch = match;
  row.included = match !== null;
}

async function doLookup(): Promise<void> {
  loading.value = true;
  const mapping = columnMapping.value;
  const lookupRows: LookupRow[] = rawData.value.map(row => {
    const entry: LookupRow = {};
    for (const [ci, field] of Object.entries(mapping)) {
      if (!field) continue;
      const cell = (row[Number(ci)] ?? "").trim();
      if (cell) (entry as any)[field] = cell;
    }
    return entry;
  });
  const res = await postAttendeeLookup(errorHandler, lookupRows, {
    requiredPackages: parseCodes(requiredPackagesText.value),
    requiredFlags: parseCodes(requiredFlagsText.value),
  });
  loading.value = false;
  if (res !== undefined) {
    rows.value = res.map(result => {
      const match = singleMatch(result) ?? null;
      return {
        key: nextKey++,
        result,
        resolvedMatch: match,
        included: match !== null,
        status: result.matches.length > 1 ? "ambiguous" : "not_found",
      };
    });
    const validated = rows.value.filter(r => r.resolvedMatch !== null).length;
    const ambiguous = rows.value.filter(r => r.status === "ambiguous").length;
    const notFound = rows.value.filter(r => r.status === "not_found").length;
    props.toastService.add({
      severity: ambiguous === 0 && notFound === 0 ? ToastSeverity.success : ToastSeverity.warn,
      summary: `${validated} validated, ${ambiguous} ambiguous, ${notFound} not found`,
      life: 4000,
    });
  }
}

const includeNotFound = ref(false);

const validatedRows = computed(() => rows.value.filter(r =>
  r.resolvedMatch !== null || (includeNotFound.value && r.status === "not_found")
));
const reviewRows = computed(() => rows.value.filter(r =>
  r.resolvedMatch === null && !(includeNotFound.value && r.status === "not_found")
));
const ambiguousCount = computed(() => reviewRows.value.filter(r => r.status === "ambiguous").length);
const notFoundCount = computed(() => reviewRows.value.filter(r => r.status === "not_found").length);
const checkedRows = computed(() => validatedRows.value.filter(r => r.included));

const checkableValidatedRows = computed(() => validatedRows.value.filter(r => r.resolvedMatch !== null));

const allValidatedChecked = computed(() =>
  checkableValidatedRows.value.length > 0 && checkableValidatedRows.value.every(r => r.included)
);

function setAllChecked(checked: boolean): void {
  for (const row of checkableValidatedRows.value) row.included = checked;
}

// Mapped fields for the results tables (ordered by column index, deduplicated)
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

// Mismatch warning helpers — highlight when a matched field differs from what was pasted in
const MATCH_COMPARE_FIELDS = ["nickname", "firstName", "lastName", "email", "idpId"] as const;

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

function fieldMismatch(row: ResultRow, field: (typeof MATCH_COMPARE_FIELDS)[number]): boolean {
  const input = inputFieldValue(row.result.input, field);
  const matched = row.resolvedMatch?.[field];
  if (!input || !matched) return false;
  return normalize(input) !== normalize(matched);
}

// Export
function matchedCheckedRows(): (ResultRow & { resolvedMatch: AttendeeMatch })[] {
  return checkedRows.value.filter(
    (row): row is ResultRow & { resolvedMatch: AttendeeMatch } => row.resolvedMatch !== null
  );
}

async function copyCSV(): Promise<void> {
  const lines = matchedCheckedRows()
    .map(row => `${row.resolvedMatch.id};${row.result.item ?? ""}`)
    .join("\n");
  await navigator.clipboard.writeText(lines);
  props.toastService.add({ severity: ToastSeverity.info, summary: "Copied to clipboard", life: 2000 });
}

async function copyRegIds(): Promise<void> {
  const ids = matchedCheckedRows()
    .map(row => String(row.resolvedMatch.id))
    .join(", ");
  await navigator.clipboard.writeText(ids);
  props.toastService.add({ severity: ToastSeverity.info, summary: "Copied to clipboard", life: 2000 });
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportCSV(): void {
  const headers = [
    ...mappedFields.value.map(fieldLabel),
    "Matched Reg ID",
    ...MATCH_COMPARE_FIELDS.map(field => `Matched ${fieldLabel(field)}`),
  ];
  const csvRows = checkedRows.value.map(row => [
    ...mappedFields.value.map(field => inputFieldValue(row.result.input, field)),
    String(row.resolvedMatch?.id ?? ""),
    ...MATCH_COMPARE_FIELDS.map(field => row.resolvedMatch?.[field] ?? ""),
  ]);
  const csv = [headers, ...csvRows].map(row => row.map(csvCell).join(";")).join("\n");
  downloadCSV(csv, "attendee-lookup.csv");
  props.toastService.add({ severity: ToastSeverity.info, summary: "CSV downloaded", life: 2000 });
}
</script>
