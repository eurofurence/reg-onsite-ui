<template>
  <OnsitePage title="Quick-Cashier Desk" :pageTips="pageTips">
    <template #help>
      Available hotkeys:
      <ul>
        <li>'Escape': Reset reg number input field</li>
        <li>'Enter': Search for reg number</li>
        <li>'C': Checkin attendee</li>
      </ul>
    </template>
    <QuickRegDeskMainElement enableCashierMode />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import QuickRegDeskMainElement from "@/components/regdesk/QuickRegDeskMainElement.vue";

const pageTips: string[] = [
  "Press Escape to reset the reg number input field.",
  "Press Enter to search for the entered reg number.",
  "Press C to check in the currently found attendee.",
  "The Quick-Cashier Desk combines fast lookup with payment handling.",
  "You can process attendees back-to-back without leaving the input field.",
];
</script>
