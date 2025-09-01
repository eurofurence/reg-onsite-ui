<template>
  <SponsorLanyardPanel header="Personal Information" v-model="attendeeInfoRef">
    <div class="flex flex-row flex-wrap gap-3 mt-3">
      <BadgeID v-model="attendeeInfoRef.badge_id" v-bind="$attrs" />
      <NickName v-model="attendeeInfoRef.nickname" v-bind="$attrs" />
      <div v-if="attendeeInfoRef.pronouns || !attendeeInfoRef.id">
        <Pronouns v-model="attendeeInfoRef.pronouns" v-bind="$attrs" />
      </div>
      <SpokenLanguages
        v-model="attendeeInfoRef.spoken_languages_list"
        v-model:registrationLanguage="attendeeInfoRef.registration_language"
        v-bind="$attrs"
      />
      <GoodiesLevel v-model="attendeeInfoRef.packages_list" v-bind="$attrs" />
      <div v-if="hasRoles(attendeeInfoRef)">
        <Role
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
import GoodiesLevel from "@/components/common/field/GoodiesLevel.vue";
import NickName from "@/components/common/field/NickName.vue";
import Pronouns from "@/components/common/field/Pronouns.vue";
import Role from "@/components/common/field/Role.vue";
import SpokenLanguages from "@/components/common/field/SpokenLanguages.vue";
import SponsorLanyardPanel from "@/components/common/SponsorLanyardPanel.vue";
import { hasRoles } from "@/composables/fields/conrole/hasRoles";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ModelRef } from "vue";

const attendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
</script>
