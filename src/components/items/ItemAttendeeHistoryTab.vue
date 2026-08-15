<template>
  <div class="flex flex-col gap-4 pt-4">
    <ItemAttendeeSearchPanel
      legend="Attendee"
      v-model:regNum="regNum"
      :loading="loading"
      :attendee="attendee"
      :searchDone="searchDone"
      @search="search"
    >
      <template #actions>
        <a v-if="attendee?.id !== null && attendee?.id !== undefined" :href="conStoreLink(attendee.id)">
          <Button icon="pi pi-shopping-cart" label="Con Store" severity="secondary" as="span" />
        </a>
      </template>
    </ItemAttendeeSearchPanel>

    <div v-if="searchDone && attendee" class="flex flex-col gap-2">
      <div class="text-sm text-surface-400 text-center">
        {{ steps.length }} history entr{{ steps.length === 1 ? "y" : "ies" }}
      </div>

      <div v-if="steps.length === 0" class="text-center text-surface-400 py-10 text-sm">
        No history recorded for this attendee.
      </div>

      <div v-else class="flex flex-col gap-3">
        <Fieldset v-for="(step, index) in reversedSteps" :key="index" class="p-2">
          <template #legend>
            <span class="text-sm">{{ formatTimestamp(step.when) }} - {{ step.by || "unknown" }}</span>
          </template>
          <div class="flex flex-col gap-1.5 text-sm">
            <div v-if="!hasChanges(step)" class="text-surface-400">No item changes recorded.</div>
            <template v-for="field in FIELDS" :key="field.key">
              <div v-if="step.added[field.key].length > 0" class="flex gap-1.5 flex-wrap items-baseline">
                <span class="text-green-600 font-medium">+ {{ field.label }}:</span>
                <span v-for="item in step.added[field.key]" :key="item" class="text-xs">
                  {{ getGoodieLabel(item) }} <span class="text-muted-color">({{ item }})</span>
                </span>
              </div>
              <div v-if="step.removed[field.key].length > 0" class="flex gap-1.5 flex-wrap items-baseline">
                <span class="text-red-600 font-medium">&minus; {{ field.label }}:</span>
                <span v-for="item in step.removed[field.key]" :key="item" class="text-xs">
                  {{ getGoodieLabel(item) }} <span class="text-muted-color">({{ item }})</span>
                </span>
              </div>
            </template>
            <div v-if="step.commentChanged" class="flex gap-1.5">
              <span class="font-medium text-surface-500">Comment:</span>
              <span class="whitespace-pre-wrap">{{ step.comment || "(cleared)" }}</span>
            </div>
          </div>
        </Fieldset>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemAttendeeSearchPanel from "@/components/items/ItemAttendeeSearchPanel.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getGoodieLabel } from "@/composables/items/getGoodieLabel";
import { buildAttendeeHistorySteps, formatTimestamp, type AttendeeHistoryStep } from "@/composables/items/itemHistoryRestore";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import { computed, ref, type Ref } from "vue";

interface Props { toastService: OnsiteToastService; }
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const FIELDS: { key: "pastItems" | "reservedItems" | "issuedItems"; label: string }[] = [
  { key: "issuedItems", label: "Issued" },
  { key: "reservedItems", label: "Reserved" },
  { key: "pastItems", label: "Past" },
];

const regNum: Ref<number | null> = ref(null);
const loading: Ref<boolean> = ref(false);
const searchDone: Ref<boolean> = ref(false);
const attendee: Ref<TransformedAttendeeInfo | null> = ref(null);
const steps: Ref<AttendeeHistoryStep[]> = ref([]);

async function search(): Promise<void> {
  if (regNum.value === null) return;
  loading.value = true;
  searchDone.value = false;
  attendee.value = null;
  steps.value = [];
  const targetRegNum = regNum.value as RegNumber;
  const [attendeeResult, addInfo] = await Promise.all([
    attendeeService.getAttendeeByRegNumber(errorHandler, targetRegNum),
    attendeeService.addInfos.getSponsorDeskAddInfo(errorHandler, targetRegNum),
  ]);
  attendee.value = attendeeResult || null;
  steps.value = buildAttendeeHistorySteps(addInfo ?? getEmptySponsorDeskAddInfo());
  searchDone.value = true;
  loading.value = false;
}

const reversedSteps = computed(() => [...steps.value].reverse());

function conStoreLink(regNumber: RegNumber): string {
  return `${import.meta.env.BASE_URL}/constore#${regNumber}`;
}

function hasChanges(step: AttendeeHistoryStep): boolean {
  return FIELDS.some((field) => step.added[field.key].length > 0 || step.removed[field.key].length > 0);
}
</script>
