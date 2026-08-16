<template>
  <OnsitePage title="Shipping Information" :pageTips="pageTips">
    <ShippingTemplate />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import ShippingTemplate from "@/components/shipping/ShippingTemplate.vue";

const pageTips: string[] = [
  "This page shows shipping information for all of your own registrations.",
  "If you have no registrations, no shipping information will be shown here.",
  "Each registration you hold gets its own shipping section.",
  "Shipping details are tied to your registration number, not your user account.",
  "You can hold multiple registrations, each with independent shipping information.",
];
</script>
