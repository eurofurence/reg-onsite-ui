<template>
  <Dialog v-model:visible="visible" modal dismissableMask :header="title" class="w-[55rem]">
    <div class="flex items-center justify-between mt-0 mb-3">
      <p class="text-sm text-surface-400 m-0">
        Needed Reserve: {{ props.neededReserveCount }} &middot; Free to Sell: {{ props.freeToSellCount }}
      </p>
      <div class="flex items-center gap-2">
        <Button icon="pi pi-external-link" label="Export CSV" severity="secondary" size="small" @click="exportAsCSV" />
        <Button
          icon="pi pi-truck"
          label="Export for Shipping"
          severity="secondary"
          size="small"
          :disabled="!isAdmin || exportInProgress"
          :loading="exportInProgress"
          @click="exportForShipping"
        />
      </div>
    </div>
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
      <Column field="telegram" header="Telegram" sortable v-if="hasTelegram" />
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
import { postShippingAddresses, type ShippingAddress } from "@/composables/api/backend/postShippingAddresses";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getCountryName } from "@/composables/fields/country/getCountryName";
import { getConcreteItemsEntitlement } from "@/composables/items/getConcreteItemsEntitlement";
import { getMissingConcreteItems } from "@/composables/items/getMissingConcreteItems";
import { downloadCSV } from "@/composables/logic/downloadCSV";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { isInAnyGroup } from "@/composables/state/authState";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { ShippingEmailUse } from "@/types/external/attsrv/additional-info/shipping";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { AuthGroups } from "@/types/internal/convention";
import { Column } from "primevue";
import Button from "@/volt/Button.vue";
import DataTable from "@/volt/DataTable.vue";
import Dialog from "@/volt/Dialog.vue";
import { computed, ref } from "vue";

interface Props {
  title: string;
  concreteKeys: string[];
  attendeeInfosList: TransformedAttendeeInfo[];
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  neededReserveCount: number;
  freeToSellCount: number;
  toastService: OnsiteToastService;
}
const props = defineProps<Props>();
const visible = defineModel<boolean>("visible", { required: true });

const errorHandler = getErrorHandlerFunction(props.toastService);
const isAdmin = computed(() => isInAnyGroup(AuthGroups.admin));
const exportInProgress = ref(false);

interface DialogRow {
  regNum: RegNumber;
  nickname: string;
  telegram: string;
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
      telegram: attendee.telegram ?? "",
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

const hasTelegram = computed(() => rows.value.some((row) => row.telegram !== ""));

function exportAsCSV(): void {
  const headers = ["Reg", "Nickname", "Telegram", "Goodie Level", "Role", "Issued", "Reserved", "Owed", "Entitled", "Needed Reserve"];
  const csvRows = rows.value.map((row) => [
    String(row.regNum),
    row.nickname,
    row.telegram,
    row.goodieLevel,
    row.role,
    String(row.issuedCount),
    String(row.reservedCount),
    String(row.missingCount),
    String(row.entitledCount),
    String(row.neededReserveCount),
  ]);
  const csv = [headers, ...csvRows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n");
  downloadCSV(csv, `${props.title}-attendees.csv`);
}

async function exportForShipping(): Promise<void> {
  if (!isAdmin.value || rows.value.length === 0) {
    return;
  }
  exportInProgress.value = true;
  try {
    const addresses = await postShippingAddresses(
      errorHandler,
      rows.value.map((row) => row.regNum)
    );
    if (addresses === undefined) {
      return;
    }
    const addressesById = new Map<RegNumber, ShippingAddress>(
      addresses.map((address) => [address.id, address])
    );
    const headers = ["Reg", "Nickname", "First Name", "Last Name", "Street", "ZIP", "City", "State", "Country", "T-Shirt Size", "T-Shirt Shape", "Comments", "Email", "Owed"];
    const csvRows = rows.value.map((row) => {
      const address = addressesById.get(row.regNum);
      const email = address?.shipping_email === ShippingEmailUse.email_can_be_shared_with_logistics ? address.email : "";
      return [
        String(row.regNum),
        address?.nickname || row.nickname,
        address?.first_name ?? "",
        address?.last_name ?? "",
        address?.street ?? "",
        address?.zip ?? "",
        address?.city ?? "",
        address?.state ?? "",
        address?.country ? getCountryName(address.country) : "",
        address?.tshirt_size ?? "",
        address?.tshirt_shape ?? "",
        address?.comments ?? "",
        email,
        String(row.missingCount),
      ];
    });
    const csv = [headers, ...csvRows].map((csvRow) => csvRow.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\n");
    downloadCSV(csv, `${props.title}-shipping.csv`);
  } finally {
    exportInProgress.value = false;
  }
}
</script>
