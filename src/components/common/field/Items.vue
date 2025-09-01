<template>
  <div :class="fieldCSS">
    <label :class="fieldLabelCSS" :for="componentId">Items</label>
    <div
      class="items-checkbox-list grid gap-1 grid-cols-1 [@media(min-width:1500px)]:grid-cols-2 [@media(min-width:1500px)]:gap-x-4"
      :id="componentId"
    >
      <div v-for="goodieConfig of goodieConfigListRef">
        <SponsorDeskItemElement
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
import { getDefaultVariantValues } from "@/composables/items/getDefaultVariantValues";
import { getGoodieItemsSubset } from "@/composables/items/getGoodieItemsSubset";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import type { AbstractGoodieValue, GoodieConfig } from "@/config/convention";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";
import { computed, useId, type ComputedRef } from "vue";

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

<style lang="css">
@media (min-width: 1500px) {
  .items-checkbox-list > *:nth-child(2n) {
    border-left: 1px solid #ccc;
    padding-left: 1rem;
  }
}
</style>
