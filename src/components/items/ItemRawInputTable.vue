<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2 items-center flex-wrap">
      <Button size="small" icon="pi pi-clipboard" label="Paste from Clipboard" @click="pasteFromClipboard" severity="secondary" />
      <Button size="small" icon="pi pi-plus" label="Add Row" @click="addRow" severity="secondary" />
      <Button size="small" icon="pi pi-trash" label="Clear" @click="clearRows" severity="danger" outlined :disabled="modelValue.length === 0" />
      <span class="text-xs text-surface-400">{{ modelValue.length }} row(s)</span>
    </div>

    <div
      class="border border-surface-300 dark:border-surface-600 rounded-md overflow-auto max-h-64"
    >
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-surface-100 dark:bg-surface-800 z-10">
          <tr>
            <th class="px-2 py-1 text-left font-medium text-xs w-24">Reg #</th>
            <th class="px-2 py-1 text-left font-medium text-xs">Item Value</th>
            <th class="px-2 py-1 text-left font-medium text-xs">Label</th>
            <th class="w-7"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="modelValue.length === 0">
            <td colspan="4" class="px-2 py-6 text-center text-surface-400 text-xs italic">
        Use the Paste from Clipboard button above to import TSV data
            </td>
          </tr>
          <tr
            v-for="(row, idx) in modelValue"
            :key="idx"
            class="border-t border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800/50"
          >
            <td class="px-1 py-0.5">
              <input
                :value="row.regNum"
                @input="updateRow(idx, 'regNum', ($event.target as HTMLInputElement).value)"
                class="w-full bg-transparent border border-transparent focus:border-primary-400 rounded px-1 outline-none text-sm"
                placeholder="12345"
              />
            </td>
            <td class="px-1 py-0.5">
              <input
                :value="row.itemValue"
                @input="updateRow(idx, 'itemValue', ($event.target as HTMLInputElement).value)"
                class="w-full bg-transparent border border-transparent focus:border-primary-400 rounded px-1 outline-none font-mono text-xs"
                placeholder="tshirt_2026_from_size"
              />
            </td>
            <td class="px-2 py-0.5 text-surface-500 text-xs max-w-48 truncate">
              {{ getLabel(row.itemValue) }}
            </td>
            <td class="px-1 py-0.5">
              <button @click="removeRow(idx)" class="text-surface-400 hover:text-red-500 w-5 h-5 flex items-center justify-center">
                <i class="pi pi-times text-xs" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import type { ConcreteGoodieValue } from "@/config/convention";
import Button from "@/volt/Button.vue";

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
