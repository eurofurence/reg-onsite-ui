<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <CustomConfirmDialog
    :ref="`confirmDialog${componentId}`"
    :shortcut-label="ShortcutScope.confirm_checkin"
    class="w-4/5"
    @onAccept="emitCheckin"
  >
    <template #header>
      <CustomConfirmDialogHeader icon="pi pi-question-circle">
        Confirm
      </CustomConfirmDialogHeader>
    </template>
    Please confirm checkin of attendee!
    <template #accept="{ onClick }">
      <Button @click="onClick">Ok</Button>
    </template>
    <template #close="{ onClick }">
      <Button @click="onClick">Abort</Button>
    </template>
  </CustomConfirmDialog>

  <div>
    <Dialog
      v-model:visible="dialogVisibleIfSelectedRef"
      modal
      :dismissableMask="true"
      :closeOnEscape="false"
      :maximizable="false"
      header="Checkin Dialog"
    >
      <div class="flex">
        <div class="m-auto" v-if="isCheckinDisplayType(CheckinDisplay.dialog)">
          <RegDeskCheckin
            v-model="selectedAttendeePlaceholerAdapterRef"
            v-model:searchStatus="searchStatusRef"
            :enableCashierMode="props.enableCashierMode"
            @onCheckin="emitCheckin"
            @onPayment="emitPayment"
            @onUndoCheckin="$emit('onUndoCheckin', $event)"
            @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
          />
        </div>
      </div>
    </Dialog>
    <div
      class="flex grow pb-2"
      v-if="isCheckinDisplayType(CheckinDisplay.above)"
    >
      <RegDeskCheckin
        v-model="selectedAttendeePlaceholerAdapterRef"
        v-model:searchStatus="searchStatusRef"
        :enableCashierMode="props.enableCashierMode"
        @onCheckin="emitCheckin"
        @onUndoCheckin="$emit('onUndoCheckin', $event)"
        @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
      />
    </div>
    <AttendeeTable
      readonly
      v-model="transformedAttendeeListRef"
      v-model:dataOptions="dataOptionsRef"
      v-model:selected="selectedAttendeeRef"
      v-model:displayOptions="displayOptionsRef"
      v-bind:autoCompleteData="autoCompleteDataRef"
      v-bind:activeColumns="activeColumnsRef"
      @onPage="$emit('onPage', $event)"
      @onSort="$emit('onSort', $event)"
      @onFilter="$emit('onFilter', $event)"
    >
      <template #header>
        <div class="w-full">
          <div class="flex gap-1 justify-between">
            <div class="flex gap-1">
              <GlobalSearchField
                v-model="dataOptionsRef"
                :globaSearchInputId="globaSearchInputId"
                autofocus
              />
              <ResetFilterButton v-model="dataOptionsRef" />
              <SearchElementManual
                v-model="dataOptionsRef"
                @doLoad="$emit('triggerManual', $event)"
              />
            </div>
            <div class="flex gap-1">
              <SearchElementOndemand
                v-model="dataOptionsRef"
                @doLoad="$emit('triggerOndemand', $event)"
              />
              <SearchElementPreload
                v-model="dataOptionsRef"
                @doLoad="$emit('triggerPreload', $event)"
              />
              <Button
                class="h-12 aspect-square"
                v-tooltip.bottom="'Export as CSV'"
                @click="downloadAttendeeCSV"
              >
                <i class="pi pi-external-link" />
              </Button>
              <DisplayButton
                v-model:modelValue="transformedAttendeeListRef"
                :filters="dataOptions.filterConfig.filterValues"
              />
              <RegDeskSettingsButton
                v-model:displayOptions="displayOptionsRef"
                v-model="dataOptionsRef"
              />
            </div>
          </div>
        </div>
      </template>

      <template #empty> </template>
    </AttendeeTable>
    <div
      class="flex grow pt-2"
      v-if="isCheckinDisplayType(CheckinDisplay.below)"
    >
      <RegDeskCheckin
        v-model="selectedAttendeePlaceholerAdapterRef"
        v-model:searchStatus="searchStatusRef"
        :enableCashierMode="props.enableCashierMode"
        @onCheckin="emitCheckin"
        @onUndoCheckin="$emit('onUndoCheckin', $event)"
        @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
      />
    </div>
    <FilterHelp
      :dataOptions="dataOptionsRef"
      :displayOptions="displayOptionsRef"
      :noResults="autoCompleteDataRef.length === 0"
      :noSearchResults="
        transformedAttendeeListRef[0]?.id === null ||
        transformedAttendeeListRef[0]?.id === undefined
      "
      :displayFilterHelp="displayOptionsRef.displayFilterHelp"
      :displayFilterSummary="displayOptionsRef.displayFilterSummary"
    />
  </div>
</template>

<script setup lang="ts">
import AttendeeTable from "@/components/common/attendee_table/AttendeeTable.vue";
import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import CustomConfirmDialogHeader from "@/components/dialog/CustomConfirmDialogHeader.vue";
import FilterHelp from "@/components/regdesk/FilterHelp.vue";
import GlobalSearchField from "@/components/regdesk/GlobalSearchField.vue";
import RegDeskCheckin from "@/components/regdesk/RegDeskCheckin.vue";
import RegDeskSettingsButton from "@/components/regdesk/RegDeskSettingsButton.vue";
import ResetFilterButton from "@/components/regdesk/ResetFilterButton.vue";
import SearchElementManual from "@/components/regdesk/search_element/SearchElementManual.vue";
import SearchElementOndemand from "@/components/regdesk/search_element/SearchElementOndemand.vue";
import SearchElementPreload from "@/components/regdesk/search_element/SearchElementPreload.vue";
import DisplayButton from "@/components/statistics/DisplayButton.vue";
import { computeAttendeePlaceholder } from "@/composables/fields/computeAttendeePlaceholder";
import { doResetFilters } from "@/composables/filter/doResetFilters";
import { generateId } from "@/composables/generateId";
import { getInputElement } from "@/composables/getInputElement";
import { downloadCSV } from "@/composables/logic/downloadCSV";
import { exportAttendeesToCSV } from "@/composables/logic/regdesk/exportAttendeesToCSV";
import { handleAutoSelection } from "@/composables/logic/regdesk/handleAutoSelection";
import { recordAttendeeSelections } from "@/composables/logic/regdesk/recordAttendeeSelections";
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
  watchDialogVisibility,
  type KeyboardServiceEvent,
} from "@/composables/services/keyboardService";
import { OnsiteToastService } from "@/composables/services/toastService";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import { setupColumnDefinitionList } from "@/config/system/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { SearchStatus } from "@/types/internal/component/regnumsearch";
import type { ColumnDefinition } from "@/types/internal/component/table";
import {
  CheckinDisplay,
  type AttendeeDataOptions,
  type AttendeeTableDisplayOptions,
  type CheckinDisplayValue,
} from "@/types/internal/system/regdesk";
import Button from "@/volt/Button.vue";
import Dialog from "@/volt/Dialog.vue";
import Toast from "@/volt/Toast.vue";
import type { ModelRef, WritableComputedRef } from "vue";
import { computed, ref, useId, useTemplateRef, type Ref } from "vue";

interface Props {
  enableCashierMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  enableCashierMode: false,
});

function isCheckinDisplayType(location: CheckinDisplayValue): boolean {
  return displayOptionsRef.value.displayCheckinLocation === location;
}

function getActiveColumnDefinitionList(
  displayColumns: (keyof TransformedAttendeeInfo)[]
): ColumnDefinition[] {
  return setupColumnDefinitionList.filter((item) =>
    displayColumns.includes(item.value)
  );
}

const selectedAttendeeRef: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>("selectedAttendee", {
    required: true,
  });

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });

const searchStatusRef: ModelRef<SearchStatus> = defineModel<SearchStatus>(
  "searchStatus",
  {
    required: true,
  }
);

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>("dataOptions", { required: true });

const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>("autoCompleteData", {
  required: true,
});

const transformedAttendeeListRef: ModelRef<TransformedAttendeeInfo[]> =
  defineModel<TransformedAttendeeInfo[]>("transformedAttendeeList", {
    required: true,
  });

const previousSelectId: Ref<number | undefined> = ref(undefined);

const activeColumnsRef: Ref<ColumnDefinition[]> = ref(
  getActiveColumnDefinitionList(displayOptionsRef.value.displayColumns)
);

recordAttendeeSelections(selectedAttendeeRef, previousSelectId);
handleAutoSelection(
  transformedAttendeeListRef,
  selectedAttendeeRef,
  displayOptionsRef,
  previousSelectId
);

function downloadAttendeeCSV() {
  const csv = exportAttendeesToCSV(autoCompleteDataRef.value);
  downloadCSV(csv, "attendees.csv");
}

const componentId: string = generateId(useId());
const globaSearchInputId: string = `globalSearchInputId${componentId}`;
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const dialogVisibleIfSelectedRef: WritableComputedRef<boolean> = computed({
  get: () =>
    selectedAttendeeRef.value !== null &&
    selectedAttendeeRef.value.id !== null &&
    isCheckinDisplayType(CheckinDisplay.dialog),
  set: (new_value: boolean) => {
    if (new_value === false) {
      selectedAttendeeRef.value = null;
    }
  },
});

watchDialogVisibility(dialogVisibleIfSelectedRef, ShortcutScope.dialog_checkin);

function focusGlobalFilterInputAndResetFilter(): void {
  const inputElement: HTMLInputElement = getInputElement(globaSearchInputId);
  inputElement.focus();
  inputElement.value = "";
  doResetFilters(dataOptionsRef);
}

async function onEscape(event: KeyboardServiceEvent): Promise<boolean> {
  if (event.currentScope === ShortcutScope.regdesk) {
    focusGlobalFilterInputAndResetFilter();
    return true;
  }
  if (event.currentScope === ShortcutScope.dialog_checkin) {
    selectedAttendeeRef.value = null;
    return true;
  }
  return false;
}

keyboardService.registerShortcuts(
  ShortcutScope.regdesk,
  ShortcutEvent.keydown,
  ShortcutKey.escape,
  onEscape
);

const dialog = useTemplateRef<typeof CustomConfirmDialog>(
  `confirmDialog${componentId}`
);

async function onEnter(event: KeyboardServiceEvent): Promise<boolean> {
  if (event.currentScope === ShortcutScope.dialog_checkin) {
    if (selectedAttendeeRef.value?.status !== AttendeeApiStatus.paid) {
      return false;
    }
    if (!dialog.value) {
      return false;
    }
    if (dialog.value.isAlreadyOpen()) {
      return false;
    }
    await dialog.value?.showConfirmDialogBlocking();
    return true;
  }
  return false;
}

keyboardService.registerShortcuts(
  ShortcutScope.regdesk,
  ShortcutEvent.keydown,
  ShortcutKey.enter,
  onEnter
);

const selectedAttendeePlaceholerAdapterRef: WritableComputedRef<TransformedAttendeeInfo> =
  computeAttendeePlaceholder(selectedAttendeeRef, true);
const emit = defineEmits([
  "triggerManual",
  "triggerPreload",
  "triggerOndemand",
  "onCheckin",
  "onPayment",
  "onUndoCheckin",
  "onSearchRegNumber",
  "onSort",
  "onPage",
  "onFilter",
]);

defineExpose({ focusGlobalFilterInputAndResetFilter });

function emitCheckin(): void {
  const regId: RegNumber | null | undefined = selectedAttendeeRef.value?.id;
  if (regId) {
    emit("onCheckin", regId);
  }
}

function emitPayment(): void {
  const regId: RegNumber | null | undefined = selectedAttendeeRef.value?.id;
  if (regId) {
    emit("onPayment", regId);
  }
}
</script>
