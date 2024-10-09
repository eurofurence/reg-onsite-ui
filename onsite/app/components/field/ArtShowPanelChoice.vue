<template>
  <FieldCommonLabeledPackageSelect
    v-model:model-value="modelValue"
    label="Art Show Panels"
    :width-in-rem="10"
    :metadata-map="metadataRecordForArtShowPanels"
    :placeholderKey="ArtShowPanel.none"
  />
</template>

<script setup lang="ts">
import {
  ArtShowPanel,
  metadataRecordForArtShowPanels,
} from "@/config/metadata/packages/metadataForArtShowPanels";
import {
  type PackageApiValue,
  type PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
</script>
