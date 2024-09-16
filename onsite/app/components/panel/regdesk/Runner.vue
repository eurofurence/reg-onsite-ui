<template>
  <div v-if="displayOptionsRef.displayRunner.enabled">
    <Toast
      :group="toastGroup"
      :position="displayOptionsRef.displayRunner.location"
      unstyled
    >
      <template #container="{ message, closeCallback }">
        <div
          class="flex justify-center shadow-xl"
          :style="getStyle(JSON.parse(message?.detail))"
        >
          {{ message?.summary }}
        </div>
        <div>
          <Button @click="closeCallback" label="X" />
        </div>
      </template>
    </Toast>
  </div>
</template>

<script setup lang="ts">
import type { ToastServiceMethods } from "primevue/toastservice";
import { useToast } from "primevue/usetoast";
import type { ModelRef } from "vue";
import { getLanyardColor } from "@/composables/colors/getLanyardColor";
import { resolveColor } from "@/composables/colors/resolveColor";
import type { ColorsPaletteValue } from "@/config/theme";
import type { TransformedAttendeeInfo } from "@/types/internal";
import { Severity, type AttendeeTableDisplayOptions } from "@/types/internal";

function getStyle(attendee: TransformedAttendeeInfo): any {
  const color: ColorsPaletteValue = getLanyardColor(attendee);
  const paddingSize: number = Math.floor(
    displayOptionsRef.value.displayRunner.size / 3
  );
  return {
    ["font-size"]: `${displayOptionsRef.value.displayRunner.size}rem`,
    ["padding-left"]: `${paddingSize}rem`,
    ["padding-right"]: `${paddingSize}rem`,
    background: resolveColor(color),
    color: "white",
  };
}

const toast: ToastServiceMethods = useToast();

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });

const selectedAttendeeRef: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>({
    required: true,
  });

const componentId: string = generateId(useId());
const toastGroup: string = `runnerToast${componentId}`;

async function onSelectionChange() {
  if (
    selectedAttendeeRef.value !== null &&
    selectedAttendeeRef.value.transCanCheckin
  ) {
    toast.add({
      group: toastGroup,
      severity: Severity.success,
      summary: `#${selectedAttendeeRef.value.id}`,
      detail: JSON.stringify(selectedAttendeeRef.value),
      life: displayOptionsRef.value.displayRunner.duration,
    });
  }
}

watch(() => selectedAttendeeRef.value?.badge_id, onSelectionChange);
</script>
