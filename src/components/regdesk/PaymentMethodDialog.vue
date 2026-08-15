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
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
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
import { ref, type Ref } from "vue";

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
</script>
