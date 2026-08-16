<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <CustomConfirmDialog
    :ref="`preventUnselectDialog${componentId}`"
    :shortcutLabel="ShortcutScope.confirm_deselect_not_checkin"
    class="w-4/5"
  >
    <template #header>
      <CustomConfirmDialogHeader icon="pi pi-question-circle">
        Attendee details are closed without performing a checkin
      </CustomConfirmDialogHeader>
    </template>
    <div class="flex flex-col">
      The attendee was not checked in! Do you want to continue without checking
      in?
    </div>
    <template #accept="{ onClick }">
      <Button @click="onClick">Continue without checkin</Button>
    </template>
    <template #close="{ onClick }">
      <Button outlined @click="onClick">Keep the attendee selected</Button>
    </template>
  </CustomConfirmDialog>
  <div class="flex flex-col w-screen">
    <RegDeskWorkArea
      :ref="`regDeskWorkArea${componentId}`"
      v-model:transformedAttendeeList="pagedListRef"
      v-model:dataOptions="dataOptionsRef"
      v-bind:selectedAttendee="selectedAttendeeRef"
      @update:selectedAttendee="selectedAttendeeUpdater"
      v-model:autoCompleteData="rawListRef"
      v-model:displayOptions="displayOptionsRef"
      v-model:searchStatus="searchStatusRef"
      :enableCashierMode="props.enableCashierMode"
      @onCheckin="onCheckin"
      @onPayment="onPayment"
      @onApprove="onApprove"
      @onPrint="onPrint"
      @onUndoCheckin="onUndoCheckin"
      @onSearchRegNumber="updateAttendee"
      @onPage="onPage"
      @onFilter="onFilter"
      @triggerPreload="doDataPreload"
    />
    <RegDeskRunner
      v-model:displayOptions="displayOptionsRef"
      v-model="selectedAttendeeRef"
    />
    <PrintBadgeDialog
      v-if="printRequestRef"
      :visible="true"
      @update:visible="printRequestRef = null"
      :attendee="printRequestRef.attendee"
      :toastService="toastService"
    />
    <PaymentMethodDialog
      v-if="paymentRequestRef"
      :visible="true"
      @update:visible="paymentRequestRef = null"
      :regNumber="paymentRequestRef"
      :updateAttendee="updateAttendee"
      :toastService="toastService"
    />
  </div>
</template>

<script setup lang="ts">
import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import CustomConfirmDialogHeader from "@/components/dialog/CustomConfirmDialogHeader.vue";
import PaymentMethodDialog from "@/components/regdesk/PaymentMethodDialog.vue";
import PrintBadgeDialog from "@/components/regdesk/PrintBadgeDialog.vue";
import RegDeskRunner from "@/components/regdesk/RegDeskRunner.vue";
import RegDeskWorkArea from "@/components/regdesk/RegDeskWorkArea.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { generateId } from "@/composables/generateId";
import { ensureBadgeConfigLoaded } from "@/composables/services/badgeConfigStore";
import { getOnApproveFunction } from "@/composables/logic/getOnApproveFunction";
import { getOnCheckinFunction } from "@/composables/logic/getOnCheckinFunction";
import { getOnPaymentFunction } from "@/composables/logic/getOnPaymentFunction";
import {
  getOnPrintFunction,
  type PrintBadgeRequest,
} from "@/composables/logic/getOnPrintFunction";
import { getUndoCheckinFunction } from "@/composables/logic/getUndoCheckinFunction";
import { getFunctionForDataPreload } from "@/composables/logic/regdesk/getFunctionForDataPreload";
import { getPreventUnselectIfNotCheckedInFunction } from "@/composables/logic/regdesk/getPreventUnselectIfNotCheckedInFunction";
import { getUpdateAttendeeInListFunction } from "@/composables/logic/regdesk/getUpdateAttendeeInListFunction";
import { restoreSelectionFromRoute } from "@/composables/logic/regdesk/restoreSelectionFromRoute";
import { updateAttendeeOnSelection } from "@/composables/logic/regdesk/updateAttendeeOnSelection";
import { updateRegNumberRoute } from "@/composables/logic/regdesk/updateRegNumberRoute";
import { getIdleNoDataSearchStatus } from "@/composables/search_status/constructors";
import {
  keyboardService,
  ShortcutScope,
} from "@/composables/services/keyboardService";
import { OnsiteToastService } from "@/composables/services/toastService";
import { computedSortedResult } from "@/composables/sort/computedSortedResult";
import { computedFilteredResult } from "@/composables/sort_and_filter/computedFilteredResult";
import { computedPagedResult } from "@/composables/sort_and_filter/computedPagedResult";
import { dirtyState } from "@/composables/state/dirtyState";
import { useSmartCookie } from "@/composables/useSmartCookie";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import { useAttendeeDataOptions } from "@/composables/filter/useAttendeeDataOptions";
import {
  defaultAttendeeTableDisplayOptions,
} from "@/config/system/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { SearchStatus } from "@/types/internal/component/regnumsearch";
import type { AttendeeTableDisplayOptions } from "@/types/internal/system/regdesk";
import Button from "@/volt/Button.vue";
import Toast from "@/volt/Toast.vue";
import type {
  DataTableFilterEvent,
  DataTablePageEvent,
} from "primevue/datatable";
import {
  computed,
  onMounted,
  ref,
  useId,
  useTemplateRef,
  type ComputedRef,
  type Ref,
  type ShallowRef,
} from "vue";

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

onMounted(() => ensureBadgeConfigLoaded(getErrorHandlerFunction(toastService)));

// Filtering - already handled by reactivity of filter data structure!
async function onFilter(_event: DataTableFilterEvent): Promise<void> {}

const selectedAttendeeRef: Ref<TransformedAttendeeInfo | null> = ref(null);

const searchStatusRef: Ref<SearchStatus> = ref<SearchStatus>(
  getIdleNoDataSearchStatus()
);

interface Props {
  enableCashierMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  enableCashierMode: false,
});

const rawListRef: Ref<TransformedAttendeeInfo[]> = ref([]);

const updateAttendee = getUpdateAttendeeInListFunction(
  rawListRef,
  selectedAttendeeRef,
  searchStatusRef,
  toastService
);

updateAttendeeOnSelection(selectedAttendeeRef, updateAttendee);

const preventUnselectDialog: ShallowRef<typeof CustomConfirmDialog | null> =
  useTemplateRef<typeof CustomConfirmDialog>(
    `preventUnselectDialog${componentId}`
  );

const selectedAttendeeUpdater = getPreventUnselectIfNotCheckedInFunction(
  selectedAttendeeRef,
  preventUnselectDialog,
  toastService
);

const onUndoCheckin = getUndoCheckinFunction(updateAttendee, toastService);

const dataOptionsRef = useAttendeeDataOptions(props.enableCashierMode);

const doDataPreload: () => Promise<void> = getFunctionForDataPreload(
  rawListRef,
  toastService
);

dirtyState.regdeskDirty = computed<boolean>(
  () =>
    selectedAttendeeRef.value !== null &&
    selectedAttendeeRef.value?.id !== null &&
    selectedAttendeeRef.value?.status !== AttendeeApiStatus.checked_in
);

const displayOptionsRef: Ref<AttendeeTableDisplayOptions> = useSmartCookie(
  "regdeskDisplay",
  defaultAttendeeTableDisplayOptions
);

keyboardService.pushScope(ShortcutScope.regdesk);

updateRegNumberRoute(selectedAttendeeRef);
restoreSelectionFromRoute(
  toastService,
  dataOptionsRef,
  rawListRef,
  selectedAttendeeRef
);

const focusGlobalFilterInputAndResetFilterRef: Ref<(() => void) | null> = ref<
  (() => void) | null
>(null);

const regDeskMainElement: ShallowRef<typeof RegDeskWorkArea | null> =
  useTemplateRef<typeof RegDeskWorkArea>(`regDeskWorkArea${componentId}`);

onMounted(() => {
  if (regDeskMainElement.value) {
    focusGlobalFilterInputAndResetFilterRef.value =
      regDeskMainElement.value.focusGlobalFilterInputAndResetFilter;
  }
});

const onCheckin: (regNumber: RegNumber) => Promise<void> = getOnCheckinFunction(
  updateAttendee,
  selectedAttendeeRef,
  focusGlobalFilterInputAndResetFilterRef,
  displayOptionsRef,
  toastService
);

const paymentRequestRef: Ref<RegNumber | null> = ref(null);

const onPayment: (regNumber: RegNumber) => void = getOnPaymentFunction(
  paymentRequestRef,
  toastService
);

const onApprove: (regNumber: RegNumber) => Promise<void> = getOnApproveFunction(
  updateAttendee,
  toastService
);

const printRequestRef: Ref<PrintBadgeRequest | null> = ref(null);

const onPrint: (regNumber: RegNumber) => Promise<void> = getOnPrintFunction(
  selectedAttendeeRef,
  printRequestRef,
  toastService
);

//////////////////////////////////////////////////////
// Attendee Filtering
//////////////////////////////////////////////////////

const skipFilterRef: Ref<boolean> = ref<boolean>(false);

const filteredListRef: ComputedRef<TransformedAttendeeInfo[]> =
  computedFilteredResult<TransformedAttendeeInfo>(
    rawListRef,
    dataOptionsRef,
    skipFilterRef
  );

//////////////////////////////////////////////////////
// Attendee Sorting
//////////////////////////////////////////////////////

const sortedListRef: ComputedRef<TransformedAttendeeInfo[]> =
  computedSortedResult<TransformedAttendeeInfo>(
    filteredListRef,
    dataOptionsRef
  );

//////////////////////////////////////////////////////
// Attendee Paging
//////////////////////////////////////////////////////
const pageStart: Ref<number> = ref(0);
const pageSize: Ref<number> = ref(
  defaultAttendeeTableDisplayOptions.displayRowsPerPage
);

async function onPage(event: DataTablePageEvent): Promise<void> {
  pageStart.value = event.first;
  pageSize.value = event.rows;
}

const pagedListRef: Ref<TransformedAttendeeInfo[]> =
  computedPagedResult<TransformedAttendeeInfo>(
    sortedListRef,
    pageStart,
    pageSize
  );
</script>
