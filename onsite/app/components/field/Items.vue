<template>
  <div :class="fieldCSS">
    <label :class="fieldLabelCSS" :for="componentId">Items</label>
    <div
      class="grid gap-1 auto-cols-auto items-checkbox-list"
      :id="componentId"
    >
      <div class="flex" v-for="goodieConfig of goodieConfigListRef">
        <CustomSponsordeskItem
          :itemGroupId="itemGroupId"
          :goodieConfig="goodieConfig"
          v-model="apiSDAddInfoRef.issuedItems"
          v-model:reservedItems="apiSDAddInfoRef.reservedItems"
          v-model:defaultVariantValues="defaultVariantValuesRef"
          v-model:sponsorDeskSettings="sponsorDeskSettingsRef"
        />
      </div>
    </div>
    <div v-if="goodieConfigListRef.length === 0">Nothing to issue...</div>
  </div>
</template>

<script setup lang="ts">
import { fieldCSS, fieldLabelCSS } from "@/components/field/common/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { ModelRef } from "vue";

import { getSubsetList } from "@/composables/collection_tools/getSubsetList";
import { getAbstractFromConcreteItems } from "@/composables/items/getAbstractFromConcreteItems";
import { getDefaultVariantValues } from "@/composables/items/getDefaultVariantValues";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import type { AbstractGoodieValue, GoodieConfig } from "@/setupEFIteration";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";

const goodieConfigListRef: ComputedRef<GoodieConfig[]> = computed<
  GoodieConfig[]
>(() => {
  const owedConcreteitems = getOwedConcreteItems(
    attendeeInfoRef.value,
    apiSDAddInfoRef.value
  );
  const owedAbstractItemList = getAbstractFromConcreteItems(owedConcreteitems);
  const enabledAbstractItemList: AbstractGoodieValue[] =
    getSubsetList(owedAbstractItemList, props.deskItemSubset) || [];
  return getGoodieItemsSubset(enabledAbstractItemList);
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
}
const props: Props = defineProps<Props>();
const componentId: string = generateId(useId());
const itemGroupId: string = `itemGroup${componentId}`;
</script>

<style>
.items-checkbox-list {
  display: grid;
  grid-template-columns: 1fr;
}

/* Switch to two columns if screen is wider than 1200px */
@media (min-width: 1500px) {
  .items-checkbox-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
