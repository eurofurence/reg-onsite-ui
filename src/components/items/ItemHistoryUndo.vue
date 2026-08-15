<template>
  <Fieldset legend="Undo Last N Operations" class="p-2">
    <div class="flex flex-col gap-3">
      <div class="flex gap-4 flex-wrap items-end">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-500">By operator</label>
          <Select v-model="undoOperator" :options="uniqueOperators" placeholder="Any" showClear class="w-48" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-500">Number of operations</label>
          <InputNumber v-model="undoCount" :min="1" :max="undoableOps.length || 1" showButtons buttonLayout="horizontal" inputClass="w-16 text-center" />
        </div>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <Button @click="executeUndo" :loading="undoLoading" :disabled="undoTargetOps.length === 0" icon="pi pi-undo" :label="`Undo ${undoTargetOps.length} operation(s)`" severity="warn" />
        <span v-if="undoTargetOps.length > 0" class="text-xs text-surface-400">{{ undoPreviewRegs }} attendee(s) can be reverted</span>
        <span v-else class="text-xs text-surface-400">No matching operations</span>
      </div>
      <div v-if="undoProgress !== null" class="flex flex-col gap-1.5">
        <ProgressBar :value="undoProgress.total > 0 ? Math.round((undoProgress.current / undoProgress.total) * 100) : 0" />
        <div class="text-center text-xs text-surface-400">{{ undoProgress.current }} / {{ undoProgress.total }}</div>
      </div>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { applyRestoreTargets, buildRestoreTargets, type Operation } from "@/composables/items/itemHistoryRestore";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputNumber from "@/volt/InputNumber.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import Select from "@/volt/Select.vue";
import { computed, ref, watch, type Ref } from "vue";

interface Props {
  toastService: OnsiteToastService;
  addInfosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  operations: Operation[];
}
const props = defineProps<Props>();
const emit = defineEmits<{ refreshNeeded: [] }>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const undoOperator: Ref<string | null> = ref(null);
const undoCount = ref(1);
const undoLoading = ref(false);
const undoProgress = ref<{ current: number; total: number } | null>(null);

const uniqueOperators = computed(() => [...new Set(props.operations.map((op) => op.by).filter(Boolean))]);
const undoableOps = computed(() => undoOperator.value ? props.operations.filter((op) => op.by === undoOperator.value) : [...props.operations]);
const undoTargetOps = computed(() => undoableOps.value.slice(0, undoCount.value));

watch(undoableOps, (ops) => {
  if (undoCount.value > (ops.length || 1)) {
    undoCount.value = ops.length || 1;
  }
});
const undoPreviewRegs = computed(() => {
  if (undoTargetOps.value.length === 0) return 0;
  return buildRestoreTargets(props.addInfosMap, undoTargetOps.value[undoTargetOps.value.length - 1]!.whenStart.getTime()).size;
});

async function executeUndo(): Promise<void> {
  if (undoTargetOps.value.length === 0) return;
  undoLoading.value = true;
  const targets = buildRestoreTargets(props.addInfosMap, undoTargetOps.value[undoTargetOps.value.length - 1]!.whenStart.getTime());
  const { success, fail } = await applyRestoreTargets(errorHandler, targets, undoProgress);
  undoLoading.value = false;
  emit("refreshNeeded");
  props.toastService.add({
    severity: fail === 0 ? ToastSeverity.success : ToastSeverity.warn,
    summary: fail === 0 ? "Undo complete" : "Undo partially complete",
    detail: `${success} attendee(s) restored${fail > 0 ? `, ${fail} failed` : ""}.`,
    life: 6000,
  });
}
</script>
