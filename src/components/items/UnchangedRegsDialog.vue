<template>
  <Dialog v-model:visible="visible" modal dismissableMask header="Unchanged Attendees" class="w-[45rem]">
    <DataTable :value="props.rows" dataKey="regNum" sortMode="single" size="small" class="w-full">
      <Column field="regNum" header="Reg" sortable style="width: 5rem" />
      <Column field="nickname" header="Nickname" sortable />
      <Column field="goodieLevel" header="Goodie Level" sortable />
      <Column field="role" header="Role" sortable />
      <Column field="currentCounts" header="Current Count">
        <template #body="{ data }">
          <span v-for="(entry, idx) in (data as UnchangedRegRow).currentCounts" :key="entry.item">
            <span v-if="idx > 0">, </span>{{ entry.item }}: {{ entry.currentCount }}
          </span>
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import type { ConcreteGoodieValue } from "@/config/convention";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { Column } from "primevue";
import DataTable from "@/volt/DataTable.vue";
import Dialog from "@/volt/Dialog.vue";

export interface UnchangedRegRow {
  regNum: RegNumber;
  nickname: string;
  goodieLevel: string;
  role: string;
  currentCounts: Array<{ item: ConcreteGoodieValue; currentCount: number }>;
}

interface Props { rows: UnchangedRegRow[]; }
const props = defineProps<Props>();
const visible = defineModel<boolean>("visible", { required: true });
</script>
