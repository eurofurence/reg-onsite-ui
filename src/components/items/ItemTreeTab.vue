<template>
  <div class="flex flex-col gap-4 pt-4">
    <div class="flex items-center gap-4 justify-center flex-wrap">
      <LabeledToggleSwitch label="Hide items with zero activity" v-model="hideZeroActivity" />
      <LabeledToggleSwitch label="Hide items not in current iteration" v-model="hideNotCurrentIteration" />
    </div>

    <div class="flex items-center gap-2 justify-center">
      <span v-if="!loading" class="text-sm text-surface-400">
        {{ itemTreeNodes.length }} item type(s)
      </span>
      <Button
        @click="refresh"
        :loading="loading"
        icon="pi pi-refresh"
        severity="secondary"
        v-tooltip.bottom="'Refresh'"
        class="h-10 aspect-square"
      />
      <Button
        icon="pi pi-external-link"
        label="Download Inventory"
        @click="exportItemTreeAsCSV"
        :disabled="loading"
        severity="secondary"
        class="h-10"
      />
      <Button
        icon="pi pi-external-link"
        label="Download Attendee Data"
        @click="exportAttendeeDataAsCSV"
        :disabled="loading"
        severity="secondary"
        class="h-10"
      />
    </div>

    <div v-if="loading" class="flex justify-center p-8">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>

    <div v-else class="flex flex-col items-center gap-8">
      <GoodieTreeTable :nodes="itemTreeNodes" :columns="columns">
        <template #action="{ data }">
          <button
            v-if="data.issuedCount + data.reservedCount + data.entitledCount > 0"
            class="flex items-center justify-center w-7 h-7 rounded hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
            @click="openDialog(data)"
            v-tooltip.left="'Show attendees'"
          >
            <i class="pi pi-search text-xs" />
          </button>
        </template>
      </GoodieTreeTable>
      <ItemFrequencyChart
        :infosMap="infosMap"
        :attendeeInfos="attendeeInfosList"
        :soldCount="configCounts.soldCount"
        :inventoryCount="configCounts.inventoryCount"
      />
    </div>
  </div>

  <ItemInventoryDialog
    v-model:visible="dialogVisible"
    :title="dialogTitle"
    :concreteKeys="dialogConcreteKeys"
    :attendeeInfosList="attendeeInfosList"
    :infosMap="infosMap"
    :neededReserveCount="dialogNeededReserveCount"
    :freeToSellCount="dialogFreeToSellCount"
  />
</template>

<script setup lang="ts">
import LabeledToggleSwitch from "@/components/common/LabeledToggleSwitch.vue";
import GoodieTreeTable, { type ColumnDef, type FlatRow } from "@/components/items/GoodieTreeTable.vue";
import ItemInventoryDialog from "@/components/items/ItemInventoryDialog.vue";
import ItemFrequencyChart from "@/components/statistics/ItemFrequencyChart.vue";
import { buildItemTree } from "@/composables/items/buildItemTreeNodes";
import { getMissingConcreteItems } from "@/composables/items/getMissingConcreteItems";
import { getSponsorDeskConfigCounts, type SponsorDeskConfigCounts } from "@/composables/items/getSponsorDeskConfigCounts";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import { downloadCSV } from "@/composables/logic/downloadCSV";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { initialAuthCheckSettled } from "@/composables/state/authState";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import Button from "@/volt/Button.vue";
import { computed, onMounted, ref, type Ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const loading: Ref<boolean> = ref(true);
const infosMap: Ref<Map<RegNumber, ApiSponsorDeskAddInfo>> = ref(new Map());
const attendeeInfosList: Ref<TransformedAttendeeInfo[]> = ref([]);
const configCounts: Ref<SponsorDeskConfigCounts> = ref({ soldCount: {}, inventoryCount: {} });
const hideZeroActivity = ref(true);
const hideNotCurrentIteration = ref(true);

async function refresh(): Promise<void> {
  loading.value = true;
  const [allAttendees, allAddInfos, counts] = await Promise.all([
    attendeeService.getAllAttendees(errorHandler, true),
    attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler),
    getSponsorDeskConfigCounts(errorHandler),
  ]);
  attendeeInfosList.value = allAttendees ?? [];
  infosMap.value = allAddInfos?.infos ?? new Map();
  configCounts.value = counts;
  loading.value = false;
}

onMounted(async () => {
  await initialAuthCheckSettled;
  await refresh();
});

const itemTreeNodes = computed<GoodieTreeNode[]>(() =>
  buildItemTree(
    infosMap.value,
    attendeeInfosList.value,
    configCounts.value.soldCount,
    configCounts.value.inventoryCount,
    hideZeroActivity.value,
    hideNotCurrentIteration.value,
  )
);

const columns: ColumnDef[] = [
  { field: "issuedCount", header: "Issued" },
  { field: "reservedCount", header: "Reserved" },
  { field: "entitledCount", header: "Entitled" },
  { field: "soldCount", header: "Sold" },
  { field: "inventoryCount", header: "Inventory" },
  { field: "neededReserveCount", header: "Needed Reserve" },
  { field: "freeToSellCount", header: "Free to Sell" },
];

function exportItemTreeAsCSV(): void {
  const headers = ["Item", "Issued", "Reserved", "Entitled", "Sold", "Inventory", "Needed Reserve", "Free to Sell"];
  const rows: string[][] = [];
  for (const node of itemTreeNodes.value) {
    rows.push([node.data.label, String(node.data.issuedCount ?? 0), String(node.data.reservedCount ?? 0), String(node.data.entitledCount ?? 0), String(node.data.soldCount ?? 0), String(node.data.inventoryCount ?? 0), String(node.data.neededReserveCount ?? 0), String(node.data.freeToSellCount ?? 0)]);
    for (const child of node.children ?? []) {
      const childLabel = child.data.value.startsWith("tshirt") ? `  T-Shirt ${child.data.label}` : `  ${child.data.label}`;
      rows.push([childLabel, String(child.data.issuedCount ?? 0), String(child.data.reservedCount ?? 0), String(child.data.entitledCount ?? 0), String(child.data.soldCount ?? 0), String(child.data.inventoryCount ?? 0), String(child.data.neededReserveCount ?? 0), String(child.data.freeToSellCount ?? 0)]);
    }
  }
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n");
  downloadCSV(csv, "inventory.csv");
}

function exportAttendeeDataAsCSV(): void {
  const empty = getEmptySponsorDeskAddInfo();
  const headers = ["Reg ID", "Nickname", "Comment", "Issued Items", "Reserved Items", "Owed Items"];
  const rows: string[][] = [];
  for (const attendee of attendeeInfosList.value) {
    if (attendee.id === null) continue;
    const addInfo = infosMap.value.get(attendee.id) ?? empty;
    const missingItems = getMissingConcreteItems(attendee, addInfo);
    if (!addInfo.comment && addInfo.issuedItems.length === 0 && addInfo.reservedItems.length === 0 && missingItems.length === 0) continue;
    rows.push([
      String(attendee.id),
      attendee.nickname ?? "",
      addInfo.comment,
      addInfo.issuedItems.join("|"),
      addInfo.reservedItems.join("|"),
      missingItems.join("|"),
    ]);
  }
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n");
  downloadCSV(csv, "attendee-data.csv");
}

const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogConcreteKeys = ref<string[]>([]);
const dialogNeededReserveCount = ref(0);
const dialogFreeToSellCount = ref(0);

function openDialog(row: FlatRow): void {
  dialogConcreteKeys.value = row.hasChildren
    ? (itemTreeNodes.value.find((n) => n.key === row.key)?.children?.map((c) => c.key) ?? [row.key])
    : [row.key];
  dialogTitle.value = `${row.label} (${row.value})`;
  dialogNeededReserveCount.value = row.neededReserveCount ?? 0;
  dialogFreeToSellCount.value = row.freeToSellCount ?? 0;
  dialogVisible.value = true;
}
</script>
