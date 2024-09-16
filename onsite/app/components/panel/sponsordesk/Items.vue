<template>
  <Toast :group="toastGroup" position="bottom-right" />
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
        severity="error"
        v-if="
          transformedAttendeeInfoRef?.status !== Status.checked_in &&
          transformedAttendeeInfoRef?.status !== null
        "
      >
        The attendee is in status
        <CustomTagControl
          v-model="transformedAttendeeInfoRef.status"
          :configItems="setupStatus"
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
import { getTrinketItemsSubset } from "@/composables/items/getTrinketItemsSubset";
import { attendeeService } from "@/composables/services/attendeeService";
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
} from "@/composables/services/keyboardService";
import { deepCopy } from "@/composables/state/deepCopy";
import { Status, setupStatus } from "@/config/setupStatus";
import { defaultSponsorDeskSettings } from "@/config/sponsordesk";
import type {
  AbstractTrinketValue,
  ConcreteTrinketValue,
} from "@/setupEFIteration";
import type { ApiSponsorDeskAddInfo } from "@/types/external";
import {
  Severity,
  type SponsorDeskSettings,
  type TransformedAttendeeInfo,
} from "@/types/internal";
import type { ToastServiceMethods } from "primevue/toastservice";
import type { ModelRef } from "vue";
import type { CookieRef } from "#app";

const toast: ToastServiceMethods = useToast();
const savingItemsFlag: Ref<boolean> = ref<boolean>(false);

async function saveItems() {
  if (transformedAttendeeInfoRef.value.id === null) {
    toast.add({
      group: toastGroup,
      severity: Severity.warn,
      summary: "Invalid attendee Infos",
      life: 3000,
    });
    return;
  }
  if (!isDirty.value) {
    toast.add({
      group: toastGroup,
      severity: Severity.warn,
      summary: "Items have not changed",
      life: 3000,
    });
    return;
  }
  savingItemsFlag.value = true;
  const putSponsorResult: null | undefined =
    await attendeeService.putSponsorDeskAddInfo(
      getErrorHandlerFunction(toast, toastGroup),
      transformedAttendeeInfoRef.value.id,
      apiSDAddInfoRef.value
    );
  if (putSponsorResult !== undefined) {
    toast.add({
      group: toastGroup,
      severity: Severity.info,
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
  const concreteItems: ConcreteTrinketValue[] = getOwedConcreteItems(
    transformedAttendeeInfoRef.value,
    apiSDAddInfoRef.value
  );
  const availableOwedItems: ConcreteTrinketValue[] | null = getSubsetList(
    concreteItems,
    sponsorDeskSettings.value.available
  );
  const keepIssuedItems: ConcreteTrinketValue[] = [
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
  deskItemSubset: AbstractTrinketValue[];
}
const props: Props = defineProps<Props>();

const sponsorDeskSettings: CookieRef<SponsorDeskSettings> = useSmartCookie(
  props.deskName,
  {
    ...defaultSponsorDeskSettings,
    ...{
      available: getAllConcreteItems(
        getTrinketItemsSubset(props.deskItemSubset)
      ),
    },
  }
);

const componentId: string = generateId(useId());
const toastGroup: string = `items${componentId}`;
</script>

<style>
.issued-items .ef-field-label {
  display: none;
}
</style>
