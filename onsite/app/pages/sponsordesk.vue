<template>
  <LayoutOnsitePage title="Sponsor Desk">
    <template #help>
      Available hotkeys:
      <ul>
        <li>'Escape': Reset reg number input field</li>
        <li>'Enter': Search for reg number</li>
        <li>'A': Select all</li>
        <li>'S': Save</li>
      </ul>
    </template>
    <PageTemplateSponsorDesk
      :deskItemSubset="configSponsordeskSubset"
      deskName="sponsordesk"
    />
  </LayoutOnsitePage>
</template>

<script setup lang="ts">
import { configSponsordeskSubset } from "@/setupEFIteration";
</script>
