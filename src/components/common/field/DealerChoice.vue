<template>
  <LabeledPackageSelect
    v-model:model-value="modelValue"
    label="Dealer's Den Package"
    :width-in-rem="10"
    :metadataRecord="getConventionSetup().metadata.forDealerPackage.record"
    :placeholderKey="DealerTable.none"
  />
</template>

<script setup lang="ts">
import LabeledPackageSelect from "@/components/common/field/common/LabeledPackageSelect.vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { DealerTable } from "@/config/metadata/packages/metadataForDealerPackages";
import {
  type PackageCountType
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType[] | null> =
  defineModel<PackageCountType[] | null>({ required: true });
</script>
