<template>
  <div :class="fieldCSS">
    <label :class="fieldLabelCSS" :for="componentId">Items</label>
    <div
      class="grid gap-1 auto-cols-auto items-checkbox-list"
      :id="componentId"
    >
      <div class="flex" v-for="trinketConfig of trinketConfigListRef">
        <CustomSponsordeskItem
          :itemGroupId="itemGroupId"
          :trinketConfig="trinketConfig"
          v-model="apiSDAddInfoRef.issuedItems"
          v-model:reservedItems="apiSDAddInfoRef.reservedItems"
          v-model:defaultVariantValues="defaultVariantValuesRef"
          v-model:sponsorDeskSettings="sponsorDeskSettingsRef"
        />
      </div>
    </div>
    <div v-if="trinketConfigListRef.length === 0">Nothing to issue...</div>
  </div>
</template>

<script setup lang="ts">
import { fieldCSS, fieldLabelCSS } from "@/components/field/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external";
import type {
  DefaultVariantValues,
  SponsorDeskSettings,
  TransformedAttendeeInfo,
} from "@/types/internal";
import type { ModelRef } from "vue";

import { getSubsetList } from "@/composables/collection_tools/getSubsetList";
import { getAbstractFromConcreteItems } from "@/composables/items/getAbstractFromConcreteItems";
import { getDefaultVariantValues } from "@/composables/items/getDefaultVariantValues";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getTrinketItemsSubset } from "@/composables/items/getTrinketItemsSubset";
import type { AbstractTrinketValue, TrinketConfig } from "@/setupEFIteration";

const trinketConfigListRef: ComputedRef<TrinketConfig[]> = computed<
  TrinketConfig[]
>(() => {
  const owedConcreteitems = getOwedConcreteItems(
    attendeeInfoRef.value,
    apiSDAddInfoRef.value
  );
  const owedAbstractItemList = getAbstractFromConcreteItems(owedConcreteitems);
  const enabledAbstractItemList: AbstractTrinketValue[] =
    getSubsetList(owedAbstractItemList, props.deskItemSubset) || [];
  return getTrinketItemsSubset(enabledAbstractItemList);
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
  deskItemSubset: AbstractTrinketValue[];
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
