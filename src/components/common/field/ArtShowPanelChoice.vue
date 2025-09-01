<template>
  <LabeledPackageSelect
    v-model:model-value="modelValue"
    label="Art Show Panels"
    :width-in-rem="10"
    :metadataRecord="getConventionSetup().metadata.forArtShowPanels.record"
    :placeholderKey="ArtShowPanel.none"
  />
</template>

<script setup lang="ts">
import LabeledPackageSelect from "@/components/common/field/common/LabeledPackageSelect.vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { ArtShowPanel } from "@/config/metadata/packages/metadataForArtShowPanels";
import { type PackageCountType } from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType[] | null> = defineModel<
  PackageCountType[] | null
>({ required: true });
</script>
