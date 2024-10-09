<template>
  {{ attendee }}
  <FieldArtShowPanelChoice v-model:model-value="attendee.packages_list" />
  <FieldArtShowTableChoice v-model:model-value="attendee.packages_list" />
  <FieldBadgeID v-model:model-value="attendee.badge_id" />
  <FieldBirthday v-model:model-value="attendee.birthday" />
  <FieldBirthdayLocale v-model:model-value="attendee" />
  <FieldCity v-model:model-value="attendee.city" />
  <FieldConbookChoice v-model:model-value="attendee.flags_list" />
  <FieldCountry v-model:model-value="attendee.country" />
  <FieldDayAttendance v-model:model-value="attendee.packages_list" />
  <FieldDealerChoice v-model:model-value="attendee.packages_list" />
  <FieldDues v-model:model-value="attendee.total_dues" />
  <FieldFirstName v-model:model-value="attendee.first_name" />
  <FieldGoodiesLevel v-model:model-value="attendee.packages_list" />
  <FieldLastName v-model:model-value="attendee.last_name" />
  <FieldNationality v-model:model-value="attendee.country" />
  <FieldNickName v-model:model-value="attendee.nickname" />
  <FieldOtherOptions v-model:model-value="attendee.packages_list" />
  <FieldPronouns v-model:model-value="attendee.pronouns" />
  <FieldRegNumber v-model:model-value="attendee.id" />
  <FieldRole
    v-model:model-value="attendee.flags_list"
    v-model:reg-number="attendee.id"
  />
  <FieldRoles
    v-model:model-value="attendee.flags_list"
    v-model:reg-number="attendee.id"
  />
  <FieldSpokenLanguages
    v-model:model-value="attendee.spoken_languages_list"
    v-model:registration-language="attendee.registration_language"
  />
  <FieldSponsorLevel v-model:model-value="attendee.packages_list" />
  <FieldState v-model:model-value="attendee.state" />
  <FieldStatus v-model:model-value="attendee.status" />
  <FieldStreet v-model:model-value="attendee.street" />
  <FieldTShirt v-model:model-value="attendee.tshirt_size" />
  <FieldTShirtShape v-model:model-value="tshirt_shape" />
  <FieldTShirtSize v-model:model-value="tshirt_size" />
  <FieldZip v-model:model-value="attendee.zip" />
</template>

<script setup lang="ts">
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { getApiAttendeeInfo } from "@/tests/getApiAttendeeInfo";
import {
  TShirtShape,
  type TShirtShapeValue,
} from "@/config/metadata/tshirt/metadataForTShirtShapes";
import {
  TShirtSize,
  type TShirtSizeValue,
} from "@/config/metadata/tshirt/metadataForTShirtSizes";

const tshirt_size: Ref<TShirtSizeValue> = ref(TShirtSize.size_m);
const tshirt_shape: Ref<TShirtShapeValue> = ref(TShirtShape.regular);
const attendee: Ref<TransformedAttendeeInfo> = ref(
  getApiAttendeeInfo()[1] as TransformedAttendeeInfo
);
</script>
