<template>
  <div class="flex flex-col gap-4 pt-4">
    <div class="flex items-center justify-end gap-2">
      <span v-if="!loading" class="text-sm text-surface-400">
        {{ operations.length }} operation(s) across {{ totalAffectedRegs }} attendee(s)
      </span>
      <Button @click="refresh" :loading="loading" icon="pi pi-refresh" severity="secondary" v-tooltip.bottom="'Refresh'" class="h-10 aspect-square" />
    </div>

    <div v-if="loading" class="flex justify-center p-8">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>

    <template v-else-if="operations.length === 0">
      <div class="text-center text-surface-400 py-10 text-sm">No history recorded yet.</div>
    </template>

    <template v-else>
      <ItemHistoryWipe
        :toastService="toastService"
        :addInfosMap="addInfosMap"
        :operationCount="operations.length"
        :affectedRegCount="totalAffectedRegs"
        @refreshNeeded="refresh"
      />
      <ItemHistoryRestore
        :toastService="toastService"
        :addInfosMap="addInfosMap"
        :operations="operations"
        @refreshNeeded="refresh"
      />
      <ItemHistoryUndo
        :toastService="toastService"
        :addInfosMap="addInfosMap"
        :operations="operations"
        @refreshNeeded="refresh"
      />
    </template>

    <ItemHistoryBackupRestore
      v-if="!loading"
      :toastService="toastService"
      @refreshNeeded="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import ItemHistoryBackupRestore from "@/components/items/ItemHistoryBackupRestore.vue";
import ItemHistoryRestore from "@/components/items/ItemHistoryRestore.vue";
import ItemHistoryUndo from "@/components/items/ItemHistoryUndo.vue";
import ItemHistoryWipe from "@/components/items/ItemHistoryWipe.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { buildOperations, type Operation } from "@/composables/items/itemHistoryRestore";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import Button from "@/volt/Button.vue";
import { computed, onMounted, ref, type Ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const loading = ref(true);
const addInfosMap: Ref<Map<RegNumber, ApiSponsorDeskAddInfo>> = ref(new Map());
const operations: Ref<Operation[]> = ref([]);

async function refresh(): Promise<void> {
  loading.value = true;
  const result = await attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler);
  addInfosMap.value = result?.infos ?? new Map();
  operations.value = buildOperations(addInfosMap.value);
  loading.value = false;
}

onMounted(refresh);

const totalAffectedRegs = computed(() =>
  new Set(operations.value.flatMap((op) => [...op.affectedRegs])).size,
);
</script>
