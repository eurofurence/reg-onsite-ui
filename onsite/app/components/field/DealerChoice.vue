<template>
  <FieldCommonLabeledPackageSelect
    v-model:model-value="modelValue"
    label="Dealer's Den Package"
    :width-in-rem="10"
    :metadataRecord="getConventionSetup().metadata.forDealerPackage.record"
    :placeholderKey="DealerTable.none"
  />
</template>

<script setup lang="ts">
import { DealerTable } from "@/config/metadata/packages/metadataForDealerPackages";
import {
  type PackageApiValue,
  type PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
</script>
