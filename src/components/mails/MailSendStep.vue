<template>
  <Fieldset>
    <template #legend>
      <span class="font-semibold">Step 2 - Sending</span>
    </template>
    <div class="flex flex-row gap-5 flex-wrap items-center mb-3">
      <div class="flex flex-col gap-1">
        <label>Template</label>
        <span>
          {{ props.template?.cid ?? "-" }}
          <span v-if="props.template" class="text-surface-500">
            (language is chosen per attendee)
          </span>
        </span>
      </div>
      <div class="flex flex-col gap-1">
        <label>Subject</label>
        <span>
          {{ props.template?.subject ?? "-" }}
        </span>
      </div>
    </div>

    <Fieldset>
      <template #legend>
        <span class="font-semibold">Send pacing</span>
      </template>
      <div class="flex flex-row gap-5 flex-wrap items-center">
        <div class="flex flex-col gap-1">
          <label>Email rate (per minute)</label>
          <InputNumber
            v-model="pacing.ratePerMinute"
            :min="1"
            :max="600"
            :step="1"
            class="w-32"
            :disabled="props.sending"
          />
          <span class="text-surface-500">
            ≈ one email every {{ formatInterval(pacing.ratePerMinute) }}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label>Batch size (emails per request)</label>
          <InputNumber
            v-model="pacing.batchSize"
            :min="1"
            :max="500"
            :step="1"
            class="w-32"
            :disabled="props.sending"
          />
          <span class="text-surface-500">
            Recipients per request; the backend sends each one individually.
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label>Backoff after error (seconds)</label>
          <InputNumber
            v-model="pacing.backoffSeconds"
            :min="0"
            :max="3600"
            :step="5"
            class="w-32"
            :disabled="props.sending"
          />
          <span class="text-surface-500">
            Pause after a failed send before continuing.
          </span>
        </div>
        <div class="flex flex-col gap-1 min-w-44">
          <label>
            Rate reduction after error:
            {{ Math.round(pacing.rateFactor * 100) }}%
          </label>
          <Slider
            v-model="pacing.rateFactor"
            :min="0.1"
            :max="1"
            :step="0.05"
            :disabled="props.sending"
          />
          <span class="text-surface-500">
            Kept fraction of the rate once errors occur.
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label>Minimum rate (per minute)</label>
          <InputNumber
            v-model="pacing.minRatePerMinute"
            :min="1"
            :max="600"
            :step="1"
            class="w-32"
            :disabled="props.sending"
          />
          <span class="text-surface-500">
            The rate never falls below this.
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label>Abort after consecutive errors</label>
          <InputNumber
            v-model="pacing.maxConsecutiveErrors"
            :min="1"
            :max="1000"
            :step="1"
            class="w-32"
            :disabled="props.sending"
          />
          <span class="text-surface-500">
            Stops sending after this many failures in a row.
          </span>
        </div>
      </div>
    </Fieldset>

    <div class="flex flex-row gap-5 flex-wrap items-center mb-3">
      <Tag value="Effective rate" severity="secondary">
        {{ props.effectiveRate }} mails/min
      </Tag>
      <span v-if="props.counts.pending > 0" class="text-surface-500">
        ≈ {{ formatDuration(props.estimatedRemainingMs) }} remaining at current rate
      </span>
    </div>
    <Message
      v-if="props.backoffNotice"
      severity="warn"
      :closable="false"
      class="mb-3"
    >
      {{ props.backoffNotice }}
    </Message>
    <Message
      v-if="props.abortNotice"
      severity="danger"
      :closable="false"
      class="mb-3"
    >
      {{ props.abortNotice }}
    </Message>
    <Message
      v-if="props.stopNotice"
      severity="warn"
      :closable="false"
      class="mb-3"
    >
      {{ props.stopNotice }}
    </Message>
    <ProgressBar
      :value="props.progressPercent"
      :indeterminate="props.sending"
      class="mb-3"
    />
    <Message
      v-if="props.counts.sent > 0 && props.counts.pending === 0 && props.counts.failed === 0"
      severity="success"
      :closable="false"
      class="mb-3"
    >
      All {{ props.counts.sent }} email(s) sent successfully.
    </Message>
    <Message
      v-else-if="props.counts.failed > 0 && props.counts.pending === 0 && props.counts.sending === 0"
      severity="warn"
      :closable="false"
      class="mb-3"
    >
      {{ props.counts.failed }} email(s) failed. Use "Retry Failed" to resend them.
    </Message>
    <div
      class="flex flex-row gap-5 flex-wrap items-center justify-between mb-3"
    >
      <div class="flex flex-row gap-4">
        <Tag value="Total" severity="secondary">
          {{ props.entries.length }}
        </Tag>
        <Tag value="Sent" severity="success">
          {{ props.counts.sent }}
        </Tag>
        <Tag value="Failed" severity="danger">
          {{ props.counts.failed }}
        </Tag>
        <Tag v-if="props.counts.pending > 0" value="Pending" severity="secondary">
          {{ props.counts.pending }}
        </Tag>
        <Tag v-if="props.sending" value="Sending" severity="warn">
          <i class="pi pi-spin pi-spinner mr-1" />{{ props.counts.sending }}
        </Tag>
      </div>
      <div class="flex flex-row gap-3">
        <SecondaryButton :disabled="props.sending" @click="emit('back')">
          <i class="pi pi-arrow-left mr-2" />Back
        </SecondaryButton>
        <DangerButton
          v-if="props.counts.failed > 0"
          :disabled="props.sending"
          @click="emit('send', true)"
        >
          <i class="pi pi-refresh mr-2" />Retry Failed ({{ props.counts.failed }})
        </DangerButton>
        <Button
          v-if="props.counts.pending > 0"
          :disabled="props.sending"
          @click="emit('send', false)"
        >
          <i class="pi pi-send mr-2" />
          {{ sendButtonLabel }}
        </Button>
        <Button v-else-if="props.sending" :disabled="true">
          <i class="pi pi-spin pi-spinner mr-2" />Sending...
        </Button>
        <Button v-else severity="secondary" @click="emit('back')">
          <i class="pi pi-check mr-2" />Finished
        </Button>
        <DangerButton v-if="props.sending" @click="emit('stop')">
          <i class="pi pi-stop mr-2" />Stop
        </DangerButton>
      </div>
    </div>
    <DataTable
      :value="props.entries"
      dataKey="email"
      :scrollable="true"
      scrollHeight="24rem"
      :virtualScrollerOptions="{ itemSize: 46 }"
      rowHover
    >
      <template #empty>
        No recipients selected. Go back and select attendees.
      </template>
      <Column field="badgeId" header="Badge" sortable />
      <Column field="nickname" header="Nickname" sortable />
      <Column field="firstName" header="First Name" sortable />
      <Column field="lastName" header="Last Name" sortable />
      <Column field="email" header="Email" sortable />
      <Column header="State">
        <template #body="{ data }">
          <Tag
            :value="data.state.toUpperCase()"
            :severity="stateTagSeverity(data.state)"
          />
        </template>
      </Column>
      <Column header="Detail">
        <template #body="{ data }">
          <span class="text-surface-500 break-all">
            {{
              data.detail ??
              (data.state === MailSendStateValue.pending
                ? "Waiting..."
                : "")
            }}
          </span>
        </template>
      </Column>
    </DataTable>
  </Fieldset>
</template>

<script setup lang="ts">
import {
  formatDuration,
  getMailIntervalMs,
} from "@/composables/services/mails/mailSendPacing";
import {
  stateTagSeverity,
  type MailEntryCounts,
} from "@/composables/services/mails/mailEntryState";
import type {
  MailAttendeeEntry,
  MailSendPacingConfig,
  MailTemplate,
} from "@/types/internal/mails";
import { MailSendStateValue } from "@/types/internal/mails";
import Button from "@/volt/Button.vue";
import DangerButton from "@/volt/DangerButton.vue";
import DataTable from "@/volt/DataTable.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputNumber from "@/volt/InputNumber.vue";
import Message from "@/volt/Message.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import SecondaryButton from "@/volt/SecondaryButton.vue";
import Slider from "@/volt/Slider.vue";
import Tag from "@/volt/Tag.vue";
import Column from "primevue/column";
import { computed, type ModelRef } from "vue";

interface Props {
  template: MailTemplate | null;
  entries: MailAttendeeEntry[];
  sending: boolean;
  stopped: boolean;
  effectiveRate: number;
  backoffNotice: string | null;
  abortNotice: string | null;
  stopNotice: string | null;
  counts: MailEntryCounts;
  progressPercent: number;
  estimatedRemainingMs: number;
}
const props: Props = defineProps<Props>();

const pacing: ModelRef<MailSendPacingConfig> = defineModel<MailSendPacingConfig>(
  "pacing",
  { required: true }
);

const emit = defineEmits<{
  back: [void];
  send: [retryOnly: boolean];
  stop: [void];
}>();

const sendButtonLabel = computed(() =>
  props.sending
    ? "Sending..."
    : props.stopped
      ? "Resume Sending"
      : props.counts.sent === 0
        ? "Send Mails"
        : "Send Remaining"
);

function formatInterval(ratePerMinute: number): string {
  const intervalMs: number = getMailIntervalMs(ratePerMinute);
  return intervalMs <= 0 ? "0s" : formatDuration(intervalMs);
}
</script>
