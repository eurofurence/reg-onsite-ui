<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <OnsitePageBase
        title="Sponsor Desk"
        help="Available hotkeys: 'Escape': Reset reg number input field, 'Enter': Search for reg number, 'A': Select all, 'S': Save"
    >
        <Splitter>
            <SplitterPanel :size="25">
                <div :id="searchRegNumber"></div>
                <CustomFieldsetElement icon="pi-search" label="User Selection">
                    <InputWithKeyPadElement
                        v-model="searchRegNumber"
                        @numberSubmit="startSearchRegNumber"
                        :maxNumber="maxRegNumber"
                        :severityOK="searchRegNumber != null && globalState.isDirty ? 'secondary' : null"
                    />
                </CustomFieldsetElement>
            </SplitterPanel>
            <SplitterPanel :size="75">
                <CustomFieldsetElement icon="pi-user" label="User Details">
                    <div class="flex flex-column gap-3 pt-3" v-if="attendeeInfoApiDict">
                        <Panel
                            header="Personal Information"
                            :pt="{
                                header: useLanyardStyle(sponsorValue, rolesList),
                            }"
                        >
                            <div class="flex flex-row flex-wrap gap-3">
                                <FieldBadgeID v-model="attendeeInfoApiDict.badge_id" disabled />
                                <FieldNickName v-model="attendeeInfoApiDict.nickname" disabled />
                                <FieldPronouns v-model="attendeeInfoApiDict.pronouns" disabled />
                                <FieldSpokenLanguages v-model="attendeeInfoApiDict.spoken_languages" disabled />
                                <FieldSponsorLevel v-model="sponsorValue" disabled />
                                <div v-if="rolesList.length">
                                    <FieldRole v-model="rolesList" disabled />
                                </div>
                            </div>
                        </Panel>
                        <Panel header="Issued Items">
                            <template #icons>
                                <SelectAvailableElement
                                    v-model="attendeeTrinketsInfo.ownedTrinketList"
                                    :owedAndOwnedTrinketItemList="attendeeTrinketsInfo.owedAndOwnedTrinketItemList"
                                />
                                <Button
                                    class="ml-1 w-6rem"
                                    label="Save"
                                    @click="saveItems"
                                    :loading="savingTrinketsFlag"
                                    :disabled="!isDirtyAttendeeTrinketsApiDict"
                                />
                            </template>
                            <FieldItems
                                id="issuedItems"
                                v-model="attendeeTrinketsInfo.ownedTrinketList"
                                :tshirtValue="attendeeInfoApiDict.tshirt_size"
                                :owedAndOwnedTrinketItemList="attendeeTrinketsInfo.owedAndOwnedTrinketItemList"
                            />
                        </Panel>
                    </div>
                    <IdSearchSpinnerElement :modelValue="searchingRegNumber" :errorMessage="searchErrorMessage" v-else />
                </CustomFieldsetElement>
            </SplitterPanel>
        </Splitter>
    </OnsitePageBase>
</template>

<script setup>
import { ref, reactive, watch } from "vue";

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

import Panel from "primevue/panel";
import Button from "primevue/button";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";

import { globalState } from "@/components/global";

import OnsitePageBase from "@/components/OnsitePageBase.vue";

import { defaultItemsInfo } from "@/composables/apiAttendeeItems";
import { useLanyardStyle } from "@/composables/useLanyardStyle";
import { setupKeyEvents } from "@/composables/setupKeyEvents";
import { getSingleAttendee } from "@/composables/apiAttendeeSearch";
import { getAttendeeItems, postAttendeeItems } from "@/composables/apiAttendeeItems";
import { useAttendeeTrinketsInfo } from "@/composables/useAttendeeTrinketsInfo";
import { confirmIfDirty } from "@/composables/confirmIfDirty";
import { createTrackedVariable } from "@/composables/createTrackedVariable";
import { useSponsor } from "@/composables/fields/useSponsor";
import { useRoles } from "@/composables/fields/useRoles";

import IdSearchSpinnerElement from "@/components/element/IdSearchSpinnerElement.vue";
import CustomFieldsetElement from "@/components/element/CustomFieldsetElement.vue";
import InputWithKeyPadElement from "@/components/element/InputWithKeyPadElement.vue";
import SelectAvailableElement from "@/components/element/SelectAvailableElement.vue";

import FieldBadgeID from "@/components/fields/FieldBadgeID.vue";
import FieldNickName from "@/components/fields/FieldNickName.vue";
import FieldPronouns from "@/components/fields/FieldPronouns.vue";
import FieldSpokenLanguages from "@/components/fields/FieldSpokenLanguages.vue";
import FieldSponsorLevel from "@/components/fields/FieldSponsorLevel.vue";
import FieldRole from "@/components/fields/FieldRole.vue";
import FieldItems from "@/components/fields/FieldItems.vue";

const confirm = useConfirm();
const toast = useToast();
// eslint-disable-next-line no-undef
const route = useRoute();
const maxRegNumber = 99999;

function setState(infoApiDict, trinketsApiDict) {
    attendeeInfoApiDict.value = infoApiDict;
    attendeeTrinketsApiDict.value = trinketsApiDict;
    isDirtyAttendeeTrinketsApiDict.value = false;
}

// Wipe local data in case of a logout
watch(
    () => globalState.isLoggedIn,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (newState, oldState) => {
        if (newState) {
            if (route.hash && globalState.isLoggedIn) {
                searchAttendee(parseInt(route.hash.slice(1)));
            }
        } else {
            setState(null, defaultItemsInfo);
        }
    },
);

const attendeeInfoApiDict = ref(null);
const attendeeTrinketsApiDict = ref(defaultItemsInfo);

const sponsorValue = useSponsor(attendeeInfoApiDict);
const rolesList = useRoles(attendeeInfoApiDict);

const attendeeTrinketsInfo = useAttendeeTrinketsInfo(attendeeTrinketsApiDict, attendeeInfoApiDict);
const isDirtyAttendeeTrinketsApiDict = createTrackedVariable(attendeeTrinketsApiDict);
globalState.dirtyTracker.isDirtyAttendeeIssuedInfo = isDirtyAttendeeTrinketsApiDict;

//////////////////////////////////////////////////////
// Attendee Search
//////////////////////////////////////////////////////

const searchRegNumber = ref(null);
const searchingRegNumber = ref(null);
const searchErrorMessage = ref("");

async function startSearchRegNumber(regNumber) {
    if (regNumber == null) {
        return;
    }
    confirmIfDirty(confirm, globalState.isDirty, () => searchAttendee(regNumber));
}

async function searchAttendee(regNumber) {
    if (isNaN(regNumber) || regNumber < 0 || regNumber > maxRegNumber) {
        // eslint-disable-next-line no-undef
        await navigateTo(route.path);
        return;
    }
    searchRegNumber.value = null;
    searchingRegNumber.value = regNumber;
    searchErrorMessage.value = "";
    setState(null, defaultItemsInfo);
    // eslint-disable-next-line no-undef
    await navigateTo({ path: route.path, hash: `#${regNumber}` });
    const promiseAttendeeInfo = getSingleAttendee(globalState, toast, regNumber);
    const promiseAttendeeIssuedInfo = getAttendeeItems(globalState, toast, regNumber);
    const attendeeInfoApiDictNew = await promiseAttendeeInfo;
    if (attendeeInfoApiDictNew !== null) {
        setState(attendeeInfoApiDictNew, await promiseAttendeeIssuedInfo);
    } else {
        searchErrorMessage.value = `Registration number ${regNumber} doesn't exist or isn't properly checked in!`;
    }
    searchingRegNumber.value = null;
}

//////////////////////////////////////////////////////
// Items - Saving
//////////////////////////////////////////////////////

const savingTrinketsFlag = ref(false);

async function saveItems() {
    if (!isDirtyAttendeeTrinketsApiDict.value) {
        toast.add({
            group: "global",
            severity: "info",
            summary: "Items have not changed",
            life: 500,
        });
        return;
    }
    savingTrinketsFlag.value = true;
    if (await postAttendeeItems(globalState, toast, attendeeInfoApiDict.value.id, attendeeTrinketsApiDict.value)) {
        isDirtyAttendeeTrinketsApiDict.value = false;
        toast.add({
            group: "global",
            severity: "info",
            summary: "Stored issued items",
            life: 500,
        });
    }
    savingTrinketsFlag.value = false;
}

setupKeyEvents("keydown", (key) => key === "s", saveItems);

//////////////////////////////////////////////////////
// Debugging
//////////////////////////////////////////////////////

import { debugState } from "@/components/debug";
debugState["SponsorDesk"] = reactive({
    search: {
        searchingRegNumber: searchingRegNumber,
        searchRegNumber: searchRegNumber,
        searchErrorMessage: searchErrorMessage,
    },
    state: {
        attendeeInfo: attendeeInfoApiDict,
        //attendeeTrinketsInfo: attendeeTrinketsInfo,
    },
});
</script>

<style>
.p-splitter {
    border: none;
}

#issuedItems .ef-field-label {
    display: none;
}

#issuedItems .checkbox-label {
    font-size: 1.5rem;
}

#issuedItems .p-checkbox {
    height: 4rem;
    width: 4rem;
}

#issuedItems .p-checkbox .p-checkbox-box {
    height: 4rem;
    width: 4rem;
}

#issuedItems .p-checkbox .p-checkbox-box .p-checkbox-icon.p-icon {
    height: 3rem;
    width: 3rem;
}
</style>
