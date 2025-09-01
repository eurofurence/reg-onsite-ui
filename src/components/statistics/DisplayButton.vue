<template>
  <Dialog
    v-model:visible="visible"
    modal
    :dismissableMask="true"
    :closeOnEscape="true"
    :maximizable="true"
    header="Statistics"
    :style="{ width: '80vw' }"
  >
    <div>
      <AttendeeStatistics v-model="attendeeInfosRef" :filters="props.filters" />
    </div>
  </Dialog>
  <Button
    class="h-12 aspect-square"
    v-tooltip.bottom="'Show statistics'"
    :disabled="attendeeInfosRef.length < 2"
    @click="visible = true"
    v-bind="$attrs"
  >
    <i class="pi pi-chart-line" />
  </Button>
</template>

<script setup lang="ts">
import AttendeeStatistics from "@/components/statistics/AttendeeStatistics.vue";
import {
  ShortcutScope,
  watchDialogVisibility,
} from "@/composables/services/keyboardService";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { RawAttendeeFilter } from "@/types/internal/filter";
import Button from "@/volt/Button.vue";
import Dialog from "@/volt/Dialog.vue";
import { type ModelRef, ref, type Ref } from "vue";

const visible: Ref<boolean> = ref<boolean>(false);
watchDialogVisibility(visible, ShortcutScope.dialog_statistics);

interface Props {
  filters: RawAttendeeFilter;
}
const props: Props = defineProps<Props>();

const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });
</script>
