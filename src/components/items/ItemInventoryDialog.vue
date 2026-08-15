<template>
  <Dialog v-model:visible="visible" modal dismissableMask :header="title" class="w-[55rem]">
    <p class="mt-0 mb-3 text-sm text-surface-400">
      Needed Reserve: {{ props.neededReserveCount }} &middot; Free to Sell: {{ props.freeToSellCount }}
    </p>
    <DataTable
      :value="rows"
      dataKey="regNum"
      sortMode="single"
      sortField="missingCount"
      :sortOrder="-1"
      size="small"
      class="w-full"
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
      <Column field="issuedCount" header="Issued" sortable />
      <Column field="reservedCount" header="Reserved" sortable />
      <Column field="missingCount" header="Owed" sortable />
      <Column field="entitledCount" header="Entitled" sortable />
      <Column field="neededReserveCount" header="Needed Reserve" sortable />
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { getConcreteItemsEntitlement } from "@/composables/items/getConcreteItemsEntitlement";
import { getMissingConcreteItems } from "@/composables/items/getMissingConcreteItems";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { Column } from "primevue";
import DataTable from "@/volt/DataTable.vue";
import Dialog from "@/volt/Dialog.vue";
import { computed } from "vue";

interface Props {
  title: string;
  concreteKeys: string[];
  attendeeInfosList: TransformedAttendeeInfo[];
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  neededReserveCount: number;
  freeToSellCount: number;
}
const props = defineProps<Props>();
const visible = defineModel<boolean>("visible", { required: true });

interface DialogRow {
  regNum: RegNumber;
  nickname: string;
  goodieLevel: string;
  role: string;
  issuedCount: number;
  reservedCount: number;
  missingCount: number;
  entitledCount: number;
  neededReserveCount: number;
}

const rows = computed<DialogRow[]>(() => {
  const setup = getConventionSetup();
  const goodieLevelLabels = new Map(setup.metadata.forGoodiesLevels.list.map((e) => [e.value, e.label]));
  const roleLabels = new Map(setup.metadata.forConRole.list.map((e) => [e.value, e.label]));
  const result: DialogRow[] = [];
  for (const attendee of props.attendeeInfosList) {
    if (attendee.id === null) continue;
    const addInfo = props.infosMap.get(attendee.id) ?? getEmptySponsorDeskAddInfo();
    const issuedCount = addInfo.issuedItems.filter((i) => props.concreteKeys.includes(i)).length;
    const reservedCount = addInfo.reservedItems.filter((i) => props.concreteKeys.includes(i)).length;
    const missingCount = getMissingConcreteItems(attendee, addInfo).filter((i) => props.concreteKeys.includes(i)).length;
    const entitledCount = getConcreteItemsEntitlement(attendee, addInfo).filter((i) => props.concreteKeys.includes(i)).length;
    const neededReserveCount = props.concreteKeys.reduce((sum, key) => {
      const keyIssuedCount = addInfo.issuedItems.filter((i) => i === key).length;
      const keyReservedCount = addInfo.reservedItems.filter((i) => i === key).length;
      return sum + Math.max(0, keyReservedCount - keyIssuedCount);
    }, 0);
    if (issuedCount + reservedCount + missingCount === 0) continue;
    result.push({
      regNum: attendee.id,
      nickname: attendee.nickname ?? String(attendee.id),
      goodieLevel: (attendee.transGoodieChoice != null ? goodieLevelLabels.get(attendee.transGoodieChoice) : undefined) ?? attendee.transGoodieChoice ?? "",
      role: (attendee.transConRole != null ? roleLabels.get(attendee.transConRole) : undefined) ?? attendee.transConRole ?? "",
      issuedCount,
      reservedCount,
      missingCount,
      entitledCount,
      neededReserveCount,
    });
  }
  return result;
});
</script>
