<template>
    <div class="flex flex-column gap-1">
        <Panel header="General Information" :pt="{ header: useLanyardStyle(sponsorValue, rolesList) }">
            <div class="flex flex-row flex-wrap gap-1">
                <FieldBadgeID v-model="modelValue.badge_id" disabled />
                <FieldNickName v-model="modelValue.nickname" disabled />
                <FieldPronouns v-model="modelValue.pronouns" disabled />
                <FieldConbook v-model="conbookValue" disabled />
                <FieldSponsorLevel v-model="sponsorValue" :sponsorItems="configRegdeskSponsorItems" disabled />
                <div v-if="attendanceList.length > 0">
                    <FieldAttendance v-model="attendanceList" disabled />
                </div>
                <div v-if="rolesList.length > 0">
                    <FieldRole v-model="rolesList" disabled />
                </div>
            </div>
        </Panel>
        <Panel header="Check-In Information" :pt="{ header: useStatusStyle(modelValue.status) }">
            <template #icons>
                <div class="p-inputgroup flex-1">
                    <Button
                        v-tooltip="'Checkin attendee'"
                        label="Checkin"
                        @click="$emit('checkin', modelValue.id)"
                        :disabled="!canCheckin(modelValue)"
                    />
                    <!--
                    <Button
                        v-tooltip="'Try checkin attendee'"
                        icon="pi pi-exclamation-circle"
                        @click="$emit('checkin', modelValue.id)"
                        v-if="!canCheckin(modelValue) && (modelValue.status !== 'checked in')"
                    />
-->
                    <Button
                        v-tooltip="'Refresh data'"
                        icon="pi pi-refresh"
                        @click="getCurrentAttendee(modelValue.id, true)"
                        :disabled="searchingRegNumber !== null"
                    />
                </div>
            </template>
            <div class="flex flex-row flex-wrap gap-1">
                <FieldStatus v-model="modelValue.status" disabled />
                <FieldFirstName v-model="modelValue.first_name" disabled />
                <FieldLastName v-model="modelValue.last_name" disabled />
                <FieldBirthday v-model="modelValue.birthday" disabled />
                <FieldNationality v-model="modelValue.country" disabled />
                <FieldDues v-model="modelValue.current_dues" disabled />
            </div>
        </Panel>
    </div>
    <div v-if="searchingRegNumber || searchErrorMessage">
        <IdSearchSpinnerElement :modelValue="searchingRegNumber" :errorMessage="searchErrorMessage" />
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useToast } from "primevue/usetoast";

import { globalState } from "@/components/global";
import { configRegdeskSponsorItems } from "@/ef.config";

import { getSingleAttendee } from "@/composables/apiAttendeeSearch";
import { useLanyardStyle } from "@/composables/useLanyardStyle";
import { useStatusStyle } from "@/composables/fields/useStatus";
import { useSponsor } from "@/composables/fields/useSponsor";
import { useConbook } from "@/composables/fields/useConbook";
import { useRoles } from "@/composables/fields/useRoles";
import { useDayAttendance } from "@/composables/fields/useDayAttendance";
import { canCheckin } from "@/composables/canCheckin";

import Panel from "primevue/panel";
import Button from "primevue/button";

import FieldAttendance from "@/components/fields/FieldAttendance.vue";
import FieldBadgeID from "@/components/fields/FieldBadgeID.vue";
import FieldBirthday from "@/components/fields/FieldBirthday.vue";
import FieldConbook from "@/components/fields/FieldConbook.vue";
import FieldDues from "@/components/fields/FieldDues.vue";
import FieldFirstName from "@/components/fields/FieldFirstName.vue";
import FieldLastName from "@/components/fields/FieldLastName.vue";
import FieldNationality from "@/components/fields/FieldNationality.vue";
import FieldNickName from "@/components/fields/FieldNickName.vue";
import FieldPronouns from "@/components/fields/FieldPronouns.vue";
import FieldSponsorLevel from "@/components/fields/FieldSponsorLevel.vue";
import FieldStatus from "@/components/fields/FieldStatus.vue";
import FieldRole from "@/components/fields/FieldRole.vue";

import IdSearchSpinnerElement from "@/components/element/IdSearchSpinnerElement.vue";

const toast = useToast();
const searchingRegNumber = ref(null);
const searchErrorMessage = ref(null);

async function getCurrentAttendee(regId, force = false) {
    if (refreshData.value === false && !force) {
        return;
    }
    searchErrorMessage.value = null;
    if (isNaN(regId)) {
        searchErrorMessage.value = `Invalid registration Id ${regId}`;
    }
    searchingRegNumber.value = regId;
    try {
        const result = await getSingleAttendee(globalState, toast, regId);
        if (result !== null) {
            // Update selected attendee information
            for (const [key, value] of Object.entries(result)) {
                if (key != "id") {
                    modelValue.value[key] = value;
                }
            }
        }
    } catch (error) {
        searchErrorMessage.value = error;
    }
    searchingRegNumber.value = null;
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
// eslint-disable-next-line no-undef
const refreshData = defineModel("refreshData");

const sponsorValue = useSponsor(modelValue);
const conbookValue = useConbook(modelValue);
const rolesList = useRoles(modelValue);
const attendanceList = useDayAttendance(modelValue);

watch(
    () => modelValue.value?.id,
    async () => {
        getCurrentAttendee(modelValue.value?.id);
    },
    { immediate: true },
);

defineEmits(["checkin"]);
</script>
