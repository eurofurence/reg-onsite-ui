<template>
    <Toast position="bottom-right" group="global" />
    <ConfirmDialog group="confirm" :breakpoints="getDialogBreakPoints()" />
    <ConfirmDialog group="confirmDeep" :breakpoints="getDialogBreakPoints()" />
    <LoginPanel :title="title" :help="help" />
    <div class="pt-1" v-if="globalState.isLoggedIn">
        <slot></slot>
    </div>
    <DebugPanel />
</template>

<script setup lang="ts">
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";

import { globalState } from "@/components/global";
import LoginPanel from "@/components/panels/LoginPanel.vue";
import DebugPanel from "@/components/panels/DebugPanel.vue";

function getDialogBreakPoints() {
    return {
        "2000px": "50vw",
        "700px": "75vw",
        "500px": "100vw",
    };
}

defineProps(["title", "help"]);
</script>
