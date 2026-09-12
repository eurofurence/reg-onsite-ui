<template>
  <OnsitePage title="Mass Mail" :pageTips="pageTips">
    <MailManagementTemplate />
  </OnsitePage>
</template>

<script setup lang="ts">
import MailManagementTemplate from "@/components/mails/MailManagementTemplate.vue";
import OnsitePage from "@/components/common/OnsitePage.vue";

const pageTips: string[] = [
  "The Mass Mail page sends registered attendees emails from mail templates.",
  "First, select a mail template and its language, then filter and select the attendees to notify.",
  "Use the checkbox column to select attendees individually, or the 'Select all filtered' button to select every matching attendee; the header checkbox toggles all filtered rows at once.",
  "Template variables are filled automatically from each attendee's data; the example value uses the currently clicked attendee, falling back to the first selected one.",
  "Clicking a row in the attendees table shows the rendered mail preview (subject and body) for that attendee.",
  "You can override a template variable for all recipients by entering a value in the override column.",
  "Attendees with the no-bulk-mail flag never receive mass mail and are shown as skipped.",
  "Sending happens one attendee at a time and the progress table updates live. You can tune the batch size, send rate, error backoff, rate reduction and abort threshold in the Send pacing section.",
  "You can stop sending at any time with the Stop button; the remaining recipients stay pending and can be resumed later.",
  "Failed sends can simply be retried with the Retry Failed button. Emails are only sent to attendees with an email address.",
];
</script>
