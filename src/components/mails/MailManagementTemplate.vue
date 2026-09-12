<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div class="flex flex-col flex-grow gap-5">
    <ProgressBar v-if="isLoading" indeterminate />

    <template v-if="stageRef === constStage.first">
      <MailTemplateStep
        :templates="templates"
        :loading="isLoading"
        :variable-names="variableNames"
        :has-preview-attendee="hasPreviewAttendee"
        :preview-variables="previewVariables"
        :preview-loading="previewLoading"
        :preview-entry="previewEntry"
        :preview-attendee-name="previewAttendeeName"
        :selected-template="previewTemplate"
        :cid-options="cidOptions"
        :lang-options="langOptions"
        v-model:selected-cid="selectedCid"
        v-model:selected-lang="selectedLang"
        v-model:overrides="variableOverrides"
      />
      <MailAttendeeStep
        :attendees="attendees"
        :loading="attendeesLoading"
        :template-selected="selectedTemplate !== null"
        :sending="sending"
        v-model:selected="selectedAttendees"
        @click-attendee="onAttendeeClick"
        @continue="onContinue"
      />
    </template>

    <MailSendStep
      v-else
      :template="selectedTemplate"
      :entries="entries"
      :sending="sending"
      :stopped="stopped"
      :effective-rate="displayedRate"
      :backoff-notice="backoffNotice"
      :abort-notice="abortNotice"
      :stop-notice="stopNotice"
      :counts="counts"
      :progress-percent="progressPercent"
      :estimated-remaining-ms="estimatedRemainingMs"
      v-model:pacing="pacing"
      @back="onBack"
      @send="send($event)"
      @stop="stop"
    />
  </div>
</template>

<script setup lang="ts">
import MailAttendeeStep from "@/components/mails/MailAttendeeStep.vue";
import MailSendStep from "@/components/mails/MailSendStep.vue";
import MailTemplateStep from "@/components/mails/MailTemplateStep.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { generateId } from "@/composables/generateId";
import { useMailRecipients } from "@/composables/mails/useMailRecipients";
import { useMailSend } from "@/composables/mails/useMailSend";
import { useMailTemplates } from "@/composables/mails/useMailTemplates";
import { OnsiteToastService } from "@/composables/services/toastService";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import ProgressBar from "@/volt/ProgressBar.vue";
import Toast from "@/volt/Toast.vue";
import {
  computed,
  onMounted,
  ref,
  useId,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

const constStage = { first: 1, second: 2 } as const;
type StageValue = (typeof constStage)[keyof typeof constStage];

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);
const errorHandler = getErrorHandlerFunction(toastService);

const mailTemplates = useMailTemplates(errorHandler);
const recipients = useMailRecipients(errorHandler);
const mailSend = useMailSend({
  entries: recipients.entries,
  template: mailTemplates.selectedTemplate,
  variableOverrides: mailTemplates.variableOverrides,
  errorHandler,
});

const {
  templates,
  loading: templatesLoading,
  selectedCid,
  selectedLang,
  selectedTemplate,
  previewTemplate,
  cidOptions,
  langOptions,
  variableNames,
  variableOverrides,
  previewEntry,
  previewVariables,
  previewLoading,
  refreshPreview,
} = mailTemplates;
const {
  attendees,
  loading: attendeesLoading,
  selected: selectedAttendees,
  entries,
  sampleAttendee,
  eligibleCount,
} = recipients;
const {
  pacing,
  sending,
  stopped,
  displayedRate,
  backoffNotice,
  abortNotice,
  stopNotice,
  counts,
  progressPercent,
  estimatedRemainingMs,
  send,
  stop,
} = mailSend;

const stageRef: Ref<StageValue> = ref(constStage.first);

const clickedAttendee: Ref<TransformedAttendeeInfo | null> = ref(null);
const previewAttendee: ComputedRef<TransformedAttendeeInfo | null> = computed(
  () => clickedAttendee.value ?? sampleAttendee.value
);

const isLoading = computed(
  () => templatesLoading.value || attendeesLoading.value
);

const hasPreviewAttendee = computed(() => previewAttendee.value !== null);

const previewAttendeeName: ComputedRef<string> = computed(() => {
  const attendee: TransformedAttendeeInfo | null = previewAttendee.value;
  if (attendee === null) {
    return "";
  }
  return (
    attendee.transFullName ??
    attendee.nickname ??
    [attendee.first_name, attendee.last_name]
      .filter((part: string | null | undefined): part is string => !!part)
      .join(" ") ??
    (attendee.badge_id ? `Badge ${attendee.badge_id}` : "")
  );
});

const preferredLang = computed(() => {
  const lang: string | null =
    selectedAttendees.value.find(
      (attendee) => attendee.registration_language
    )?.registration_language ?? null;
  return lang;
});

watch(
  [templates, selectedAttendees, attendeesLoading],
  () =>
    mailTemplates.initializeSelection(
      preferredLang.value,
      !attendeesLoading.value
    )
);

watch(
  [previewTemplate, previewAttendee, variableOverrides],
  () => {
    void refreshPreview(previewAttendee.value?.id ?? null);
  },
  { immediate: true }
);

function onAttendeeClick(attendee: TransformedAttendeeInfo): void {
  clickedAttendee.value = attendee;
}

function onContinue(): void {
  if (selectedTemplate.value === null || eligibleCount.value === 0) {
    return;
  }
  stageRef.value = constStage.second;
}

function onBack(): void {
  if (sending.value) {
    return;
  }
  stageRef.value = constStage.first;
}

onMounted(() => {
  void mailTemplates.load();
  void recipients.load();
});
</script>