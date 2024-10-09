<template>
  <FieldCommonLabeledPackageSelect
    v-model:model-value="modelValue"
    label="Dealer's Den Package"
    :width-in-rem="10"
    :metadata-map="metadataRecordForDealerPackages"
    :placeholderKey="DealerTable.none"
  />
</template>

<script setup lang="ts">
import {
  DealerTable,
  metadataRecordForDealerPackages,
} from "@/config/metadata/packages/metadataForDealerPackages";
import {
  type PackageApiValue,
  type PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
</script>
