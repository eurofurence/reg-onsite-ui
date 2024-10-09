<template>
  <FieldCommonLabeledPackageSelect
    v-model:model-value="modelValue"
    label="Art Show Tables"
    :width-in-rem="10"
    :metadata-map="metadataRecordForArtShowTables"
    :placeholderKey="ArtShowTable.none"
  />
</template>

<script setup lang="ts">
import {
  ArtShowTable,
  metadataRecordForArtShowTables,
} from "@/config/metadata/packages/metadataForArtShowTables";
import {
  type PackageApiValue,
  type PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
</script>
