<template>
  <div class="flex flex-col gap-4 pt-4">
    <div class="flex items-center gap-2 justify-center">
      <span v-if="!loading" class="text-sm text-surface-400">
        {{ rows.length }} attendee(s) with comments
      </span>
      <Button
        @click="refresh"
        :loading="loading"
        icon="pi pi-refresh"
        severity="secondary"
        v-tooltip.bottom="'Refresh'"
        class="h-10 aspect-square"
      />
    </div>

    <div v-if="loading" class="flex justify-center p-8">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>

    <div v-else class="flex justify-center">
      <DataTable
        :value="rows"
        dataKey="regNum"
        sortMode="single"
        sortField="regNum"
        :sortOrder="1"
        size="small"
        class="w-full max-w-4xl"
      >
        <Column field="regNum" header="Reg" sortable style="width: 5rem" />
        <Column field="nickname" header="Nickname" sortable style="max-width: 20ch">
          <template #body="{ data }">
            <span class="block truncate" v-tooltip.top="data.nickname">
              {{ data.nickname }}
            </span>
          </template>
        </Column>
        <Column field="goodieLevel" header="Goodie Level" sortable />
        <Column field="role" header="Role" sortable />
        <Column field="comment" header="Comment">
          <template #body="{ data }">
            <span class="whitespace-pre-wrap">{{ data.comment }}</span>
          </template>
        </Column>
        <Column style="width: 3rem">
          <template #body="{ data }">
            <a
              :href="conStoreLink(data.regNum)"
              class="flex items-center justify-center w-7 h-7 rounded hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
              v-tooltip.left="'Open in Con Store'"
            >
              <i class="pi pi-shopping-cart text-xs" />
            </a>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Button from "@/volt/Button.vue";
import DataTable from "@/volt/DataTable.vue";
import { Column } from "primevue";
import { computed, onMounted, ref, type Ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const loading: Ref<boolean> = ref(true);
const infosMap: Ref<Map<RegNumber, ApiSponsorDeskAddInfo>> = ref(new Map());
const attendeeInfosList: Ref<TransformedAttendeeInfo[]> = ref([]);

async function refresh(): Promise<void> {
  loading.value = true;
  const [allAttendees, allAddInfos] = await Promise.all([
    attendeeService.getAllAttendees(errorHandler, true),
    attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler),
  ]);
  attendeeInfosList.value = allAttendees ?? [];
  infosMap.value = allAddInfos?.infos ?? new Map();
  loading.value = false;
}

onMounted(refresh);

function conStoreLink(regNum: RegNumber): string {
  return `${import.meta.env.BASE_URL}/constore#${regNum}`;
}

interface CommentRow {
  regNum: RegNumber;
  nickname: string;
  goodieLevel: string;
  role: string;
  comment: string;
}

const rows = computed<CommentRow[]>(() => {
  const setup = getConventionSetup();
  const goodieLevelLabels = new Map(setup.metadata.forGoodiesLevels.list.map((e) => [e.value, e.label]));
  const roleLabels = new Map(setup.metadata.forConRole.list.map((e) => [e.value, e.label]));
  const result: CommentRow[] = [];
  for (const attendee of attendeeInfosList.value) {
    if (attendee.id === null) continue;
    const addInfo = infosMap.value.get(attendee.id);
    if (!addInfo?.comment) continue;
    result.push({
      regNum: attendee.id,
      nickname: attendee.nickname ?? String(attendee.id),
      goodieLevel: (attendee.transGoodieChoice != null ? goodieLevelLabels.get(attendee.transGoodieChoice) : undefined) ?? attendee.transGoodieChoice ?? "",
      role: (attendee.transConRole != null ? roleLabels.get(attendee.transConRole) : undefined) ?? attendee.transConRole ?? "",
      comment: addInfo.comment,
    });
  }
  return result;
});
</script>
