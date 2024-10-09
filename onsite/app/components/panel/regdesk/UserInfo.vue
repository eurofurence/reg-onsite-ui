<template>
  <LayoutSponsorLanyardPanel
    header="General Information"
    v-model="attendeeInfoRef"
  >
    <div class="flex flex-row flex-wrap gap-3">
      <FieldBadgeID v-model="attendeeInfoRef.badge_id" v-bind="$attrs" />
      <FieldNickName v-model="attendeeInfoRef.nickname" v-bind="$attrs" />
      <div v-if="attendeeInfoRef.pronouns || !attendeeInfoRef.id">
        <FieldPronouns v-model="attendeeInfoRef.pronouns" v-bind="$attrs" />
      </div>
      <FieldConbookChoice
        v-model="attendeeInfoRef.flags_list"
        v-bind="$attrs"
      />
      <FieldSponsorLevel
        v-model="attendeeInfoRef.packages_list"
        v-bind="$attrs"
      />
      <div v-if="hasDayAttendance(attendeeInfoRef)">
        <FieldDayAttendance
          v-model="attendeeInfoRef.packages_list"
          v-bind="$attrs"
        />
      </div>
      <div v-if="hasRoles(attendeeInfoRef)">
        <FieldRoles
          v-model="attendeeInfoRef.flags_list"
          v-model:regNumber="attendeeInfoRef.id"
          v-bind="$attrs"
        />
      </div>
    </div>
  </LayoutSponsorLanyardPanel>
</template>

<script setup lang="ts">
import { hasDayAttendance } from "@/composables/fields/attendence/hasDayAttendance";
import { hasRoles } from "@/composables/fields/conrole/hasRoles";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ModelRef } from "vue";

const attendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
</script>
