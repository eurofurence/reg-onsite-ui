<template>
  <div v-if="props.checkResults" class="flex flex-col gap-2">
    <div class="flex items-center gap-2 text-sm font-semibold">
      <i class="pi pi-info-circle text-blue-500" />
      <span v-if="props.checkResults.unchangedRows.length > 0">
        {{ totalAffectedRegsCount }} of {{ props.checkResults.targetRegCount }} targeted reg(s) will be changed
        (<button class="underline hover:no-underline" @click="unchangedDialogVisible = true">{{ props.checkResults.unchangedRows.length }} unchanged</button>)
      </span>
      <span v-else>
        {{ totalAffectedRegsCount }} of {{ props.checkResults.targetRegCount }} targeted reg(s) will be changed
      </span>
    </div>
    <div
      v-for="group in props.checkResults.groups"
      :key="group.item"
      class="border border-surface-200 dark:border-surface-700 rounded"
    >
      <button
        class="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors rounded"
        @click="expandedItems[group.item] = !expandedItems[group.item]"
      >
        <span :class="['pi', 'text-xs', expandedItems[group.item] ? 'pi-chevron-down' : 'pi-chevron-right']" />
        <span class="font-medium">{{ group.label }}</span>
        <span class="text-muted-color text-sm">({{ group.item }})</span>
        <span class="ml-auto text-sm text-surface-500">{{ group.rows.length }} reg(s) affected</span>
      </button>
      <DataTable
        v-if="expandedItems[group.item]"
        :value="group.rows"
        dataKey="regNum"
        sortMode="single"
        size="small"
        class="border-t border-surface-200 dark:border-surface-700"
      >
        <Column field="regNum" header="Reg" sortable style="width: 5rem" />
        <Column field="nickname" header="Nickname" sortable />
        <Column field="goodieLevel" header="Goodie Level" sortable />
        <Column field="role" header="Role" sortable />
        <Column field="delta" header="Change" sortable>
          <template #body="{ data }">
            <span v-if="data.resolvedItem" class="text-muted-color text-xs block mb-0.5">({{ data.resolvedItem }})</span>
            <span class="text-surface-400 text-sm">{{ data.currentCount }} → {{ data.newCount }}</span>
            <span :class="['ml-2 font-medium', data.delta > 0 ? 'text-green-500' : 'text-red-500']">
              {{ data.delta > 0 ? "+" : "" }}{{ data.delta }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>

    <UnchangedRegsDialog v-model:visible="unchangedDialogVisible" :rows="props.checkResults.unchangedRows" />
  </div>
</template>

<script setup lang="ts">
import type { ConcreteGoodieValue } from "@/config/convention";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { Column } from "primevue";
import DataTable from "@/volt/DataTable.vue";
import UnchangedRegsDialog, { type UnchangedRegRow } from "@/components/items/UnchangedRegsDialog.vue";
import { computed, ref, watch, type Ref } from "vue";

export interface CheckRegRow {
  regNum: RegNumber;
  nickname: string;
  goodieLevel: string;
  role: string;
  currentCount: number;
  newCount: number;
  delta: number;
  resolvedItem?: ConcreteGoodieValue;
}
export interface CheckItemGroup { item: ConcreteGoodieValue; label: string; rows: CheckRegRow[]; }
export interface CheckResults { targetRegCount: number; groups: CheckItemGroup[]; unchangedRows: UnchangedRegRow[]; }

interface Props { checkResults: CheckResults | null; }
const props = defineProps<Props>();

const expandedItems: Ref<Record<string, boolean>> = ref({});
const unchangedDialogVisible = ref(false);

watch(() => props.checkResults, () => { expandedItems.value = {}; });

const totalAffectedRegsCount = computed<number>(() => {
  if (!props.checkResults) return 0;
  return new Set(props.checkResults.groups.flatMap((g) => g.rows.map((r) => r.regNum))).size;
});
</script>
