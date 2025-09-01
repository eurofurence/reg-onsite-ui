<template>
  <OnsitePage title="Sponsor Desk">
    <template #help>
      This is the on site interface for the con store. It's inventory
      encompasses only the current sponsor items. Available hotkeys:
      <ul>
        <li>'Escape': Reset reg number input field</li>
        <li>'Enter': Search for reg number</li>
        <li>'A': Select all</li>
        <li>'S': Save</li>
      </ul>
    </template>
    <SponsorDeskTemplate deskName="sponsordesk" />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import SponsorDeskTemplate from "@/components/sponsordesk/SponsorDeskTemplate.vue";
</script>
