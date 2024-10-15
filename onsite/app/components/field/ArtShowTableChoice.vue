<template>
  <FieldCommonLabeledPackageSelect
    v-model:model-value="modelValue"
    label="Art Show Tables"
    :width-in-rem="10"
    :metadataRecord="getConventionSetup().metadata.forArtShowTables.record"
    :placeholderKey="ArtShowTable.none"
  />
</template>

<script setup lang="ts">
import { ArtShowTable } from "@/config/metadata/packages/metadataForArtShowTables";
import {
  type PackageApiValue,
  type PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
</script>
