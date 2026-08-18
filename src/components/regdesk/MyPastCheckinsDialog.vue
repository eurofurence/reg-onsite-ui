<template>
  <Dialog
    v-model:visible="visibleRef"
    modal
    dismissableMask
    header="My Past Checkins"
    class="w-4/5"
  >
    <DataTable :value="rows" :loading="loading" scrollable scrollHeight="32rem" size="small">
      <Column field="regNumber" header="Reg Number" />
      <Column field="checkinTime" header="Checked In At">
        <template #body="{ data }">{{ formatTime(data.checkinTime) }}</template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { attendeeService } from "@/composables/services/attendeeService";
import { authState } from "@/composables/state/authState";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { RestErrorInfo } from "@/types/internal/rest";
import { Column } from "primevue";
import DataTable from "@/volt/DataTable.vue";
import Dialog from "@/volt/Dialog.vue";
import { computed, ref, watch, type Ref } from "vue";

const visibleRef = defineModel<boolean>("visible", { required: true });

interface CheckinRow {
  regNumber: RegNumber;
  checkinTime: string;
}

const rows: Ref<CheckinRow[]> = ref([]);
const loading: Ref<boolean> = ref(false);

function formatTime(time: string): string {
  const date = new Date(time);
  return Number.isNaN(date.getTime()) ? time : date.toLocaleString();
}

async function loadCheckins(): Promise<void> {
  loading.value = true;
  rows.value = [];
  const allAddInfos = await attendeeService.addInfos.getAllRegDeskAddInfos(
    (_info: RestErrorInfo) => {}
  );
  if (allAddInfos) {
    const userName = authState.value.userName ?? "";
    const result: CheckinRow[] = [];
    for (const [regNumber, info] of allAddInfos.infos) {
      if (info.checkin_by === userName && info.checkin_time) {
        result.push({ regNumber, checkinTime: info.checkin_time });
      }
    }
    result.sort((a, b) => b.checkinTime.localeCompare(a.checkinTime));
    rows.value = result;
  }
  loading.value = false;
}

const shouldLoad = computed(() => visibleRef.value);
watch(shouldLoad, (visible) => {
  if (visible) {
    loadCheckins();
  }
});
</script>
