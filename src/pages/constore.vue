<template>
  <OnsitePage title="Con Store Desk" :pageTips="pageTips">
    <template #help>
      This is the on site interface for the con store. It's inventory
      encompasses all past and current items.<br />
      Available hotkeys:
      <ul>
        <li>'Escape': Reset reg number input field</li>
        <li>'Enter': Search for reg number</li>
        <li>'A': Select all</li>
        <li>'S': Save</li>
      </ul>
    </template>
    <SponsorDeskTemplate deskName="constore" />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import SponsorDeskTemplate from "@/components/sponsordesk/SponsorDeskTemplate.vue";

const pageTips: string[] = [
  "Press Escape to reset the reg number input field.",
  "Press Enter to search for the entered reg number.",
  "Press A to select all available items.",
  "Press S to save the current item selection.",
  "You can review which items an attendee already received before selecting more.",
  "Saving an assignment updates the attendee's item record immediately.",
];
</script>
