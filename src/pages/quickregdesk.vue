<template>
  <OnsitePage title="Quick-Registration Desk">
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
</script>
