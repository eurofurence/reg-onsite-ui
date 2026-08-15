<template>
  <Fieldset legend="Restore from Backup File" class="p-2">
    <div class="flex flex-col gap-3">
      <p class="text-sm text-surface-500">
        Load a previously downloaded backup JSON file (e.g. from the "Download Backup" action)
        to restore attendees to the state captured in that file.
      </p>
      <div class="flex items-center gap-3 flex-wrap">
        <Button @click="pickFile" icon="pi pi-upload" label="Choose Backup File" severity="secondary" />
        <input ref="fileInput" type="file" accept=".json" class="hidden" @change="onFileChange" />
        <span v-if="fileName" class="text-xs text-surface-400">{{ fileName }} — {{ backupTargets.size }} attendee(s)</span>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <Button
          @click="executeRestore"
          :loading="restoreLoading"
          :disabled="backupTargets.size === 0"
          icon="pi pi-history"
          label="Restore from Backup"
          severity="warn"
        />
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
import { applyRestoreTargets, parseBackupFile } from "@/composables/items/itemHistoryRestore";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import { ref, type Ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const emit = defineEmits<{ refreshNeeded: [] }>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const fileInput: Ref<HTMLInputElement | null> = ref(null);
const fileName: Ref<string | null> = ref(null);
const backupTargets: Ref<Map<RegNumber, ApiSponsorDeskAddInfo>> = ref(new Map());
const restoreLoading = ref(false);
const restoreProgress = ref<{ current: number; total: number } | null>(null);

function pickFile(): void {
  fileInput.value?.click();
}

async function onFileChange(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  (event.target as HTMLInputElement).value = "";
  if (!file) return;
  const text = await file.text();
  try {
    backupTargets.value = parseBackupFile(text);
    fileName.value = file.name;
  } catch {
    backupTargets.value = new Map();
    fileName.value = null;
    props.toastService.add({
      severity: ToastSeverity.error,
      summary: "Invalid backup file",
      life: 4000,
    });
  }
}

async function executeRestore(): Promise<void> {
  if (backupTargets.value.size === 0) return;
  restoreLoading.value = true;
  const { success, fail } = await applyRestoreTargets(errorHandler, backupTargets.value, restoreProgress);
  backupTargets.value = new Map();
  fileName.value = null;
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
