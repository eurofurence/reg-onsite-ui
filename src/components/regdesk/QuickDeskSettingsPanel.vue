<template>
  <div class="flex flex-col">
    <SelectButton
      v-model="settingsRef.searchMode"
      :options="searchModeOptions"
      optionLabel="label"
      optionValue="value"
      :allowEmpty="false"
    />
    <GroupPanel
      icon="pi-search"
      label="User Selection"
      v-if="settingsRef.searchMode === QuickDeskSearchMode.general"
    >
      <div class="flex flex-col gap-1">
        <GlobalSearchField
          v-model="dataOptionsRef"
          :globaSearchInputId="globalSearchInputId"
          autofocus
        />
        <SearchElementPreload
          v-model="dataOptionsRef"
          @doLoad="$emit('doLoad')"
        />
        <div class="text-center">{{ props.filteredCount }} match(es)</div>
      </div>
    </GroupPanel>
  </div>
</template>

<script setup lang="ts">
import GroupPanel from "@/components/common/GroupPanel.vue";
import GlobalSearchField from "@/components/regdesk/GlobalSearchField.vue";
import SearchElementPreload from "@/components/regdesk/search_element/SearchElementPreload.vue";
import { generateId } from "@/composables/generateId";
import type { LabeledValue } from "@/types/internal/infos";
import {
  QuickDeskSearchMode,
  type AttendeeDataOptions,
  type QuickDeskSearchModeValue,
  type QuickDeskSettings,
} from "@/types/internal/system/regdesk";
import SelectButton from "@/volt/SelectButton.vue";
import { useId, type ModelRef } from "vue";

interface Props {
  filteredCount: number;
}
const props: Props = defineProps<Props>();

defineEmits(["doLoad"]);

const settingsRef: ModelRef<QuickDeskSettings> =
  defineModel<QuickDeskSettings>("settings", { required: true });

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>("dataOptions", { required: true });

const componentId: string = generateId(useId());
const globalSearchInputId: string = `quickDeskGlobalSearchInputId${componentId}`;

const searchModeOptions: LabeledValue<QuickDeskSearchModeValue>[] = [
  { label: "Reg ID/Barcode", value: QuickDeskSearchMode.regId },
  { label: "General Search", value: QuickDeskSearchMode.general },
];
</script>
