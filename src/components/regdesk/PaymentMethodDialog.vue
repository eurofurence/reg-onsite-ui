<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
    header="Choose Payment Method"
    class="w-fit"
  >
    <div class="flex flex-col gap-4 items-center">
      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
      <div class="flex gap-2">
        <Button
          label="Cash"
          :disabled="inFlight"
          @click="onCashClick"
        />
        <Button
          label="Credit Card"
          severity="secondary"
          :disabled="inFlight"
          @click="onCreditCardClick"
        />
        <Button
          label="Card Terminal"
          severity="secondary"
          :disabled="inFlight"
          @click="onCardTerminalClick"
        />
      </div>
      <div v-if="readers && readers.length > 1" class="flex flex-col gap-2 items-center">
        <p class="text-sm">Choose a terminal:</p>
        <div class="flex gap-2 flex-wrap justify-center">
          <Button
            v-for="reader in readers"
            :key="reader.id"
            :label="reader.name"
            size="small"
            :disabled="inFlight"
            @click="chargeReader(reader.id)"
          />
        </div>
      </div>
      <p v-if="terminalStatusMessage" class="text-sm">{{ terminalStatusMessage }}</p>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { getSumUpReaders, type SumUpReader } from "@/composables/api/backend/getSumUpReaders";
import {
  getSumUpReaderCheckoutJobStatus,
  type SumUpReaderCheckoutJobStatus,
} from "@/composables/api/backend/getSumUpReaderCheckoutJob";
import { startSumUpReaderCheckout } from "@/composables/api/backend/postSumUpReaderCheckout";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiTransaction } from "@/types/external/paysrv/transactions";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Dialog from "@/volt/Dialog.vue";
import QRCode from "qrcode";
import { onUnmounted, ref, type Ref } from "vue";

const paymentQrTabName = "onsite-payment-qr";

interface Props {
  regNumber: RegNumber;
  updateAttendee: (
    regNumber: RegNumber
  ) => Promise<TransformedAttendeeInfo | null>;
  toastService: OnsiteToastService;
}
const props = defineProps<Props>();
const visible: Ref<boolean> = defineModel<boolean>("visible", {
  required: true,
});

const inFlight: Ref<boolean> = ref(false);
const errorMessage: Ref<string | null> = ref(null);

async function onCashClick(): Promise<void> {
  errorMessage.value = null;
  inFlight.value = true;
  let paymentFailed = false;
  const baseErrorHandler = getErrorHandlerFunction(props.toastService);
  await attendeeService.postInitPaymentForAttendee(
    (info) => {
      paymentFailed = true;
      baseErrorHandler(info);
    },
    props.regNumber,
    "cash"
  );
  inFlight.value = false;
  if (paymentFailed) return;
  visible.value = false;
  const updatedAttendee: TransformedAttendeeInfo | null =
    await props.updateAttendee(props.regNumber);
  if (updatedAttendee?.status === AttendeeApiStatus.paid) {
    props.toastService.add({
      severity: ToastSeverity.info,
      summary: `Payment completed for attendee ${props.regNumber}`,
      life: 2000,
    });
  } else {
    props.toastService.add({
      severity: ToastSeverity.warn,
      summary: `Payment for attendee ${props.regNumber} did not complete as expected`,
      life: 5000,
    });
  }
}

async function showPaymentQrTab(paymentStartUrl: string): Promise<void> {
  const qrDataUrl = await QRCode.toDataURL(paymentStartUrl, { width: 512 });
  const tab = window.open("", paymentQrTabName);
  if (!tab) {
    errorMessage.value =
      "Could not open payment tab. Please allow pop-ups and try again.";
    return;
  }
  tab.document.title = "Credit Card Payment";
  tab.document.body.innerHTML = "";
  const heading = tab.document.createElement("h1");
  heading.textContent = "Scan to pay";
  const image = tab.document.createElement("img");
  image.src = qrDataUrl;
  image.alt = "Payment QR code";
  const link = tab.document.createElement("a");
  link.href = paymentStartUrl;
  link.textContent = paymentStartUrl;
  tab.document.body.append(heading, image, tab.document.createElement("br"), link);
  tab.focus();
}

async function onCreditCardClick(): Promise<void> {
  errorMessage.value = null;
  inFlight.value = true;
  let paymentFailed = false;
  const baseErrorHandler = getErrorHandlerFunction(props.toastService);
  const transaction: ApiTransaction | undefined =
    await attendeeService.postInitPaymentForAttendee(
      (info) => {
        paymentFailed = true;
        baseErrorHandler(info);
      },
      props.regNumber,
      "credit"
    );
  inFlight.value = false;
  if (paymentFailed || !transaction) return;
  await showPaymentQrTab(transaction.transaction.payment_start_url);
  visible.value = false;
}

const readers: Ref<SumUpReader[] | null> = ref(null);
const terminalStatusMessage: Ref<string | null> = ref(null);
let pollTimer: ReturnType<typeof setTimeout> | null = null;

function stopPolling(): void {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = null;
}
onUnmounted(stopPolling);

async function onCardTerminalClick(): Promise<void> {
  errorMessage.value = null;
  terminalStatusMessage.value = null;
  inFlight.value = true;
  const baseErrorHandler = getErrorHandlerFunction(props.toastService);
  const fetchedReaders = await getSumUpReaders(baseErrorHandler);
  inFlight.value = false;
  if (!fetchedReaders || fetchedReaders.length === 0) {
    errorMessage.value = "No SumUp terminals available.";
    return;
  }
  const onlyReader = fetchedReaders[0];
  if (fetchedReaders.length === 1 && onlyReader) {
    await chargeReader(onlyReader.id);
    return;
  }
  readers.value = fetchedReaders;
}

async function pollCheckoutJob(jobId: string): Promise<void> {
  const baseErrorHandler = getErrorHandlerFunction(props.toastService);
  const job: SumUpReaderCheckoutJobStatus | undefined =
    await getSumUpReaderCheckoutJobStatus(baseErrorHandler, jobId);
  if (job === undefined) {
    inFlight.value = false;
    terminalStatusMessage.value = null;
    return;
  }
  if (job.status === "polling") {
    terminalStatusMessage.value = "Waiting for terminal...";
    pollTimer = setTimeout(() => pollCheckoutJob(jobId), 2000);
    return;
  }
  inFlight.value = false;
  terminalStatusMessage.value = null;
  readers.value = null;
  if (job.status === "error") {
    errorMessage.value = job.error ?? "Card terminal payment failed";
    return;
  }
  visible.value = false;
  const updatedAttendee: TransformedAttendeeInfo | null =
    await props.updateAttendee(props.regNumber);
  if (updatedAttendee?.status === AttendeeApiStatus.paid) {
    props.toastService.add({
      severity: ToastSeverity.info,
      summary: `Payment completed for attendee ${props.regNumber}`,
      life: 2000,
    });
  } else {
    props.toastService.add({
      severity: ToastSeverity.warn,
      summary: `Payment for attendee ${props.regNumber} did not complete as expected`,
      life: 5000,
    });
  }
}

async function chargeReader(readerId: string): Promise<void> {
  errorMessage.value = null;
  inFlight.value = true;
  const baseErrorHandler = getErrorHandlerFunction(props.toastService);
  const result = await startSumUpReaderCheckout(
    baseErrorHandler,
    readerId,
    props.regNumber
  );
  if (!result) {
    inFlight.value = false;
    return;
  }
  terminalStatusMessage.value = "Waiting for terminal...";
  await pollCheckoutJob(result.job_id);
}
</script>
