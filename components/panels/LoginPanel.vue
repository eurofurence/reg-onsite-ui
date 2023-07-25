<template>
    <Toolbar class="auth-toolbar">
        <template #start>
            <div class="flex flex-rows align-items-center">
                <img
                    class="header-logo"
                    src="/logo.png"
                    @click="onLogoClick"
                    v-tooltip="{
                        value: versionInfo,
                        showDelay: 2000,
                        hideDelay: 300,
                    }"
                />
                <span class="header-title">{{ title }}</span>
            </div>
        </template>
        <template #end v-if="!isLoading">
            <div id="loginHeader" class="flex" style="font-size: 1px">
                <!-- style is required to override default size -->
                <div style="padding-right: 5px">
                    <Button class="contact-button" icon="pi pi-question-circle" v-tooltip.bottom="'Help'" :disabled="help === ''" @click="showHelp" />
                </div>
                <div style="padding-right: 5px">
                    <a href="https://help.eurofurence.org/legal/imprint">
                        <Button
                            class="contact-button"
                            icon="pi pi-info-circle"
                            v-tooltip.bottom="'Legal information'"
                            :severity="globalState.isDirty ? 'secondary' : null"
                        />
                    </a>
                </div>
                <div style="padding-right: 5px">
                    <ThemeSelectionElement />
                </div>
                <div v-if="!globalState.isLoggedIn">
                    <a :href="getLoginURL()">
                        <Button class="auth-button"> Login </Button>
                    </a>
                </div>
                <div v-else>
                    <Button class="auth-button" @click="doLogout" :severity="globalState.isDirty ? 'secondary' : null">
                        Logout {{ globalState.userName }}
                    </Button>
                </div>
            </div>
        </template>
    </Toolbar>
    <div class="pt-1" v-if="isLoading">
        <ProgressBar mode="indeterminate"></ProgressBar>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import ProgressBar from "primevue/progressbar";

import { version } from "@/buildConfig";
import { configAdminGroups, configDDGroups } from "@/ef.config";

import { globalState } from "@/components/global";
import ThemeSelectionElement from "@/components/element/ThemeSelectionElement";

import { fetchLoginUser } from "@/composables/apiLoginUser";
import { confirmIfDirty } from "@/composables/confirmIfDirty";
import { scheduleRegularTask } from "@/composables/scheduleRegularTask";
import { getLoginURL } from "@/composables/apiLogin";

const toast = useToast();
const confirm = useConfirm();
const versionInfo = `Version: ${version}`;

function showHelp() {
    confirm.require({
        group: "confirm",
        message: props.help,
        header: "Help",
        acceptLabel: "Ok",
        rejectClass: "hidden",
        icon: "pi pi-question-circle",
    });
}

function onLogoClick() {
    emit("on-logo-click");
}

const isLoading = ref(true);

function doLogout() {
    confirmIfDirty(confirm, globalState.isDirty, () => {
        // the /logout endpoint should not be used - instead people should get directed at the IDP dashboard for logout
        confirm.require({
            group: "confirmDeep",
            message:
                "To fully logout from the application, " +
                "you need to enter the EF Identity Provider Dashboard that will open upon confirmation, " +
                "click on your profile picture in the top right corner, " +
                'and select "Logout" there!',
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                window.location.href = "https://identity.eurofurence.org/dashboard";
            },
            reject: () => {},
        });
    });
}

function checkGroupMembership(userGroupIdList, groupIdList) {
    return userGroupIdList.some((group) => groupIdList.includes(group));
}

async function checkUserAccess() {
    isLoading.value = true;
    const data = await fetchLoginUser(globalState, toast);
    if (data != null) {
        globalState.userName = data.name;
        globalState.isAdmin = checkGroupMembership(data.groups, configAdminGroups);
        globalState.isDDWorker = checkGroupMembership(data.groups, configDDGroups);
        globalState.isLoggedIn = true;
        toast.add({
            group: "global",
            severity: "success",
            summary: "Logged in as: " + data.name,
            life: 2000,
        });
    }
    isLoading.value = false;
}

async function checkUserAccessSilent() {
    if (globalState.isLoggedIn) {
        await fetchLoginUser(globalState, toast);
    }
}

checkUserAccess();
scheduleRegularTask(checkUserAccessSilent, 1000 * 20, 1000 * 10);
const emit = defineEmits(["on-logo-click"]);
const props = defineProps({
    title: { required: true },
    help: { default: "" },
});

import { debugState } from "@/components/debug";
debugState["LoginHeader"] = { isLoading: isLoading };
</script>

<style>
.header-logo {
    padding-right: calc(var(--header-size) * 10px);
    height: calc(var(--header-size) * 50px);
}

.header-title {
    font-size: calc(var(--header-size) * 30px);
    font-weight: bold;
}

.contact-button {
    width: calc(var(--header-size) * 50px);
    height: calc(var(--header-size) * 50px);
    padding-left: 5px;
    padding-right: 5px;
}

.contact-button > .pi {
    font-size: calc(var(--header-size) * 20px);
}

.contact-button.p-button.p-button-icon-only {
    width: calc(var(--header-size) * 50px);
    height: calc(var(--header-size) * 50px);
    font-size: calc(var(--header-size) * 50px);
    padding: 5px 0;
}

.auth-button {
    height: calc(var(--header-size) * 50px);
    font-size: calc(var(--header-size) * 20px);
    padding-left: calc(var(--header-size) * 20px);
    padding-right: calc(var(--header-size) * 20px);
    padding-top: calc(var(--header-size) * 5px);
    padding-bottom: calc(var(--header-size) * 5px);
}

.auth-button > .p-button {
    height: calc(var(--header-size) * 50px);
    font-size: calc(var(--header-size) * 20px);
    padding-left: calc(var(--header-size) * 20px);
    padding-right: calc(var(--header-size) * 20px);
    padding-top: calc(var(--header-size) * 5px);
    padding-bottom: calc(var(--header-size) * 5px);
}

.auth-toolbar {
    padding: 5px;
}
</style>
