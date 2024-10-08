<template>
  <LayoutRegStatusPanel
    header="Check-In Information"
    v-model="attendeeInfoRef.status"
  >
    <template #icons>
      <div class="flex flex-row">
        <ProgressBar v-if="cooldownActive" indeterminate />
        <ButtonGroup>
          <Button
            v-tooltip.left="'Checkin attendee'"
            label="Checkin"
            @click="triggerCheckin()"
            :disabled="checkinDisabled()"
            raised
            autofocus
          />
          <DevOnly>
            <Button
              v-tooltip="'Undo Checkin'"
              icon="pi pi-exclamation-circle"
              @click="$emit('onUndoCheckin', modelValue.id)"
              raised
            />
          </DevOnly>
          <Button
            v-tooltip.left="'Refresh data'"
            icon="pi pi-refresh"
            @click="$emit('onSearchRegNumber', attendeeInfoRef.id)"
            :disabled="props.searchStatus.mode === SearchStatusMode.searching"
            raised
          />
        </ButtonGroup>
      </div>
    </template>
    <div class="flex flex-row flex-wrap gap-3">
      <FieldStatus v-model="attendeeInfoRef.status" v-bind="$attrs" />
      <FieldFirstName v-model="attendeeInfoRef.first_name" v-bind="$attrs" />
      <FieldLastName v-model="attendeeInfoRef.last_name" v-bind="$attrs" />
      <FieldBirthdayLocale v-model="attendeeInfoRef" v-bind="$attrs" />
      <FieldNationality v-model="attendeeInfoRef.country" v-bind="$attrs" />
      <FieldDues v-model="attendeeInfoRef.current_dues" v-bind="$attrs" />
    </div>
  </LayoutRegStatusPanel>
</template>

<script setup lang="ts">
import { canCheckin } from "@/composables/fields/status/canCheckin";
import type { ModelRef } from "vue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  SearchStatusMode,
  type SearchStatus,
} from "@/types/internal/component/regnumsearch";

interface Props {
  searchStatus: SearchStatus;
}
const props: Props = defineProps<Props>();
const cooldownActive: Ref<boolean> = ref<boolean>(false);

function checkinDisabled() {
  return !canCheckin(attendeeInfoRef.value) || cooldownActive.value;
}

function triggerCheckin() {
  emit("onCheckin", attendeeInfoRef.value.id);
  cooldownActive.value = true;
  setTimeout(() => {
    cooldownActive.value = false;
  }, 2000);
}

const attendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });

const emit = defineEmits(["onCheckin", "onUndoCheckin", "onSearchRegNumber"]);
</script>
