<template>
  <Fieldset>
    <template #legend>
      <span class="font-semibold">Step 1a - Template</span>
    </template>
    <div class="flex flex-row gap-5 flex-wrap items-center">
      <div class="flex flex-col gap-1">
        <label>Mail Template</label>
        <Select
          v-model="selectedCid"
          :options="cidOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select a template..."
          class="w-80"
          :disabled="loading || cidOptions.length === 0"
          filter
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Language</label>
        <Select
          v-model="selectedLang"
          :options="langOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Language..."
          class="w-44"
          :disabled="selectedCid === '' || langOptions.length === 0"
        />
      </div>
    </div>
    <div v-if="selectedTemplate" class="mt-3 flex flex-col gap-1">
      <div class="text-surface-500">
        Variables detected:
        <span v-if="variableNames.length > 0" class="font-mono">
          {{ detectedVariablesText }}
        </span>
        <span v-else>none</span>
      </div>
    </div>
    <div v-else-if="!loading" class="mt-3 text-surface-500">
      No mail templates could be loaded. Is the mail service reachable?
    </div>
  </Fieldset>

  <div
    v-if="selectedTemplate"
    class="mt-3 flex flex-row gap-3 items-start flex-wrap"
  >
    <Fieldset class="flex-1 basis-96 min-w-96">
      <template #legend>
        <span class="font-semibold">Template text</span>
      </template>
      <MailBodyViewer
        :subject="selectedTemplate.subject"
        :html="selectedTemplate.html"
        :text="selectedTemplate.text"
        :render-html="false"
      />
    </Fieldset>

    <Fieldset class="flex-1 basis-96 min-w-96">
      <template #legend>
        <span class="font-semibold">Preview</span>
      </template>
      <div class="text-surface-500 mb-2">
        <template v-if="props.previewAttendeeName">
          Previewing for
          <span class="font-semibold text-surface-700">
            {{ props.previewAttendeeName }}
          </span>.
          Click another row in the attendees table to preview for that attendee.
        </template>
        <template v-else>
          Click a row in the attendees table to preview the mail for that attendee.
        </template>
      </div>
      <div v-if="props.previewLoading" class="text-surface-500">
        (loading preview...)
      </div>
      <template v-else-if="props.previewEntry">
        <MailBodyViewer
          :subject="props.previewEntry.subject"
          :html="props.previewEntry.html"
          :text="props.previewEntry.text"
          :render-html="true"
          empty-message="(empty preview)"
        />
      </template>
      <div v-else class="text-surface-500">
        Select an attendee in the table below to preview.
      </div>
    </Fieldset>
  </div>

  <div v-if="variableNames.length > 0" class="mt-3 flex flex-col gap-2">
    <div class="flex items-center">
      <LabeledToggleSwitch label="Advanced settings" v-model="showAdvanced" />
    </div>
    <Fieldset v-if="showAdvanced">
      <template #legend>
        <span class="font-semibold">Variables</span>
      </template>
      <div class="text-surface-500 mb-2">
        These variables will be filled automatically from each selected
        attendee's data. The example value uses the currently focused attendee.
        You can override a variable for all recipients here.
      </div>
      <DataTable
        :value="variableRows"
        dataKey="name"
        scrollable
        scrollHeight="12rem"
      >
        <Column field="name" header="Variable" style="width: 40%">
          <template #body="{ data }">
            <span class="font-mono">{{ formatVariableName(data.name) }}</span>
          </template>
        </Column>
        <Column header="Example value">
          <template #body="{ data }">
            <span v-if="props.hasPreviewAttendee" class="text-surface-500">
              <template v-if="props.previewLoading">(loading...)</template>
              <template v-else>
                {{ props.previewVariables[data.name] ?? "(empty)" }}
              </template>
            </span>
            <span v-else class="text-surface-500">
              (select or click an attendee first)
            </span>
          </template>
        </Column>
        <Column header="Override (optional)">
          <template #body="{ data }">
            <InputText
              v-model="overrides[data.name]"
              class="w-full"
              placeholder="Leave empty to use attendee value"
            />
          </template>
        </Column>
      </DataTable>
    </Fieldset>
  </div>
</template>

<script setup lang="ts">
import type { CidOption } from "@/composables/mails/useMailTemplates";
import type { MailPreviewEntry, MailTemplate } from "@/types/internal/mails";
import LabeledToggleSwitch from "@/components/common/LabeledToggleSwitch.vue";
import MailBodyViewer from "@/components/mails/MailBodyViewer.vue";
import DataTable from "@/volt/DataTable.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputText from "@/volt/InputText.vue";
import Select from "@/volt/Select.vue";
import Column from "primevue/column";
import {
  computed,
  ref,
  type ComputedRef,
  type ModelRef,
  type Ref,
} from "vue";

interface Props {
  templates: MailTemplate[];
  loading: boolean;
  variableNames: string[];
  hasPreviewAttendee: boolean;
  previewVariables: Record<string, string>;
  previewLoading: boolean;
  previewEntry: MailPreviewEntry | null;
  previewAttendeeName: string;
  selectedTemplate: MailTemplate | null;
  cidOptions: CidOption[];
  langOptions: CidOption[];
}
const props: Props = defineProps<Props>();

const showAdvanced: Ref<boolean> = ref(false);

const selectedCid: ModelRef<string> = defineModel<string>("selectedCid", {
  required: true,
});
const selectedLang: ModelRef<string> = defineModel<string>("selectedLang", {
  required: true,
});
const overrides: ModelRef<Record<string, string>> = defineModel<
  Record<string, string>
>("overrides", { required: true });

function formatVariableName(name: string): string {
  return "{{ " + name + " }}";
}

const detectedVariablesText: ComputedRef<string> = computed(() =>
  props.variableNames.map(formatVariableName).join(", ")
);

const variableRows: ComputedRef<{ name: string }[]> = computed(() =>
  props.variableNames.map((name: string) => ({ name }))
);
</script>