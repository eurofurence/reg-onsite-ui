<template>
  <LayoutSponsorLanyardPanel
    header="Personal Information"
    v-model="attendeeInfoRef"
  >
    <div class="flex flex-row flex-wrap gap-3">
      <FieldBadgeID v-model="attendeeInfoRef.badge_id" v-bind="$attrs" />
      <FieldNickName v-model="attendeeInfoRef.nickname" v-bind="$attrs" />
      <div v-if="attendeeInfoRef.pronouns || !attendeeInfoRef.id">
        <FieldPronouns v-model="attendeeInfoRef.pronouns" v-bind="$attrs" />
      </div>
      <FieldSpokenLanguages
        v-model="attendeeInfoRef.spoken_languages_list"
        v-model:registrationLanguage="attendeeInfoRef.registration_language"
        v-bind="$attrs"
      />
      <FieldGoodiesLevel
        v-model="attendeeInfoRef.packages_list"
        v-bind="$attrs"
      />
      <div v-if="hasRoles(attendeeInfoRef)">
        <FieldRole
          v-model="attendeeInfoRef.flags_list"
          v-model:regNumber="attendeeInfoRef.id"
          v-bind="$attrs"
        />
      </div>
    </div>
    <LayoutRegNumberSearchStatus v-model:status="props.searchStatus" />
  </LayoutSponsorLanyardPanel>
</template>

<script setup lang="ts">
import { hasRoles } from "@/composables/fields/conrole/hasRoles";
import type { SearchStatus, TransformedAttendeeInfo } from "@/types/internal";
import type { ModelRef } from "vue";

interface Props {
  searchStatus: SearchStatus;
}
const props: Props = defineProps<Props>();

const attendeeInfoRef: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
</script>
