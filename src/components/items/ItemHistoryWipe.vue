<template>
  <Fieldset v-if="isDevEnv" legend="Wipe History" class="p-2">
    <div class="flex flex-wrap items-center gap-4">
      <span class="text-sm text-surface-500">{{ operationCount }} operation(s) recorded across {{ affectedRegCount }} attendee(s)</span>
      <template v-if="!wipePending">
        <Button @click="wipePending = true" icon="pi pi-trash" label="Wipe all history" severity="danger" />
      </template>
      <template v-else>
        <span class="text-sm text-red-500">Remove all history? Current item states are preserved, but Restore and Undo will no longer be available for these attendees — this cannot be undone.</span>
        <Button @click="executeWipe" :loading="wipeLoading" icon="pi pi-check" label="Yes, wipe" severity="danger" />
        <Button @click="wipePending = false" label="Cancel" severity="secondary" />
      </template>
    </div>
    <div v-if="wipeProgress !== null" class="flex flex-col gap-1.5 mt-3">
      <ProgressBar :value="wipeProgress.total > 0 ? Math.round((wipeProgress.current / wipeProgress.total) * 100) : 0" />
      <div class="text-center text-xs text-surface-400">{{ wipeProgress.current }} / {{ wipeProgress.total }}</div>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { environmentSettings } from "@/composables/services/environmentService";
import { EnvName } from "@/types/internal/env";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import { ref } from "vue";

interface Props {
  toastService: OnsiteToastService;
  addInfosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  operationCount: number;
  affectedRegCount: number;
}
const props = defineProps<Props>();
const emit = defineEmits<{ refreshNeeded: [] }>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const isDevEnv = environmentSettings.envName === EnvName.dev;
const wipePending = ref(false);
const wipeLoading = ref(false);
const wipeProgress = ref<{ current: number; total: number } | null>(null);

async function executeWipe(): Promise<void> {
  wipeLoading.value = true;
  const toWipe: RegNumber[] = [];
  for (const [regNum, addInfo] of props.addInfosMap) {
    if (addInfo.history.length > 0) toWipe.push(regNum);
  }
  wipeProgress.value = { current: 0, total: toWipe.length };
  let success = 0, fail = 0;
  for (const regNum of toWipe) {
    const addInfo = props.addInfosMap.get(regNum)!;
    const result = await putAddInfo<ApiSponsorDeskAddInfo>("Attendee Items Service", "sponsordesk", errorHandler, regNum, { ...addInfo, history: [] });
    if (result !== undefined) success++; else fail++;
    wipeProgress.value!.current++;
  }
  wipeProgress.value = null;
  wipePending.value = false;
  wipeLoading.value = false;
  emit("refreshNeeded");
  props.toastService.add({
    severity: fail === 0 ? ToastSeverity.success : ToastSeverity.warn,
    summary: "History wiped",
    detail: `Cleared history for ${success} attendee(s)${fail > 0 ? `, ${fail} failed` : ""}.`,
    life: 4000,
  });
}
</script>
