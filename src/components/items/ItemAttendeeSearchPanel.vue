<template>
  <Fieldset :legend="props.legend" class="p-2">
    <div class="flex flex-col gap-3">
      <div class="flex gap-2">
        <InputNumber
          v-model="regNum"
          placeholder="Reg number"
          :useGrouping="false"
          class="w-40"
          @keydown.enter="$emit('search')"
        />
        <Button
          @click="$emit('search')"
          :loading="props.loading"
          icon="pi pi-search"
          label="Search"
        />
        <slot name="actions" />
      </div>
      <div v-if="props.attendee">
        <SponsorDeskUserInfo v-model="attendeeModel" disabled />
      </div>
      <div v-else-if="props.searchDone" class="text-sm text-surface-400">
        No attendee found.
      </div>
      <slot />
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import SponsorDeskUserInfo from "@/components/sponsordesk/SponsorDeskUserInfo.vue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputNumber from "@/volt/InputNumber.vue";
import { computed } from "vue";

interface Props {
  legend: string;
  loading: boolean;
  attendee: TransformedAttendeeInfo | null;
  searchDone: boolean;
}
const props = defineProps<Props>();

const regNum = defineModel<number | null>("regNum", { required: true });

defineEmits<{ search: [] }>();

const attendeeModel = computed<TransformedAttendeeInfo>({
  get: () => props.attendee!,
  set: () => {},
});
</script>
