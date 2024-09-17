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
      <CustomStatisticsAttendee
        v-model="attendeeInfosRef"
        :filters="props.filters"
      />
    </div>
  </Dialog>
  <Button
    icon="pi pi-chart-line"
    v-tooltip.bottom="'Show statistics'"
    :disabled="attendeeInfosRef.length < 2"
    @click="visible = true"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type {
  RawAttendeeFilter,
  TransformedAttendeeInfo,
} from "@/types/internal";
import { watchDialogVisibility, ShortcutScope } from "@/composables/services/keyboardService";

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
