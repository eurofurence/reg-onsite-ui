<template>
  <RegStatusPanel
    header="Check-In Information"
    v-model="attendeeInfoRef.status"
  >
    <template #icons>
      <div class="flex flex-row items-center pointer-events-auto select-text">
        <ProgressBar
          v-if="checkinInFlightRegNumber === attendeeInfoRef.id"
          indeterminate
        />
        <RegDeskCheckInTime
          class="p-5"
          v-model="attendeeInfoRef.id"
          v-if="
            attendeeInfoRef.id !== null &&
            attendeeInfoRef.status === AttendeeApiStatus.checked_in
          "
        />
        <div class="flex flex-col flex-grow">
          <ButtonGroup>
            <Button
              v-tooltip.left="'Checkin attendee'"
              @click="triggerCheckin()"
              :disabled="checkinDisabled()"
              class="h-full"
              raised
            >
              <b class="h-6">Checkin</b>
            </Button>
            <Button
              class="aspect-square h-full"
              v-tooltip="'Undo Checkin'"
              @click="$emit('onUndoCheckin', modelValue.id)"
              :disabled="refreshDisabled()"
              raised
              v-if="environmentSettings.envName === EnvName.dev"
            >
              <b class="h-6"><i class="pi pi-exclamation-circle" /> </b>
            </Button>
            <Button
              class="aspect-square h-full"
              v-tooltip="'Print badge'"
              @click="$emit('onPrint', modelValue.id)"
              :disabled="printDisabled()"
              raised
              v-if="props.enableCashierMode"
            >
              <b class="h-6"><i class="pi pi-print" /> </b>
            </Button>
            <Button
              class="aspect-square h-full"
              v-tooltip="'Book cash payment'"
              @click="$emit('onPayment', modelValue.id)"
              :disabled="paymentDisabled()"
              raised
              v-if="props.enableCashierMode"
            >
              <b class="h-6"><i class="pi pi-money-bill" /> </b>
            </Button>
            <Button
              class="aspect-square h-full"
              v-tooltip="'Approve attendee'"
              @click="$emit('onApprove', modelValue.id)"
              :disabled="approveDisabled()"
              raised
              v-if="props.enableCashierMode"
            >
              <b class="h-6"><i class="pi pi-check-circle" /> </b>
            </Button>
            <Button
              class="aspect-square h-full"
              v-tooltip.left="'Refresh data'"
              @click="$emit('onSearchRegNumber', attendeeInfoRef.id)"
              :disabled="refreshDisabled()"
              raised
              autofocus
            >
              <b class="h-6"><i class="pi pi-refresh" /></b>
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </template>
    <div class="flex flex-row flex-wrap gap-3 mt-3">
      <Status v-model="attendeeInfoRef.status" v-bind="$attrs" />
      <FirstName v-model="attendeeInfoRef.first_name" v-bind="$attrs" />
      <LastName v-model="attendeeInfoRef.last_name" v-bind="$attrs" />
      <BirthdayLocale v-model="attendeeInfoRef" v-bind="$attrs" />
      <Nationality v-model="attendeeInfoRef.country" v-bind="$attrs" />
      <Dues v-model="attendeeInfoRef.current_dues" v-bind="$attrs" />
    </div>
  </RegStatusPanel>
</template>

<script setup lang="ts">
import BirthdayLocale from "@/components/common/field/BirthdayLocale.vue";
import Dues from "@/components/common/field/Dues.vue";
import FirstName from "@/components/common/field/FirstName.vue";
import LastName from "@/components/common/field/LastName.vue";
import Nationality from "@/components/common/field/Nationality.vue";
import Status from "@/components/common/field/Status.vue";
import RegStatusPanel from "@/components/common/RegStatusPanel.vue";
import RegDeskCheckInTime from "@/components/regdesk/RegDeskCheckInTime.vue";
import { canCheckin } from "@/composables/fields/status/canCheckin";
import { environmentSettings } from "@/composables/services/environmentService";
import {
  keyboardService,
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  type KeyboardServiceEvent,
} from "@/composables/services/keyboardService";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  SearchStatusMode,
  type SearchStatus,
} from "@/types/internal/component/regnumsearch";
import { EnvName } from "@/types/internal/env";
import Button from "@/volt/Button.vue";
import ButtonGroup from "@/volt/ButtonGroup.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import type { ModelRef } from "vue";
import { ref, watch, type Ref } from "vue";

interface Props {
  searchStatus: SearchStatus;
  enableCashierMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  enableCashierMode: false,
});

const attendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });

// Tracks the reg number of a checkin currently in flight. Cleared once the
// attendee's status actually changes away from "paid" (checkin succeeded or
// the attendee was otherwise updated), or after a safety timeout in case the
// backend call fails silently without updating the status.
const checkinInFlightRegNumber: Ref<TransformedAttendeeInfo["id"]> = ref(null);
const checkinSafetyTimeoutMs = 15000;

function paymentDisabled(): boolean {
  return attendeeInfoRef.value.current_dues === null || attendeeInfoRef.value.current_dues <= 0;
}

function approveDisabled(): boolean {
  return attendeeInfoRef.value.status !== AttendeeApiStatus.new;
}

function printDisabled(): boolean {
  return (
    attendeeInfoRef.value.id === null ||
    (attendeeInfoRef.value.status !== AttendeeApiStatus.paid &&
      attendeeInfoRef.value.status !== AttendeeApiStatus.checked_in)
  );
}

function checkinDisabled(): boolean {
  return (
    !canCheckin(attendeeInfoRef.value) ||
    checkinInFlightRegNumber.value === attendeeInfoRef.value.id
  );
}

function refreshDisabled(): boolean {
  return (
    attendeeInfoRef.value.id === null ||
    props.searchStatus.mode === SearchStatusMode.searching
  );
}

watch(
  () => attendeeInfoRef.value.status,
  () => {
    checkinInFlightRegNumber.value = null;
  }
);

function triggerCheckin(): void {
  const regNumber = attendeeInfoRef.value.id;
  checkinInFlightRegNumber.value = regNumber;
  setTimeout(() => {
    if (checkinInFlightRegNumber.value === regNumber) {
      checkinInFlightRegNumber.value = null;
    }
  }, checkinSafetyTimeoutMs);
  emit("onCheckin", regNumber);
}

async function onKeyC(event: KeyboardServiceEvent): Promise<boolean> {
  if (event.currentScope !== ShortcutScope.regdesk) {
    return false;
  }
  if (checkinDisabled()) {
    return false;
  }
  triggerCheckin();
  return true;
}

keyboardService.registerShortcuts(
  ShortcutScope.regdesk,
  ShortcutEvent.keydown,
  ShortcutKey.key_c,
  onKeyC
);

const emit = defineEmits([
  "onCheckin",
  "onUndoCheckin",
  "onSearchRegNumber",
  "onPayment",
  "onApprove",
  "onPrint",
]);
</script>
