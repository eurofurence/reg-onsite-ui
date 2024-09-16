<template>
  <PanelSponsordeskMainElement
    title="Sponsor Desk"
    :deskItemSubset="configSponsordeskSubset"
    deskName="sponsordesk"
  />
</template>

<script setup lang="ts">
import { configSponsordeskSubset } from "@/setupEFIteration";
</script>
