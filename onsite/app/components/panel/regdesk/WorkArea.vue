<template>
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
                :globaSearchInputId="globaSearchInputId"
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
import { watchDialogVisibility } from "@/composables/services/keyboardService";
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
} from "@/composables/services/keyboardService";
import { defaultAttendeeDataOptions } from "@/config/regdesk";
import { deepCopy } from "@/composables/state/deepCopy";
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

const componentId: string = generateId(useId());
const globaSearchInputId: string = `globalSearchInputId${componentId}`;
const confirmGroup: string = `confirmCheckin${componentId}`;
const confirm: ConfirmServiceMethods = useConfirm();

watchDialogVisibility(dialogVisibleIfSelectedRef, ShortcutScope.dialog_checkin);

function focusGlobalFilterInputAndResetFilter() {
  const inputElement: HTMLInputElement = getInputElement(globaSearchInputId);
  inputElement.focus();
  inputElement.value = "";
  dataOptionsRef.value.filters = deepCopy(defaultAttendeeDataOptions.filters);
}

async function onEscape(event: KeyboardEvent): Promise<void> {
  if (keyboardService.getCurrentScope() === ShortcutScope.regdesk) {
    focusGlobalFilterInputAndResetFilter();
    event.preventDefault();
  } else if (keyboardService.getCurrentScope() === ShortcutScope.dialog_checkin) {
    selectedAttendeeRef.value = null;
  }
}

keyboardService.registerShortcuts(
  ShortcutScope.regdesk,
  ShortcutEvent.keydown,
  ShortcutKey.escape,
  onEscape
);

async function onEnter(event: KeyboardEvent): Promise<void> {
  if (keyboardService.getCurrentScope() === ShortcutScope.dialog_checkin) {
    keyboardService.pushScope(ShortcutScope.confirm_checkin)
    // Ask user for confirmation
    confirm.require({
      group: confirmGroup,
      message:
        "Please confirm checkin of attendee!",
      header: "Confirm",
      icon: "pi pi-question-circle",
      accept: () => {
        emit('onCheckin');
        selectedAttendeeRef.value = null;
        focusGlobalFilterInputAndResetFilter();
      },
    });
    keyboardService.popScope(ShortcutScope.confirm_checkin)
    event.preventDefault();
  };
}

keyboardService.registerShortcuts(
  ShortcutScope.regdesk,
  ShortcutEvent.keydown,
  ShortcutKey.escape,
  onEnter
);


const selectedAttendeePlaceholerAdapterRef: WritableComputedRef<TransformedAttendeeInfo> =
  computeAttendeePlaceholder(selectedAttendeeRef, true);
const emit = defineEmits([
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
