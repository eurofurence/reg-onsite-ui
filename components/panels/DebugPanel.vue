<template>
    <div class="pt-1" :class="debugFlag ? 'block' : 'hidden'">
        <div v-if="debugState.SponsorDesk?.state?.attendeeInfo">
            <FieldRegNumber v-model="debugState.SponsorDesk.state.attendeeInfo.id" />
            <FieldNickName v-model="debugState.SponsorDesk.state.attendeeInfo.nickname" />
            <FieldPronouns v-model="debugState.SponsorDesk.state.attendeeInfo.pronouns" />
            <FieldSpokenLanguages v-model="debugState.SponsorDesk.state.attendeeInfo.spokenLanguageValueList" />
            <FieldSponsorLevel v-model="debugState.SponsorDesk.state.attendeeInfo.sponsorLevelValue" />
            <FieldRole v-model="debugState.SponsorDesk.state.attendeeInfo.roleValueList" />
            <FieldTShirt v-model="debugState.SponsorDesk.state.attendeeInfo.tshirtSize" />
            <FieldOtherOptions v-model="debugState.SponsorDesk.state.attendeeInfo.packageValueList" />
            <FieldConbook v-model="debugState.SponsorDesk.state.attendeeInfo.conbookValue" />
            <FieldDealerChoice v-model="debugState.SponsorDesk.state.attendeeInfo.dealerValue" />
        </div>
        <Fieldset legend="Debug" :toggleable="true">
            <Textarea class="pt-2 w-full h-12rem" :class="{ 'font-family': 'monospace' }" :value="JSON.stringify(debugState, null, 2)" />
        </Fieldset>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { debugState } from "@/components/debug";
import { globalState } from "@/components/global";
import { setupKeyEvents } from "@/composables/setupKeyEvents";

import Fieldset from "primevue/fieldset";
import Textarea from "primevue/textarea";
import InputSwitch from "primevue/inputswitch";

import FieldBadgeID from "@/components/fields/FieldBadgeID.vue";
import FieldBirthday from "@/components/fields/FieldBirthday.vue";
import FieldConbook from "@/components/fields/FieldConbook.vue";
import FieldDealerChoice from "@/components/fields/FieldDealerChoice.vue";
import FieldDues from "@/components/fields/FieldDues.vue";
import FieldFirstName from "@/components/fields/FieldFirstName.vue";
import FieldItems from "@/components/fields/FieldItems.vue";
import FieldLastName from "@/components/fields/FieldLastName.vue";
import FieldNationality from "@/components/fields/FieldNationality.vue";
import FieldNickName from "@/components/fields/FieldNickName.vue";
import FieldOtherOptions from "@/components/fields/FieldOtherOptions.vue";
import FieldPronouns from "@/components/fields/FieldPronouns.vue";
import FieldRegNumber from "@/components/fields/FieldRegNumber.vue";
import FieldRole from "@/components/fields/FieldRole.vue";
import FieldSpokenLanguages from "@/components/fields/FieldSpokenLanguages.vue";
import FieldSponsorLevel from "@/components/fields/FieldSponsorLevel.vue";
import FieldStatus from "@/components/fields/FieldStatus.vue";
import FieldTShirt from "@/components/fields/FieldTShirt.vue";

const debugFlag = ref(false);

debugState.debugFlag = debugFlag;

function toggleDebug() {
    debugFlag.value = !debugFlag.value;
}

// eslint-disable-next-line no-undef
const config = useRuntimeConfig();
if (config.public.DEPLOY_ENV === "dev") {
    setupKeyEvents("keyup", (key) => key === "q", toggleDebug, true);
}
</script>
