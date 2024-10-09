<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <Message
    :severity="MessageSeverity.warn"
    v-if="attendeeMissingItems.length === 0"
    >{{ descriptionsRef.nothing_missing }}</Message
  >
  <Fieldset
    :legend="`${descriptionsRef.header} ${attendeeShippingInfoRef.nickname} (#${attendeeShippingInfoRef.id})`"
    v-if="attendeeMissingItems.length > 0"
  >
    <div class="flex flex-col gap-2">
      <div>
        {{ descriptionsRef.please_update }}
      </div>
      <div class="m-auto">
        <PanelShippingUserInfo v-model="attendeeShippingInfoRef" />
        <FieldComments
          v-model="attendeeShippingInfoRef.comments"
          :placeholder="descriptionsRef.comments_placeholder"
        />
        <div
          class="flex flex-wrap gap-3 align-items-top"
          v-if="hasMissingTShirt()"
        >
          <FieldTShirtSize v-model="attendeeShippingInfoRef.tshirt_size" />
          <FieldTShirtShape v-model="attendeeShippingInfoRef.tshirt_shape" />
        </div>
      </div>

      <div
        class="flex flex-wrap flex-grow gap-3 text-balance"
        style="max-width: 30rem"
      >
        {{ descriptionsRef.shipping_email }}
        <CustomShippingEmailForwarding
          v-model="attendeeShippingInfoRef"
          :descriptions="descriptionsRef"
        />
      </div>
      <Button
        :disabled="
          JSON.stringify(oldAttendeeShippingInfoRef) ===
          JSON.stringify(attendeeShippingInfoRef)
        "
        label="Save"
        @click="doSave"
      />
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import type { ConcreteGoodieValue } from "@/setupEFIteration";

import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getEmptySponsorDeskAddInfo } from "@/composables/items/getEmptySponsorDeskAddInfo";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { attendeeService } from "@/composables/services/attendeeService";
import { getEmptyShippingAddInfo } from "@/composables/shipping/getEmptyShippingAddInfo";
import { getPrefilledShippingInfo } from "@/composables/shipping/getPrefilledShippingInfo";
import { deepCopy } from "@/composables/deepCopy";
import {
  keyboardService,
  ShortcutScope,
} from "@/composables/services/keyboardService";
import { getShippingI18N, type ShippingI18N } from "@/config/i18n/shipping";
import { ToastSeverity, MessageSeverity } from "@/types/internal/primevue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { ApiShippingAddInfo } from "@/types/external/attsrv/additional-info/shipping";
import { OnsiteToastService } from "@/composables/services/toastService";

keyboardService.pushScope(ShortcutScope.shipping);

const descriptionsRef: Ref<ShippingI18N> = ref<ShippingI18N>(
  getShippingI18N(null)
);

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);
const errorHandler: RestErrorHandler = getErrorHandlerFunction(toastService);

async function determineMissingItems(
  attendeeInfo: TransformedAttendeeInfo
): Promise<ConcreteGoodieValue[] | null | undefined> {
  if (attendeeInfo.id === null) {
    return undefined;
  }
  var storedAttendeeItemInfoTmp: ApiSponsorDeskAddInfo | null | undefined =
    await attendeeService.addInfos.getSponsorDeskAddInfo(
      errorHandler,
      attendeeInfo.id
    );
  if (storedAttendeeItemInfoTmp === undefined) {
    return storedAttendeeItemInfoTmp; // API Error - abort
  } else if (storedAttendeeItemInfoTmp === null) {
    storedAttendeeItemInfoTmp = getEmptySponsorDeskAddInfo();
  }
  const attendeeItemInfo: ApiSponsorDeskAddInfo = storedAttendeeItemInfoTmp; // Just for the linter
  {
    const owedItems: ConcreteGoodieValue[] = getOwedConcreteItems(
      attendeeInfo,
      attendeeItemInfo
    );
    return owedItems.filter(
      (item) => !attendeeItemInfo.issuedItems.includes(item)
    );
  }
}

async function initShippingFields(regNumber: number): Promise<void> {
  const storedAttendeeInfo: TransformedAttendeeInfo | null | undefined = <
    TransformedAttendeeInfo | null | undefined
  >await attendeeService.getAttendeeByRegNumber(errorHandler, regNumber);
  if (!storedAttendeeInfo) {
    return;
  }
  descriptionsRef.value = getShippingI18N(
    storedAttendeeInfo.registration_language
  );
  const missingItems: ConcreteGoodieValue[] | null | undefined =
    await determineMissingItems(storedAttendeeInfo);
  if (!missingItems) {
    return;
  }
  attendeeMissingItems.value = missingItems;

  var attendeeShippingInfo: ApiShippingAddInfo | null | undefined =
    await attendeeService.addInfos.getShippingAddInfo(errorHandler, regNumber);
  if (attendeeShippingInfo === undefined) {
    return; // API Error - abort
  } else if (attendeeShippingInfo === null) {
    attendeeShippingInfoRef.value =
      getPrefilledShippingInfo<TransformedAttendeeInfo>(
        storedAttendeeInfo,
        missingItems
      );
  } else {
    attendeeShippingInfoRef.value = attendeeShippingInfo;
    oldAttendeeShippingInfoRef.value = deepCopy<ApiShippingAddInfo>(
      attendeeShippingInfoRef.value
    );
  }
}

interface Props {
  regNumber: number;
}
const props: Props = defineProps<Props>();
const attendeeMissingItems: Ref<ConcreteGoodieValue[]> = ref([]);
const oldAttendeeShippingInfoRef: Ref<ApiShippingAddInfo> = ref(
  getEmptyShippingAddInfo()
);
const attendeeShippingInfoRef: Ref<ApiShippingAddInfo> = ref(
  getEmptyShippingAddInfo()
);
await initShippingFields(props.regNumber);

function hasMissingTShirt(): boolean {
  return attendeeMissingItems.value.some((item: ConcreteGoodieValue) =>
    item.startsWith("tshirt_")
  );
}

async function doSave(): Promise<void> {
  const result: null | undefined =
    await attendeeService.addInfos.putShippingAddInfo(
      errorHandler,
      props.regNumber,
      attendeeShippingInfoRef.value
    );
  if (result === undefined) {
    toastService.add({
      severity: ToastSeverity.error,
      summary: descriptionsRef.value.stored_failed,
      life: 10000,
    });
    return;
  }
  toastService.add({
    severity: ToastSeverity.success,
    summary: descriptionsRef.value.stored_ok,
    life: 10000,
  });
  oldAttendeeShippingInfoRef.value = deepCopy<ApiShippingAddInfo>(
    attendeeShippingInfoRef.value
  );
}
</script>
