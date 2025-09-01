<template>
  <SponsorLanyardPanel header="General Information" v-model="attendeeInfoRef">
    <div class="flex flex-row flex-wrap gap-3 mt-3">
      <BadgeID v-model="attendeeInfoRef.badge_id" v-bind="$attrs" />
      <NickName v-model="attendeeInfoRef.nickname" v-bind="$attrs" />
      <div v-if="attendeeInfoRef.pronouns || !attendeeInfoRef.id">
        <Pronouns v-model="attendeeInfoRef.pronouns" v-bind="$attrs" />
      </div>
      <ConbookChoice v-model="attendeeInfoRef.flags_list" v-bind="$attrs" />
      <SponsorLevel v-model="attendeeInfoRef.packages_list" v-bind="$attrs" />
      <div v-if="hasDayAttendance(attendeeInfoRef)">
        <DayAttendance
          v-model="attendeeInfoRef.packages_list"
          v-bind="$attrs"
        />
      </div>
      <div v-if="hasRoles(attendeeInfoRef)">
        <Roles
          v-model="attendeeInfoRef.flags_list"
          v-model:regNumber="attendeeInfoRef.id"
          v-bind="$attrs"
        />
      </div>
    </div>
  </SponsorLanyardPanel>
</template>

<script setup lang="ts">
import BadgeID from "@/components/common/field/BadgeID.vue";
import ConbookChoice from "@/components/common/field/ConbookChoice.vue";
import DayAttendance from "@/components/common/field/DayAttendance.vue";
import NickName from "@/components/common/field/NickName.vue";
import Pronouns from "@/components/common/field/Pronouns.vue";
import Roles from "@/components/common/field/Roles.vue";
import SponsorLevel from "@/components/common/field/SponsorLevel.vue";
import SponsorLanyardPanel from "@/components/common/SponsorLanyardPanel.vue";
import { hasDayAttendance } from "@/composables/fields/attendence/hasDayAttendance";
import { hasRoles } from "@/composables/fields/conrole/hasRoles";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ModelRef } from "vue";

const attendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
</script>
