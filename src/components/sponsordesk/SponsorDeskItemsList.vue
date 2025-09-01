<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <Panel
    header="Issued Items"
    :pt:header:class="
      isDarkMode
        ? `bg-gradient-to-r from-gray-800 to-gray-700 h-14 pr-1.5`
        : `bg-gradient-to-r from-gray-300 to-gray-200 h-14 pr-1.5`
    "
  >
    <template #icons>
      <SponsorDeskAvailableItemsButton
        v-model="sponsorDeskSettings.available"
        v-bind:deskItemSubset="props.deskItemSubset"
        @onSelectAvailable="selectAvailable"
        @onShowCommentField="showCommentField"
      />
      <Button
        class="h-10 w-24"
        label="Save"
        @click="saveItems"
        :loading="savingItemsFlag"
        :disabled="!isDirty"
      />
    </template>
    <div class="flex flex-col gap-3 mt-3">
      <Message
        :severity="MessageSeverity.error"
        v-if="
          transformedAttendeeInfoRef?.status !== AttendeeApiStatus.checked_in &&
          transformedAttendeeInfoRef?.status !== null
        "
      >
        The attendee is in status
        <TagControl
          v-model="transformedAttendeeInfoRef.status"
          :configItems="getConventionSetup().metadata.forStatus.list"
        />
        <br />
        The attendee needs to check in at the registration desk before receiving
        any items!
      </Message>
      <div class="issued-items text-2xl">
        <Items
          v-model="transformedAttendeeInfoRef"
          v-model:apiSDAddInfo="apiSDAddInfoRef"
          v-model:sponsorDeskSettings="sponsorDeskSettings"
          :deskItemSubset="props.deskItemSubset"
        />
      </div>
      <Comments
        v-model="apiSDAddInfoRef.comment"
        placeholder="Notes about issued items"
        :showSkeleton="false"
        data-disable-shortcuts
        v-if="
          apiSDAddInfoRef.comment.length > 0 ||
          forceCommentField == transformedAttendeeInfoRef.id
        "
      />
    </div>
  </Panel>
</template>

<script setup lang="ts">
import Comments from "@/components/common/field/Comments.vue";
import Items from "@/components/common/field/Items.vue";
import TagControl from "@/components/common/TagControl.vue";
import SponsorDeskAvailableItemsButton from "@/components/sponsordesk/SponsorDeskAvailableItemsButton.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getSubsetList } from "@/composables/collection_tools/subsets/getSubsetList";
import { deepCopy } from "@/composables/deepCopy";
import { isDirty } from "@/composables/dirty/isDirty";
import { generateId } from "@/composables/generateId";
import { getAllConcreteItems } from "@/composables/items/getAllConcreteItems";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { attendeeService } from "@/composables/services/attendeeService";
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
  type KeyboardServiceEvent,
} from "@/composables/services/keyboardService";
import { OnsiteToastService } from "@/composables/services/toastService";
import { isDarkMode } from "@/composables/theme/isDarkMode";
import { useSmartCookie } from "@/composables/useSmartCookie";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
} from "@/config/convention";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import { defaultSponsorDeskSettings } from "@/config/system/sponsordesk";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { MessageSeverity, ToastSeverity } from "@/types/internal/primevue";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";
import Button from "@/volt/Button.vue";
import Message from "@/volt/Message.vue";
import Panel from "@/volt/Panel.vue";
import Toast from "@/volt/Toast.vue";
import type { ModelRef } from "vue";
import { ref, useId, type Ref } from "vue";

const savingItemsFlag: Ref<boolean> = ref<boolean>(false);
const forceCommentField: Ref<RegNumber> = ref<RegNumber>(0 as RegNumber);

function showCommentField() {
  forceCommentField.value =
    transformedAttendeeInfoRef.value.id || (0 as RegNumber);
}

async function saveItems(): Promise<any> {
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
  return;
}

async function onKeyS(_event: KeyboardServiceEvent): Promise<boolean> {
  await saveItems();
  return true;
}

keyboardService.registerShortcuts(
  ShortcutScope.items,
  ShortcutEvent.keydown,
  ShortcutKey.key_s,
  onKeyS
);

async function selectAvailable(): Promise<any> {
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

async function onKeyA(_event: KeyboardServiceEvent): Promise<boolean> {
  await selectAvailable();
  return true;
}

keyboardService.registerShortcuts(
  ShortcutScope.items,
  ShortcutEvent.keydown,
  ShortcutKey.key_a,
  onKeyA
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

const sponsorDeskSettings: Ref<SponsorDeskSettings> = useSmartCookie(
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

<style lang="css">
.issued-items .onsite-field-label {
  display: none;
}
</style>
