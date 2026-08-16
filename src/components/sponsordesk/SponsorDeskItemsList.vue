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
        v-if="hasPayableItems"
        class="h-10"
        icon="pi pi-credit-card"
        label="Pay for Items"
        @click="payDialogVisible = true"
      />
      <Button
        class="h-10 w-24"
        label="Save"
        @click="saveItems"
        :loading="savingItemsFlag"
        :disabled="!isDirty"
      />
    </template>
    <PayForItemsDialog
      v-model:visible="payDialogVisible"
      :attendeeInfo="transformedAttendeeInfoRef"
      :toastService="toastService"
      :onPaid="onItemsPaid"
    />
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
          (forceCommentField !== null &&
            forceCommentField == transformedAttendeeInfoRef.id)
        "
      />
    </div>
  </Panel>
</template>

<script setup lang="ts">
import Comments from "@/components/common/field/Comments.vue";
import Items from "@/components/common/field/Items.vue";
import TagControl from "@/components/common/TagControl.vue";
import PayForItemsDialog from "@/components/sponsordesk/PayForItemsDialog.vue";
import SponsorDeskAvailableItemsButton from "@/components/sponsordesk/SponsorDeskAvailableItemsButton.vue";
import { getSponsorDeskConfig } from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getSubsetList } from "@/composables/collection_tools/subsets/getSubsetList";
import { deepCopy } from "@/composables/deepCopy";
import { isDirty } from "@/composables/dirty/isDirty";
import { generateId } from "@/composables/generateId";
import { useAvailableItems } from "@/composables/items/useAvailableItems";
import { getAbstractFromConcreteItems } from "@/composables/items/getAbstractFromConcreteItems";
import { getConcreteItemsEntitlement } from "@/composables/items/getConcreteItemsEntitlement";
import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
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
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
} from "@/config/convention";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { MessageSeverity, ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import Message from "@/volt/Message.vue";
import Panel from "@/volt/Panel.vue";
import Toast from "@/volt/Toast.vue";
import type { ModelRef } from "vue";
import { computed, onMounted, ref, useId, watch, type Ref } from "vue";

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

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const sponsorDeskSettings = useAvailableItems(props.deskItemSubset, getErrorHandlerFunction(toastService));

const savingItemsFlag: Ref<boolean> = ref<boolean>(false);
const forceCommentField: Ref<RegNumber | null> = ref<RegNumber | null>(null);
const payDialogVisible: Ref<boolean> = ref<boolean>(false);

function onItemsPaid(items: ConcreteGoodieValue[]): void {
  apiSDAddInfoRef.value.issuedItems = [
    ...new Set([...items, ...apiSDAddInfoRef.value.issuedItems]),
  ];
}

// Concrete items currently rendered in the "Issued Items" list below, computed
// the same way Items.vue derives its rows — used only to decide whether the
// "Pay for Items" button should show at all.
const listedConcreteItems = computed<ConcreteGoodieValue[]>(() => {
  const relevantConcreteItems = getConcreteItemsEntitlement(
    transformedAttendeeInfoRef.value,
    apiSDAddInfoRef.value
  );
  const relevantAbstractItemList = getAbstractFromConcreteItems(relevantConcreteItems);
  const enabledAbstractItemList = getSubsetList(relevantAbstractItemList, props.deskItemSubset) || [];
  return getGoodieItemsSubset(enabledAbstractItemList).flatMap(getConcreteItemsForGoodie);
});

const payableItemKeys: Ref<Set<string>> = ref(new Set());

onMounted(async () => {
  const config = await getSponsorDeskConfig(getErrorHandlerFunction(toastService));
  payableItemKeys.value = new Set(
    Object.entries(config?.itemPayments ?? {})
      .filter(([, settings]) => settings.enabled)
      .map(([item]) => item)
  );
});

const hasPayableItems = computed<boolean>(() =>
  listedConcreteItems.value.some((item) => payableItemKeys.value.has(item))
);

function showCommentField() {
  forceCommentField.value = transformedAttendeeInfoRef.value.id;
}

watch(
  () => transformedAttendeeInfoRef.value.id,
  () => {
    forceCommentField.value = null;
  }
);

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
  const concreteItems: ConcreteGoodieValue[] = getConcreteItemsEntitlement(
    transformedAttendeeInfoRef.value,
    apiSDAddInfoRef.value
  );
  const availableRelevantItems: ConcreteGoodieValue[] | null = getSubsetList(
    concreteItems,
    sponsorDeskSettings.value.available
  );
  const keepIssuedItems: ConcreteGoodieValue[] = [
    ...new Set([
      ...(availableRelevantItems || []),
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

</script>

<style lang="css">
.issued-items .onsite-field-label {
  display: none;
}
</style>
