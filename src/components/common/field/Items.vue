<template>
  <div :class="fieldCSS">
    <label :class="fieldLabelCSS" :for="componentId">Items</label>
    <div
      class="items-checkbox-list grid gap-1 grid-cols-1 [@media(min-width:1500px)]:grid-cols-2 [@media(min-width:1500px)]:gap-x-4"
      :id="componentId"
    >
      <div
        v-for="(row, index) of itemRowsRef"
        :key="row.key"
      >
        <SponsorDeskItemElement
          :ref="(el) => setItemRef(index, el)"
          :itemGroupId="itemGroupId"
          :goodieConfig="row.goodieConfig"
          :unitIndex="row.unitIndex"
          v-model="apiSDAddInfoRef.issuedItems"
          v-model:reservedItems="apiSDAddInfoRef.reservedItems"
          v-model:defaultVariantValues="defaultVariantValuesRef"
          v-model:sponsorDeskSettings="sponsorDeskSettingsRef"
          :payableItemKeys="props.payableItemKeys"
        />
      </div>
    </div>
    <div v-if="itemRowsRef.length === 0">Nothing to issue...</div>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
} from "@/components/common/field/common/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { ModelRef } from "vue";

import SponsorDeskItemElement from "@/components/sponsordesk/SponsorDeskItemElement.vue";
import { getSubsetList } from "@/composables/collection_tools/subsets/getSubsetList";
import { generateId } from "@/composables/generateId";
import { getAbstractFromConcreteItems } from "@/composables/items/getAbstractFromConcreteItems";
import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import { getDefaultVariantValues } from "@/composables/items/getDefaultVariantValues";
import { getEntitledAbstractItems } from "@/composables/items/getEntitledAbstractItems";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import { getConcreteItemsEntitlement } from "@/composables/items/getConcreteItemsEntitlement";
import type { AbstractGoodieValue, ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";
import { computed, ref, useId, type ComputedRef, type Ref } from "vue";

interface ItemRowDescriptor {
  key: string;
  goodieConfig: GoodieConfig;
  unitIndex: number;
}

const goodieConfigListRef: ComputedRef<GoodieConfig[]> = computed<
  GoodieConfig[]
>(() => {
  const relevantConcreteItems = getConcreteItemsEntitlement(
    attendeeInfoRef.value,
    apiSDAddInfoRef.value
  );
  const relevantAbstractItemList = getAbstractFromConcreteItems(relevantConcreteItems);
  const enabledAbstractItemList: AbstractGoodieValue[] =
    getSubsetList(relevantAbstractItemList, props.deskItemSubset) || [];
  return getGoodieItemsSubset(enabledAbstractItemList);
});

const itemRowsRef: ComputedRef<ItemRowDescriptor[]> = computed<
  ItemRowDescriptor[]
>(() => {
  const entitledAbstractItems = getEntitledAbstractItems(
    attendeeInfoRef.value.packages_list || [],
    attendeeInfoRef.value.flags_list || [],
    attendeeInfoRef.value.id || (0 as RegNumber)
  );
  return goodieConfigListRef.value.flatMap((goodieConfig: GoodieConfig) => {
    const concreteKeysForThisGoodie = new Set(
      getConcreteItemsForGoodie(goodieConfig)
    );
    const countConcrete = (list: ConcreteGoodieValue[]): number =>
      list.filter((value: ConcreteGoodieValue) =>
        concreteKeysForThisGoodie.has(value)
      ).length;
    // Setup + past are additive (both owed). Issued/reserved fulfill those slots
    // but can exceed them — use max to avoid shrinking rows when items are checked.
    const setupCount =
      entitledAbstractItems.filter((v) => v === goodieConfig.value).length;
    const pastCount = countConcrete(apiSDAddInfoRef.value.pastItems);
    const issuedCount = countConcrete(apiSDAddInfoRef.value.issuedItems);
    const reservedCount = countConcrete(apiSDAddInfoRef.value.reservedItems);
    const rowCount = Math.max(setupCount + pastCount, issuedCount, reservedCount, 1);
    return Array.from(
      { length: rowCount },
      (_, unitIndex: number): ItemRowDescriptor => ({
        key: `${goodieConfig.value}:${unitIndex}`,
        goodieConfig,
        unitIndex,
      })
    );
  });
});

const defaultVariantValuesRef: ComputedRef<DefaultVariantValues> =
  computed<DefaultVariantValues>(() => {
    return getDefaultVariantValues(
      attendeeInfoRef.value,
      apiSDAddInfoRef.value
    );
  });

const attendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
const apiSDAddInfoRef: ModelRef<ApiSponsorDeskAddInfo> =
  defineModel<ApiSponsorDeskAddInfo>("apiSDAddInfo", {
    required: true,
  });
const sponsorDeskSettingsRef: ModelRef<SponsorDeskSettings> =
  defineModel<SponsorDeskSettings>("sponsorDeskSettings", {
    required: true,
  });

interface Props {
  deskItemSubset: AbstractGoodieValue[];
  payableItemKeys?: Set<string>;
}
const props: Props = defineProps<Props>();
const componentId: string = generateId(useId());
const itemGroupId: string = `itemGroup${componentId}`;

const itemRefs: Ref<(InstanceType<typeof SponsorDeskItemElement> | null)[]> = ref([]);

function setItemRef(index: number, el: any): void {
  itemRefs.value[index] = el;
}

function selectAllAvailable(): void {
  const itemsToAdd: ConcreteGoodieValue[] = [];
  for (const itemRef of itemRefs.value) {
    const item = itemRef?.getAvailableItemToAdd();
    if (item != null) {
      itemsToAdd.push(item);
    }
  }
  if (itemsToAdd.length > 0) {
    apiSDAddInfoRef.value.issuedItems = [
      ...apiSDAddInfoRef.value.issuedItems,
      ...itemsToAdd,
    ];
  }
}

defineExpose({ selectAllAvailable });
</script>

<style lang="css">
@media (min-width: 1500px) {
  .items-checkbox-list > *:nth-child(2n) {
    border-left: 1px solid #ccc;
    padding-left: 1rem;
  }
}
</style>
