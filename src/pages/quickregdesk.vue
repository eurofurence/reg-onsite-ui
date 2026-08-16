<template>
  <OnsitePage title="Quick-Registration Desk" :pageTips="pageTips">
    <template #help>
      Available hotkeys:
      <ul>
        <li>'Escape': Reset reg number input field</li>
        <li>'Enter': Search for reg number</li>
      </ul>
    </template>
    <QuickRegDeskMainElement />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import QuickRegDeskMainElement from "@/components/regdesk/QuickRegDeskMainElement.vue";

const pageTips: string[] = [
  "Press Escape to reset the reg number input field.",
  "Press Enter to search for the entered reg number.",
  "Checking in an attendee here updates their status immediately.",
  "You can process attendees back-to-back without leaving the input field.",
];
</script>
