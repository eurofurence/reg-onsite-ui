<template>
  <Toast :group="toastGroup" position="bottom-right" />
  <ConfirmDialog :group="confirmDialogGroup" />
  <div class="flex flex-col w-screen">
    <PanelRegdeskDebug
      v-model:transformedAttendeeList="rawListRef"
      v-model:dataOptions="dataOptionsRef"
      v-model:selected="selectedAttendeeRef"
      v-model:displayOptions="displayOptionsRef"
    />
    <PanelRegdeskWorkArea
      v-model:transformedAttendeeList="pagedListRef"
      v-model:dataOptions="dataOptionsRef"
      v-bind:selectedAttendee="selectedAttendeeRef"
      @update:selectedAttendee="selectedAttendeeUpdater"
      v-model:autoCompleteData="rawListRef"
      v-model:displayOptions="displayOptionsRef"
      v-model:searchStatus="searchStatusRef"
      @onCheckin="onCheckin"
      @onUndoCheckin="onUndoCheckin"
      @onSearchRegNumber="updateAttendee"
      @onPage="onPage"
      @onFilter="onFilter"
      @triggerPreload="doDataPreload"
    />
    <PanelRegdeskRunner
      v-model:displayOptions="displayOptionsRef"
      v-model="selectedAttendeeRef"
    />
  </div>
</template>

<script setup lang="ts">
import type { CookieRef } from "#app";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
  SearchStatus,
  TransformedAttendeeInfo,
} from "@/types/internal";
import type {
  DataTableFilterEvent,
  DataTablePageEvent,
} from "primevue/datatable";
import { computedPagedResult } from "@/composables/sort_and_filter/computedPagedResult";
import { computedSortedResult } from "@/composables/sort/computedSortedResult";
import { computedFilteredResult } from "@/composables/sort_and_filter/computedFilteredResult";
import { preventUnselectIfNotCheckedIn } from "@/composables/logic/regdesk/preventUnselectIfNotCheckedIn";

import {
  defaultAttendeeDataOptions,
  defaultAttendeeTableDisplayOptions,
} from "@/config/regdesk";
import { getIdleNoDataSearchStatus } from "@/composables/search_status/constructors";
import { Status } from "@/config/setupStatus";
import { dirtyState } from "@/composables/state/dirtyState";
import type { ToastServiceMethods } from "primevue/toastservice";
import { updateAttendeeOnSelection } from "@/composables/logic/regdesk/updateAttendeeOnSelection";
import { getUpdateAttendeeInListFunction } from "@/composables/logic/regdesk/getUpdateAttendeeInListFunction";
import { getOnCheckinFunction } from "@/composables/logic/getOnCheckinFunction";
import { getUndoCheckinFunction } from "@/composables/logic/getUndoCheckinFunction";
import { getFunctionForDataPreload } from "@/composables/logic/regdesk/getFunctionForDataPreload";
import type { ConfirmServiceMethods } from "@/types/external";
import { keyboardService, ShortcutScope } from "~/composables/services/keyboardService";

const toast: ToastServiceMethods = useToast();

const componentId: string = generateId(useId());
const toastGroup: string = `regdesk${componentId}`;

// Filtering - already handled by reactivity of filter data structure!
async function onFilter(event: DataTableFilterEvent): Promise<void> {}

const selectedAttendeeRef: Ref<TransformedAttendeeInfo | null> = ref(null);

const searchStatusRef: Ref<SearchStatus> = ref<SearchStatus>(
  getIdleNoDataSearchStatus()
);

const rawListRef: Ref<TransformedAttendeeInfo[]> = ref([]);

const updateAttendee = getUpdateAttendeeInListFunction(
  rawListRef,
  selectedAttendeeRef,
  searchStatusRef,
  toast,
  toastGroup
);

updateAttendeeOnSelection(selectedAttendeeRef, updateAttendee);

const confirm: ConfirmServiceMethods = useConfirm();
const confirmDialogGroup: string = `confirmDialogGroup${componentId}`;
const selectedAttendeeUpdater: (
  newValue: TransformedAttendeeInfo | null
) => void = preventUnselectIfNotCheckedIn(
  selectedAttendeeRef,
  confirm,
  confirmDialogGroup
);

const onCheckin: (regNumber: number) => Promise<void> = getOnCheckinFunction(
  updateAttendee,
  toast,
  toastGroup
);

const onUndoCheckin = getUndoCheckinFunction(updateAttendee, toast, toastGroup);

const dataOptionsRef: Ref<AttendeeDataOptions> = ref(
  defaultAttendeeDataOptions
);

const doDataPreload: () => Promise<void> = getFunctionForDataPreload(
  rawListRef,
  toast,
  toastGroup
);

dirtyState.regdeskDirty = computed<boolean>(
  () =>
    selectedAttendeeRef.value !== null &&
    selectedAttendeeRef.value?.id !== null &&
    selectedAttendeeRef.value?.status !== Status.checked_in
);

const displayOptionsRef: CookieRef<AttendeeTableDisplayOptions> =
  useSmartCookie("regdeskDisplay", defaultAttendeeTableDisplayOptions);

keyboardService.pushScope(ShortcutScope.regdesk);


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

const pagedListRef: ComputedRef<TransformedAttendeeInfo[]> =
  computedPagedResult<TransformedAttendeeInfo>(
    sortedListRef,
    pageStart,
    pageSize
  );
</script>
