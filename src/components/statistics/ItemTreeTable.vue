<template>
  <div class="flex flex-col items-center gap-2">
    <GoodieTreeTable :nodes="props.nodes" />
    <div class="flex justify-end w-full">
      <Button class="h-10 aspect-square" v-tooltip.top="'Export as CSV'" @click="exportAsCSV">
        <i class="pi pi-external-link" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import GoodieTreeTable from "@/components/items/GoodieTreeTable.vue";
import { downloadCSV } from "@/composables/logic/downloadCSV";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import Button from "@/volt/Button.vue";

interface Props { nodes: GoodieTreeNode[]; }
const props = defineProps<Props>();

function exportAsCSV(): void {
  const headers = ["Item", "Issued", "Reserved", "Owed"];
  const rows: string[][] = [];
  for (const node of props.nodes) {
    rows.push([node.data.label, String(node.data.issuedCount ?? 0), String(node.data.reservedCount ?? 0), String(node.data.boughtCount ?? 0)]);
    for (const child of node.children ?? []) {
      const childLabel = child.data.value.startsWith("tshirt") ? `  T-Shirt ${child.data.label}` : `  ${child.data.label}`;
      rows.push([childLabel, String(child.data.issuedCount ?? 0), String(child.data.reservedCount ?? 0), String(child.data.boughtCount ?? 0)]);
    }
  }
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n");
  downloadCSV(csv, "inventory.csv");
}
</script>
