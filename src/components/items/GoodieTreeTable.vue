<template>
  <DataTable :value="flatItems" dataKey="key" class="w-fit">
    <Column v-if="showCheckboxes" style="width: 2.5rem">
      <template #body="{ data }">
        <Checkbox
          binary
          :modelValue="isChecked(data)"
          :indeterminate="isPartial(data)"
          @update:modelValue="onCheck(data, $event)"
        />
      </template>
    </Column>

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

    <Column>
      <template #header>
        <button class="flex items-center gap-1 font-bold" @click="toggleSort('label')">
          Item <span :class="sortIconClass('label')" />
        </button>
      </template>
      <template #body="{ data }">
        <span :class="{ 'ml-6': data.depth === 1 }">
          {{ data.label }}
          <span class="text-muted-color text-sm">({{ data.value }})</span>
        </span>
      </template>
    </Column>

    <Column v-for="col in columns" :key="col.field">
      <template #header>
        <button class="flex items-center gap-1 font-bold" @click="toggleSort(col.field)">
          {{ col.header }} <span :class="sortIconClass(col.field)" />
        </button>
      </template>
      <template #body="{ data }">{{ data[col.field] ?? 0 }}</template>
    </Column>

    <Column v-if="$slots.action" style="width: 3rem">
      <template #body="{ data }">
        <slot name="action" :data="data" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { getSponsorDeskConfig } from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import type { ConcreteGoodieValue } from "@/config/convention";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import Checkbox from "@/volt/Checkbox.vue";
import DataTable from "@/volt/DataTable.vue";
import { Column } from "primevue";
import { computed, onMounted, ref } from "vue";

export interface ColumnDef { field: string; header: string; }

export interface FlatRow {
  key: string; label: string; value: string;
  hasChildren: boolean; isExpanded: boolean; depth: number;
  [key: string]: any;
}

interface Props {
  nodes: GoodieTreeNode[];
  columns?: ColumnDef[];
  showCheckboxes?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  columns: () => [
    { field: "issuedCount", header: "Issued" },
    { field: "reservedCount", header: "Reserved" },
    { field: "boughtCount", header: "Owed" },
    { field: "soldCount", header: "Sold" },
  ],
  showCheckboxes: false,
});

const selectedItems = defineModel<ConcreteGoodieValue[]>("selectedItems");

// --- sold items (loaded from reg #0) ---
const soldCountMap = ref<Map<string, number>>(new Map());

onMounted(async () => {
  const config = await getSponsorDeskConfig(() => {});
  if (!config?.soldItems?.length) return;
  const map = new Map<string, number>();
  for (const item of config.soldItems) map.set(item, (map.get(item) ?? 0) + 1);
  soldCountMap.value = map;
});

function nodeSoldCount(node: GoodieTreeNode): number {
  if (node.children?.length) {
    return node.children.reduce((sum, c) => sum + (soldCountMap.value.get(c.key) ?? 0), 0);
  }
  return soldCountMap.value.get(node.key) ?? 0;
}

// --- sort ---
const sortField = ref<string>("boughtCount");
const sortOrder = ref<1 | -1>(-1);

function toggleSort(field: string): void {
  if (sortField.value === field) sortOrder.value = sortOrder.value === 1 ? -1 : 1;
  else { sortField.value = field; sortOrder.value = field === "label" ? 1 : -1; }
}

function sortIconClass(field: string): string {
  if (sortField.value !== field) return "pi pi-sort text-muted-color text-xs";
  return sortOrder.value === 1 ? "pi pi-sort-amount-up text-xs" : "pi pi-sort-amount-down text-xs";
}

// --- expand ---
const expandedRows = ref<Record<string, boolean>>({});

function toggleExpand(key: string): void {
  if (expandedRows.value[key]) { const u = { ...expandedRows.value }; delete u[key]; expandedRows.value = u; }
  else expandedRows.value = { ...expandedRows.value, [key]: true };
}

// --- flat rows ---
const flatItems = computed<FlatRow[]>(() => {
  const field = sortField.value;
  const order = sortOrder.value;
  const compare = (a: GoodieTreeNode, b: GoodieTreeNode): number => {
    const aVal = field === "soldCount" ? nodeSoldCount(a) : ((a.data as any)[field] ?? 0);
    const bVal = field === "soldCount" ? nodeSoldCount(b) : ((b.data as any)[field] ?? 0);
    if (typeof aVal === "string" && typeof bVal === "string") return order * aVal.localeCompare(bVal);
    return order * (Number(aVal) - Number(bVal));
  };
  const result: FlatRow[] = [];
  for (const node of [...props.nodes].sort(compare)) {
    const isExpanded = !!expandedRows.value[node.key];
    result.push({ ...node.data, key: node.key, soldCount: nodeSoldCount(node), hasChildren: !!(node.children?.length), isExpanded, depth: 0 });
    if (isExpanded && node.children?.length) {
      for (const child of [...node.children].sort(compare)) {
        result.push({ ...child.data, key: child.key, soldCount: soldCountMap.value.get(child.key) ?? 0, hasChildren: false, isExpanded: false, depth: 1 });
      }
    }
  }
  return result;
});

// --- checkboxes ---
function childKeys(key: string): ConcreteGoodieValue[] {
  return (props.nodes.find(n => n.key === key)?.children?.map(c => c.key) ?? []) as ConcreteGoodieValue[];
}

function isChecked(row: FlatRow): boolean {
  if (!selectedItems.value) return false;
  const keys = row.hasChildren ? childKeys(row.key) : [row.key as ConcreteGoodieValue];
  return keys.length > 0 && keys.every(k => selectedItems.value!.includes(k));
}

function isPartial(row: FlatRow): boolean {
  if (!row.hasChildren || !selectedItems.value) return false;
  const keys = childKeys(row.key);
  const count = keys.filter(k => selectedItems.value!.includes(k)).length;
  return count > 0 && count < keys.length;
}

function onCheck(row: FlatRow, checked: boolean): void {
  const keys = row.hasChildren ? childKeys(row.key) : [row.key as ConcreteGoodieValue];
  if (checked) {
    selectedItems.value = [...new Set([...(selectedItems.value ?? []), ...keys])];
  } else {
    const keysSet = new Set<string>(keys);
    selectedItems.value = (selectedItems.value ?? []).filter(k => !keysSet.has(k));
  }
}
</script>
