<template>
  <Fieldset legend="Restore to Moment" class="p-2">
    <div class="flex flex-col gap-3">
      <p class="text-sm text-surface-500">
        Select an operation. All attendees will be restored to their state just before that operation.
        Attendees with no history entry before the selected point will be reverted to default (empty) values.
      </p>
      <DataTable :value="operations" dataKey="id" v-model:selection="selectedOperation" selectionMode="single" size="small" class="w-full">
        <Column selectionMode="single" style="width: 3rem" />
        <Column field="whenStart" header="Time" sortable style="width: 14rem">
          <template #body="{ data }">{{ formatTimestamp(data.whenStart) }}</template>
        </Column>
        <Column field="by" header="Operator" sortable style="width: 10rem" />
        <Column header="Regs" style="width: 5rem">
          <template #body="{ data }">{{ data.affectedRegs.size }}</template>
        </Column>
      </DataTable>
      <div class="flex items-center gap-3 flex-wrap">
        <Button @click="executeRestore" :loading="restoreLoading" :disabled="!selectedOperation" icon="pi pi-history" label="Restore to before selected" severity="warn" />
        <span v-if="selectedOperation" class="text-xs text-surface-400">{{ restorePreviewRegs }} attendee(s) can be restored</span>
      </div>
      <div v-if="restoreProgress !== null" class="flex flex-col gap-1.5">
        <ProgressBar :value="restoreProgress.total > 0 ? Math.round((restoreProgress.current / restoreProgress.total) * 100) : 0" />
        <div class="text-center text-xs text-surface-400">{{ restoreProgress.current }} / {{ restoreProgress.total }}</div>
      </div>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { applyRestoreTargets, buildRestoreTargets, formatTimestamp, type Operation } from "@/composables/items/itemHistoryRestore";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import { Column } from "primevue";
import Button from "@/volt/Button.vue";
import DataTable from "@/volt/DataTable.vue";
import Fieldset from "@/volt/Fieldset.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import { computed, ref, type Ref } from "vue";

interface Props {
  toastService: OnsiteToastService;
  addInfosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  operations: Operation[];
}
const props = defineProps<Props>();
const emit = defineEmits<{ refreshNeeded: [] }>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const selectedOperation: Ref<Operation | null> = ref(null);
const restoreLoading = ref(false);
const restoreProgress = ref<{ current: number; total: number } | null>(null);

const restorePreviewRegs = computed(() =>
  selectedOperation.value ? buildRestoreTargets(props.addInfosMap, selectedOperation.value.whenStart.getTime()).size : 0,
);

async function executeRestore(): Promise<void> {
  if (!selectedOperation.value) return;
  restoreLoading.value = true;
  const targets = buildRestoreTargets(props.addInfosMap, selectedOperation.value.whenStart.getTime());
  const { success, fail } = await applyRestoreTargets(errorHandler, targets, restoreProgress);
  selectedOperation.value = null;
  restoreLoading.value = false;
  emit("refreshNeeded");
  props.toastService.add({
    severity: fail === 0 ? ToastSeverity.success : ToastSeverity.warn,
    summary: fail === 0 ? "Restore complete" : "Restore partially complete",
    detail: `${success} attendee(s) restored${fail > 0 ? `, ${fail} failed` : ""}.`,
    life: 6000,
  });
}
</script>
