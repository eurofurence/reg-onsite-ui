<template>
  <div v-if="displayOptionsRef.displayRunner.enabled">
    <Toast
      :group="toastService.toastGroup"
      pt:root:class="relative z-[100]"
      :position="displayOptionsRef.displayRunner.location"
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
import { getLanyardColor } from "@/composables/colors/getLanyardColor";
import { resolveColor } from "@/composables/colors/resolveColor";
import { generateId } from "@/composables/generateId";
import { OnsiteToastService } from "@/composables/services/toastService";
import type { ColorsPaletteValue } from "@/composables/theme/colors";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import type { AttendeeTableDisplayOptions } from "@/types/internal/system/regdesk";
import type { FontSize } from "@/types/internal/system/theme";
import Button from "@/volt/Button.vue";
import Toast from "@/volt/Toast.vue";
import type { ModelRef } from "vue";
import { useId, watch } from "vue";

function getStyle(attendee: TransformedAttendeeInfo): any {
  const color: ColorsPaletteValue = getLanyardColor(attendee);
  const paddingSize: FontSize = Math.floor(
    displayOptionsRef.value.displayRunner.size / 3
  ) as FontSize;
  return {
    ["font-size"]: `${displayOptionsRef.value.displayRunner.size}rem`,
    ["padding-left"]: `${paddingSize}rem`,
    ["padding-right"]: `${paddingSize}rem`,
    ["background"]: resolveColor(color),
    ["color"]: "white",
  };
}

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });

const selectedAttendeeRef: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>({
    required: true,
  });

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

async function onSelectionChange() {
  if (
    selectedAttendeeRef.value !== null &&
    selectedAttendeeRef.value.transCanCheckin
  ) {
    toastService.add({
      severity: ToastSeverity.success,
      summary: `#${selectedAttendeeRef.value.id}`,
      detail: JSON.stringify(selectedAttendeeRef.value),
      life: displayOptionsRef.value.displayRunner.duration,
    });
  }
}

watch(() => selectedAttendeeRef.value?.badge_id, onSelectionChange);
</script>
