<template>
  <OnsitePage title="Item Management" :pageTips="pageTips">
    <ItemManagementTemplate />
  </OnsitePage>
</template>

<script setup lang="ts">
import OnsitePage from "@/components/common/OnsitePage.vue";
import ItemManagementTemplate from "@/components/items/ItemManagementTemplate.vue";

const pageTips: string[] = [
  "Use the Overview tab to see a tree view of the entire item inventory.",
  "The Transfer tab lets you move items between attendees.",
  "The Manage Counts tab is where inventory quantities are adjusted.",
  "The Change Log tab records a history of item changes.",
  "The Attendee History tab shows the items associated with an attendee.",
  "The Comments tab lets you leave notes tied to specific attendees.",
  "Some tabs, like Assign Items and SumUp, are restricted to directors.",
  "A shield icon next to a menu entry means it requires director access.",
  "Your active tab is remembered locally, so it stays selected next time you visit.",
];
</script>
