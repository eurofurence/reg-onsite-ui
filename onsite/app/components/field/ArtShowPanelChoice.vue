<template>
  <FieldCommonLabeledPackageSelect
    v-model:model-value="modelValue"
    label="Art Show Panels"
    :width-in-rem="10"
    :metadataRecord="getConventionSetup().metadata.forArtShowPanels.record"
    :placeholderKey="ArtShowPanel.none"
  />
</template>

<script setup lang="ts">
import { ArtShowPanel } from "@/config/metadata/packages/metadataForArtShowPanels";
import {
  type PackageApiValue,
  type PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
</script>
