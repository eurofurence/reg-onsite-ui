<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2 items-center flex-wrap">
      <Button size="small" icon="pi pi-clipboard" label="Paste from Clipboard" @click="pasteFromClipboard" severity="secondary" />
      <Button size="small" icon="pi pi-plus" label="Add Row" @click="addRow" severity="secondary" />
      <Button size="small" icon="pi pi-trash" label="Clear" @click="clearRows" severity="danger" outlined :disabled="modelValue.length === 0" />
      <span class="text-xs text-surface-400">{{ modelValue.length }} row(s)</span>
    </div>

    <DataTable :value="modelValue" class="max-h-64" scrollable scrollHeight="16rem" size="small">
      <template #empty>
        <span class="text-surface-400 text-xs italic">Use the Paste from Clipboard button above to import TSV data</span>
      </template>
      <Column header="Reg #" style="width: 6rem">
        <template #body="{ data, index }">
          <InputText
            :modelValue="data.regNum"
            @update:modelValue="(value: string | undefined) => updateRow(index, 'regNum', value ?? '')"
            placeholder="12345"
            size="small"
            class="w-full"
          />
        </template>
      </Column>
      <Column header="Item Value">
        <template #body="{ data, index }">
          <InputText
            :modelValue="data.itemValue"
            @update:modelValue="(value: string | undefined) => updateRow(index, 'itemValue', value ?? '')"
            placeholder="tshirt_2026_from_size"
            size="small"
            class="w-full font-mono text-xs"
          />
        </template>
      </Column>
      <Column header="Label">
        <template #body="{ data }">
          <span class="text-surface-500 text-xs max-w-48 truncate block">{{ getLabel(data.itemValue) }}</span>
        </template>
      </Column>
      <Column style="width: 3rem">
        <template #body="{ index }">
          <button @click="removeRow(index)" class="text-surface-400 hover:text-red-500 w-5 h-5 flex items-center justify-center">
            <i class="pi pi-times text-xs" />
          </button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import type { ConcreteGoodieValue } from "@/config/convention";
import Button from "@/volt/Button.vue";
import DataTable from "@/volt/DataTable.vue";
import InputText from "@/volt/InputText.vue";
import { Column } from "primevue";

export interface RawRow {
  regNum: string;
  itemValue: string;
}

const modelValue = defineModel<RawRow[]>({ required: true });

function getLabel(itemValue: string): string {
  if (!itemValue.trim()) return "";
  return getItemDisplayLabel(itemValue as ConcreteGoodieValue);
}

function parseText(text: string): RawRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 2)
    .map((cols) => ({ regNum: (cols[0] ?? "").trim(), itemValue: (cols[1] ?? "").trim() }))
    .filter((r) => r.regNum || r.itemValue);
}

async function pasteFromClipboard(): Promise<void> {
  try {
    const text = await navigator.clipboard.readText();
    if (text) modelValue.value = [...modelValue.value, ...parseText(text)];
  } catch {
    // Clipboard API unavailable — user should use the paste-on-table method
  }
}

function addRow(): void {
  modelValue.value = [...modelValue.value, { regNum: "", itemValue: "" }];
}

function removeRow(idx: number): void {
  modelValue.value = modelValue.value.filter((_, i) => i !== idx);
}

function clearRows(): void {
  modelValue.value = [];
}

function updateRow(idx: number, field: keyof RawRow, value: string): void {
  const copy = [...modelValue.value];
  copy[idx] = { ...copy[idx]!, [field]: value };
  modelValue.value = copy;
}
</script>
