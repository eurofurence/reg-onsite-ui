<template>
  <OnsitePage title="On-Site Applications" :pageTips="pageTips">
    <NavTemplate />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import NavTemplate from "@/components/nav/NavTemplate.vue";

const pageTips: string[] = [
  "This page lists every on-site application you have access to.",
  "A shield icon next to an app means it requires a specific access group.",
  "Toggle 'Show disabled apps' to see applications you don't currently have access to.",
  "Apps are grouped by category to make them easier to find.",
  "Disabled apps are shown grayed out until you have the required access.",
  "You can hover over a shield icon to see which access group is required.",
  "Some apps here are only visible to directors or other privileged groups.",
];
</script>
