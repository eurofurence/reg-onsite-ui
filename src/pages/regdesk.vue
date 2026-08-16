<template>
  <OnsitePage title="Registration Desk" :pageTips="pageTips">
    <template #help>
      <ul>
        <li>Use 'Escape' to reset filters and exit the checkin dialog.</li>
        <li>
          Depending on the query mode, pressing 'Enter' will either trigger the
          manual search or select an attendee if there is just a single search
          result.
        </li>
        <li>
          Press Alt+Number to select the nth element of the current search
          page."
        </li>
      </ul>
    </template>
    <RegdeskMainElement />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import RegdeskMainElement from "@/components/regdesk/RegDeskMainElement.vue";

const pageTips: string[] = [
  "Use Escape to reset filters and exit the checkin dialog.",
  "You can search for attendees by name, registration number, or other identifying details.",
  "Available search results update live as you refine your query.",
];
</script>
