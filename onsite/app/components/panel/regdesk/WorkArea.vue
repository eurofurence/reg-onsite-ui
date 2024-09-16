<template>
  <div>
    <ConfirmDialog :group="confirmDialogGroup" />
    <Dialog
      v-model:visible="dialogVisibleIfSelectedRef"
      modal
      :dismissableMask="true"
      :closeOnEscape="false"
      :maximizable="true"
      header="Checkin Dialog"
    >
      <div class="flex">
        <div class="m-auto" v-if="isCheckinDisplayType(CheckinDisplay.dialog)">
          <PanelRegdeskCheckin
            v-model="selectedAttendeePlaceholerAdapterRef"
            v-model:searchStatus="searchStatusRef"
            @onCheckin="$emit('onCheckin', $event)"
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
      <PanelRegdeskCheckin
        v-model="selectedAttendeePlaceholerAdapterRef"
        v-model:searchStatus="searchStatusRef"
        @onCheckin="$emit('onCheckin', $event)"
        @onUndoCheckin="$emit('onUndoCheckin', $event)"
        @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
      />
    </div>
    <CustomRegdeskAttendeeTable
      readonly
      v-model="transformedAttendeeListRef"
      v-model:autoCompleteData="autoCompleteDataRef"
      v-model:dataOptions="dataOptionsRef"
      v-model:selected="selectedAttendeeRef"
      v-model:displayOptions="displayOptionsRef"
      @onPage="$emit('onPage', $event)"
      @onSort="$emit('onSort', $event)"
      @onFilter="$emit('onFilter', $event)"
    >
      <template #header>
        <div class="w-full">
          <div class="flex gap-1 justify-between">
            <div class="flex gap-1">
              <CustomRegdeskGlobalSearchField
                v-model="dataOptionsRef"
                :inputId="globaSearchInputId"
                autofocus
              />
              <CustomRegdeskResetFilterButton v-model="dataOptionsRef" />
              <CustomRegdeskSearchElementManual
                v-model="dataOptionsRef"
                @doLoad="$emit('triggerManual', $event)"
              />
            </div>
            <div class="flex gap-1">
              <CustomRegdeskSearchElementOndemand
                v-model="dataOptionsRef"
                @doLoad="$emit('triggerOndeman', $event)"
              />
              <CustomRegdeskSearchElementPreload
                v-model="dataOptionsRef"
                @doLoad="$emit('triggerPreload', $event)"
              />
              <CustomStatisticsDisplayButton
                v-model:modelValue="transformedAttendeeListRef"
                :filters="dataOptions.filters"
              />
              <CustomRegdeskSettingsButton
                v-model:displayOptions="displayOptionsRef"
                v-model="dataOptionsRef"
              />
            </div>
          </div>
        </div>
      </template>

      <template #empty> </template>
    </CustomRegdeskAttendeeTable>
    <CustomRegdeskFilterHelp
      :dataOptions="dataOptionsRef"
      :displayOptions="displayOptionsRef"
    />
    <div
      class="flex grow pt-2"
      v-if="isCheckinDisplayType(CheckinDisplay.below)"
    >
      <PanelRegdeskCheckin
        v-model="selectedAttendeePlaceholerAdapterRef"
        v-model:searchStatus="searchStatusRef"
        @onCheckin="$emit('onCheckin', $event)"
        @onUndoCheckin="$emit('onUndoCheckin', $event)"
        @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckinDisplay } from "@/types/internal";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
  CheckinDisplayValue,
  SearchStatus,
  TransformedAttendeeInfo,
} from "@/types/internal";
import { computeAttendeePlaceholder } from "@/composables/fields/computeAttendeePlaceholder";
import type { WritableComputedRef } from "vue";
import type { ModelRef } from "vue";
import { recordAttendeeSelections } from "@/composables/logic/regdesk/recordAttendeeSelections";
import { handleAutoSelection } from "@/composables/logic/regdesk/handleAutoSelection";
import { preventUnselectIfNotCheckedIn } from "@/composables/logic/regdesk/preventUnselectIfNotCheckedIn";
import type { ConfirmServiceMethods } from "@/types/external";

function isCheckinDisplayType(location: CheckinDisplayValue): boolean {
  return displayOptionsRef.value.displayCheckinLocation === location;
}

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

recordAttendeeSelections(selectedAttendeeRef, previousSelectId);
handleAutoSelection(
  transformedAttendeeListRef,
  selectedAttendeeRef,
  displayOptionsRef,
  previousSelectId
);

const confirm: ConfirmServiceMethods = useConfirm();
const componentId: string = generateId(useId());
const confirmDialogGroup: string = `confirmDialogGroup${componentId}`;
const globaSearchInputId: string = `globaSearchInputId${componentId}`;

preventUnselectIfNotCheckedIn(
  selectedAttendeeRef,
  transformedAttendeeListRef,
  confirm,
  confirmDialogGroup,
  () => {}
);

const selectedAttendeePlaceholerAdapterRef: WritableComputedRef<TransformedAttendeeInfo> =
  computeAttendeePlaceholder(selectedAttendeeRef, true);
defineEmits([
  "triggerManual",
  "triggerPreload",
  "triggerOndeman",
  "onCheckin",
  "onUndoCheckin",
  "onSearchRegNumber",
  "onSort",
  "onPage",
  "onFilter",
]);
</script>
