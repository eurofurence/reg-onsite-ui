<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
    header="Select Badge Type"
    class="w-fit"
  >
    <div class="flex flex-col gap-4 items-center">
      <Select
        v-model="selectedBadgeTypeId"
        :options="badgeTypes"
        optionLabel="name"
        optionValue="id"
        placeholder="Select a badge type"
        class="w-64"
      />
      <div v-if="previewHtml" v-html="previewHtml"></div>
      <p v-if="printErrorMessage" class="text-sm text-red-600">{{ printErrorMessage }}</p>
      <div class="flex gap-2">
        <Button
          label="Print"
          :disabled="selectedBadgeTypeId === null"
          @click="onPrintClick"
        />
        <Button
          label="Download SVG"
          severity="secondary"
          :disabled="selectedBadgeTypeId === null"
          @click="onDownloadSvgClick"
        />
        <Button
          label="Download PDF"
          severity="secondary"
          :disabled="selectedBadgeTypeId === null"
          @click="onDownloadPdfClick"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { resolveBadgeType } from "@/composables/badge/badgeTypeInheritance";
import { buildFieldValuesForAttendee } from "@/composables/badge/buildFieldValues";
import { renderBadgeSvg } from "@/composables/print/badgeHtml";
import { downloadBadgePdf, downloadBadgeSvg } from "@/composables/print/downloadBadge";
import { printSingleBadge } from "@/composables/print/printSingleBadge";
import { badgeTypesRef, printSettingsRef } from "@/composables/services/badgeConfigStore";
import type { BadgeType } from "@/types/badgeType";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Button from "@/volt/Button.vue";
import Dialog from "@/volt/Dialog.vue";
import Select from "@/volt/Select.vue";
import {
  computed,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

interface Props {
  attendee: TransformedAttendeeInfo;
}
const props = defineProps<Props>();
const visible: Ref<boolean> = defineModel<boolean>("visible", {
  required: true,
});

const badgeTypes = badgeTypesRef;
const selectedBadgeTypeId: Ref<string | null> = ref(null);
const previewHtml: Ref<string> = ref("");
const printErrorMessage: Ref<string | null> = ref(null);

const selectedBadgeType: ComputedRef<BadgeType | undefined> = computed(() =>
  badgeTypes.value.find((badgeType) => badgeType.id === selectedBadgeTypeId.value)
);

watch(
  [selectedBadgeType, () => props.attendee],
  async () => {
    if (!selectedBadgeType.value) {
      previewHtml.value = "";
      return;
    }
    const printSettings = printSettingsRef.value;
    const resolvedBadgeType = resolveBadgeType(badgeTypes.value, selectedBadgeType.value.id);
    const fieldValues = buildFieldValuesForAttendee(resolvedBadgeType, props.attendee);
    previewHtml.value = await renderBadgeSvg(
      resolvedBadgeType,
      fieldValues,
      printSettings.cardWidthMm,
      printSettings.cardHeightMm
    );
  },
  { immediate: true }
);

async function onPrintClick(): Promise<void> {
  if (!selectedBadgeType.value) {
    return;
  }
  printErrorMessage.value = null;
  const resolvedBadgeType = resolveBadgeType(badgeTypes.value, selectedBadgeType.value.id);
  const fieldValues = buildFieldValuesForAttendee(resolvedBadgeType, props.attendee);
  try {
    await printSingleBadge(selectedBadgeType.value, fieldValues);
  } catch {
    printErrorMessage.value = "Failed to print badge. Please try again.";
    return;
  }
  visible.value = false;
}

function downloadFilenameBase(badgeType: BadgeType): string {
  return `${badgeType.name}-${props.attendee.id}`;
}

async function onDownloadSvgClick(): Promise<void> {
  if (!selectedBadgeType.value) {
    return;
  }
  printErrorMessage.value = null;
  const resolvedBadgeType = resolveBadgeType(badgeTypes.value, selectedBadgeType.value.id);
  const fieldValues = buildFieldValuesForAttendee(resolvedBadgeType, props.attendee);
  try {
    await downloadBadgeSvg(resolvedBadgeType, fieldValues, downloadFilenameBase(selectedBadgeType.value));
  } catch {
    printErrorMessage.value = "Failed to download badge SVG. Please try again.";
  }
}

async function onDownloadPdfClick(): Promise<void> {
  if (!selectedBadgeType.value) {
    return;
  }
  printErrorMessage.value = null;
  const resolvedBadgeType = resolveBadgeType(badgeTypes.value, selectedBadgeType.value.id);
  const fieldValues = buildFieldValuesForAttendee(resolvedBadgeType, props.attendee);
  try {
    await downloadBadgePdf(resolvedBadgeType, fieldValues, downloadFilenameBase(selectedBadgeType.value));
  } catch {
    printErrorMessage.value = "Failed to download badge PDF. Please try again.";
  }
}
</script>
