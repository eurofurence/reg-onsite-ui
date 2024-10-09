<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <Panel header="Issued Items">
    <template #icons>
      <CustomSponsordeskSelectAvailableItemsButton
        v-model="sponsorDeskSettings.available"
        v-bind:deskItemSubset="props.deskItemSubset"
        @selectAvailable="selectAvailable"
      />
      <Button
        class="ml-1 w-24"
        label="Save"
        @click="saveItems"
        :loading="savingItemsFlag"
        :disabled="!isDirty"
      />
    </template>
    <div class="flex flex-col gap-3">
      <Message
        :severity="MessageSeverity.error"
        v-if="
          transformedAttendeeInfoRef?.status !== AttendeeApiStatus.checked_in &&
          transformedAttendeeInfoRef?.status !== null
        "
      >
        The attendee is in status
        <CustomTagControl
          v-model="transformedAttendeeInfoRef.status"
          :configItems="metadataListForStatus"
        />
        <br />
        The attendee needs to check in at the registration desk before receiving
        any items!
      </Message>
      <div class="issued-items">
        <FieldItems
          v-model="transformedAttendeeInfoRef"
          v-model:apiSDAddInfo="apiSDAddInfoRef"
          v-model:sponsorDeskSettings="sponsorDeskSettings"
          :deskItemSubset="props.deskItemSubset"
        />
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getSubsetList } from "@/composables/collection_tools/getSubsetList";
import { isDirty } from "@/composables/dirty/isDirty";
import { getAllConcreteItems } from "@/composables/items/getAllConcreteItems";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import { attendeeService } from "@/composables/services/attendeeService";
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
} from "@/composables/services/keyboardService";
import { metadataListForStatus } from "@/config/metadata/metadataForStatus";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
} from "@/setupEFIteration";
import type { ModelRef } from "vue";
import type { CookieRef } from "#app";
import { MessageSeverity, ToastSeverity } from "@/types/internal/primevue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { defaultSponsorDeskSettings } from "@/config/system/sponsordesk";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";
import { deepCopy } from "@/composables/deepCopy";
import { OnsiteToastService } from "@/composables/services/toastService";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";

const savingItemsFlag: Ref<boolean> = ref<boolean>(false);

async function saveItems() {
  if (transformedAttendeeInfoRef.value.id === null) {
    toastService.add({
      severity: ToastSeverity.warn,
      summary: "Invalid attendee Infos",
      life: 3000,
    });
    return;
  }
  if (!isDirty.value) {
    toastService.add({
      severity: ToastSeverity.warn,
      summary: "Items have not changed",
      life: 3000,
    });
    return;
  }
  savingItemsFlag.value = true;
  const putSponsorResult: null | undefined =
    await attendeeService.addInfos.putSponsorDeskAddInfo(
      getErrorHandlerFunction(toastService),
      transformedAttendeeInfoRef.value.id,
      apiSDAddInfoRef.value
    );
  if (putSponsorResult !== undefined) {
    toastService.add({
      severity: ToastSeverity.info,
      summary: "Stored issued items",
      life: 500,
    });
    apiSDAddInfoComparisonRef.value = deepCopy<ApiSponsorDeskAddInfo>(
      apiSDAddInfoRef.value
    );
  }
  savingItemsFlag.value = false;
}

async function selectAvailable(event: KeyboardEvent): Promise<void> {
  const concreteItems: ConcreteGoodieValue[] = getOwedConcreteItems(
    transformedAttendeeInfoRef.value,
    apiSDAddInfoRef.value
  );
  const availableOwedItems: ConcreteGoodieValue[] | null = getSubsetList(
    concreteItems,
    sponsorDeskSettings.value.available
  );
  const keepIssuedItems: ConcreteGoodieValue[] = [
    ...new Set([
      ...(availableOwedItems || []),
      ...apiSDAddInfoRef.value.issuedItems,
    ]),
  ];
  apiSDAddInfoRef.value.issuedItems = keepIssuedItems;
}

keyboardService.registerShortcuts(
  ShortcutScope.items,
  ShortcutEvent.keydown,
  ShortcutKey.key_a,
  selectAvailable
);

keyboardService.registerShortcuts(
  ShortcutScope.items,
  ShortcutEvent.keydown,
  ShortcutKey.key_s,
  saveItems
);

const transformedAttendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
const apiSDAddInfoRef: ModelRef<ApiSponsorDeskAddInfo> =
  defineModel<ApiSponsorDeskAddInfo>("apiSDAddInfo", {
    required: true,
  });
const apiSDAddInfoComparisonRef: ModelRef<ApiSponsorDeskAddInfo | null> =
  defineModel<ApiSponsorDeskAddInfo | null>("apiSDAddInfoComparison", {
    required: true,
  });

interface Props {
  deskName: string;
  deskItemSubset: AbstractGoodieValue[];
}
const props: Props = defineProps<Props>();

const sponsorDeskSettings: CookieRef<SponsorDeskSettings> = useSmartCookie(
  props.deskName,
  {
    ...defaultSponsorDeskSettings,
    ...{
      available: getAllConcreteItems(
        getGoodieItemsSubset(props.deskItemSubset)
      ),
    },
  }
);

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);
</script>

<style>
.issued-items .onsite-field-label {
  display: none;
}
</style>
