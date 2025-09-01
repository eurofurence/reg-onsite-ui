<template>
  <OnsitePage title="Registration Desk">
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
</script>
