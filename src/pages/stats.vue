<template>
  <OnsitePage title="Statistics" :pageTips="pageTips">
    <StatsTemplate />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import StatsTemplate from "@/components/statistics/StatsTemplate.vue";

const pageTips: string[] = [
  "The Attendee Statistics tab summarizes overall attendee numbers.",
  "The Regdesk Statistics tab tracks checkin activity at the registration desks.",
  "The Item Statistics tab tracks item assignments at the sponsor and con store desks.",
  "Switching tabs updates the page's URL hash, so you can bookmark a specific tab.",
  "Statistics reload automatically when you open the page.",
  "A loading bar appears at the top while statistics data is still being fetched.",
  "You can reload the page on a specific tab by sharing its URL with the hash included.",
  "Attendee, regdesk, and item statistics are loaded independently of each other.",
  "This page aggregates data across all attendees, not just your own registrations.",
];
</script>
