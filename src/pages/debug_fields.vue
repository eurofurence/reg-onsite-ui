<template>
  <CustomConfirmDialog
    ref="c123"
    class="w-4/5"
    :shortcutLabel="ShortcutScope.confirm_available_items"
    @onAccept="onAccept"
    @onClose="onReject"
  >
    123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123
    123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123
    123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123 123
    123 123 123
    <template #accept="{ onClick }">
      <Button @click="onClick">Accept</Button>
    </template>
    <template #close="{ onClick }">
      <Button @click="onClick">Reject</Button>
    </template>
  </CustomConfirmDialog>
  <Button @click="onclick">Test</Button>
  <div class="flex">
    <div class="w-1/2">
      <ArtShowPanelChoice v-model:model-value="attendee.packages_list" />
      <ArtShowTableChoice v-model:model-value="attendee.packages_list" />
      <BadgeID v-model:model-value="attendee.badge_id" />
      <Birthday v-model:model-value="attendee.birthday" />
      <BirthdayLocale v-model:model-value="attendee" />
      <City v-model:model-value="attendee.city" />
      <ConbookChoice v-model:model-value="attendee.flags_list" />
      <Country v-model:model-value="attendee.country" />
      <DayAttendance v-model:model-value="attendee.packages_list" />
      <DealerChoice v-model:model-value="attendee.packages_list" />
      <Dues v-model:model-value="attendee.total_dues" />
      <FirstName v-model:model-value="attendee.first_name" />
      <GoodiesLevel v-model:model-value="attendee.packages_list" />
      <LastName v-model:model-value="attendee.last_name" />
      <Nationality v-model:model-value="attendee.country" />
      <NickName v-model:model-value="attendee.nickname" />
      <OtherOptions v-model:model-value="attendee.packages_list" />
      <Pronouns v-model:model-value="attendee.pronouns" />
      <RegNumber v-model:model-value="attendee.id" />
      <Role
        v-model:model-value="attendee.flags_list"
        v-model:reg-number="attendee.id"
      />
      <Roles
        v-model:model-value="attendee.flags_list"
        v-model:reg-number="attendee.id"
      />
      <SpokenLanguages
        v-model:model-value="attendee.spoken_languages_list"
        v-model:registration-language="attendee.registration_language"
      />
      <SponsorLevel v-model:model-value="attendee.packages_list" />
      <State v-model:model-value="attendee.state" />
      <Status v-model:model-value="attendee.status" />
      <Street v-model:model-value="attendee.street" />
      <TShirt v-model:model-value="attendee.tshirt_size" />
      <TShirtShape v-model:model-value="tshirt_shape" />
      <TShirtSizeSelector v-model:model-value="tshirt_size" />
      <Zip v-model:model-value="attendee.zip" />
    </div>
    <div class="w-1/2 columns-2 gap-8 p-4">
      <pre class="text-xs break-words whitespace-pre-wrap">{{
        JSON.stringify(attendee, null, 2)
      }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArtShowPanelChoice from "@/components/common/field/ArtShowPanelChoice.vue";
import ArtShowTableChoice from "@/components/common/field/ArtShowTableChoice.vue";
import BadgeID from "@/components/common/field/BadgeID.vue";
import Birthday from "@/components/common/field/Birthday.vue";
import BirthdayLocale from "@/components/common/field/BirthdayLocale.vue";
import City from "@/components/common/field/City.vue";
import ConbookChoice from "@/components/common/field/ConbookChoice.vue";
import Country from "@/components/common/field/Country.vue";
import DayAttendance from "@/components/common/field/DayAttendance.vue";
import DealerChoice from "@/components/common/field/DealerChoice.vue";
import Dues from "@/components/common/field/Dues.vue";
import FirstName from "@/components/common/field/FirstName.vue";
import GoodiesLevel from "@/components/common/field/GoodiesLevel.vue";
import LastName from "@/components/common/field/LastName.vue";
import Nationality from "@/components/common/field/Nationality.vue";
import NickName from "@/components/common/field/NickName.vue";
import OtherOptions from "@/components/common/field/OtherOptions.vue";
import Pronouns from "@/components/common/field/Pronouns.vue";
import RegNumber from "@/components/common/field/RegNumber.vue";
import Role from "@/components/common/field/Role.vue";
import Roles from "@/components/common/field/Roles.vue";
import SpokenLanguages from "@/components/common/field/SpokenLanguages.vue";
import SponsorLevel from "@/components/common/field/SponsorLevel.vue";
import State from "@/components/common/field/State.vue";
import Status from "@/components/common/field/Status.vue";
import Street from "@/components/common/field/Street.vue";
import TShirt from "@/components/common/field/TShirt.vue";
import TShirtShape from "@/components/common/field/TShirtShape.vue";
import TShirtSizeSelector from "@/components/common/field/TShirtSizeSelector.vue";
import Zip from "@/components/common/field/Zip.vue";
import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import { ShortcutScope } from "@/composables/services/keyboardService";
import { type TShirtShapeValue } from "@/config/metadata/tshirt/metadataForTShirtShapes";
import {
  TShirtSize,
  type TShirtSizeValue,
} from "@/config/metadata/tshirt/metadataForTShirtSizes";
import { getApiAttendeeInfo } from "@/tests/getApiAttendeeInfo";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Button from "@/volt/Button.vue";
import { ref, useTemplateRef, type Ref } from "vue";

const dialog = useTemplateRef<typeof CustomConfirmDialog>("c123");

function onAccept() {
  console.log("ACCEPT");
}
function onReject() {
  console.log("REJECT");
}
function onclick() {
  dialog.value?.showConfirmDialog();
}

const tshirt_size: Ref<TShirtSizeValue> = ref(TShirtSize.size_xl);
const tshirt_shape: Ref<TShirtShapeValue> = ref(TShirtShape.regular);
const attendee: Ref<TransformedAttendeeInfo> = ref(
  getApiAttendeeInfo()[1] as TransformedAttendeeInfo
);
</script>
