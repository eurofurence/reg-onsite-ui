<template>
  <CustomConfirmDialog
    :ref="`confirmDialog${componentId}`"
    :shortcut-label="ShortcutScope.confirm_logout"
    class="w-4/5"
    @onAccept="openLogoutScreen"
  >
    <template #header>
      <CustomConfirmDialogHeader>Confirmation</CustomConfirmDialogHeader>
    </template>
    <div class="flex flex-col">
      To fully logout from the application, you need to enter the Identity
      Provider Dashboard that will open upon confirmation, click on your profile
      picture in the top right corner, and select "Logout" there!
    </div>
    <template #accept="{ onClick }">
      <Button @click="onClick">Ok</Button>
    </template>
    <template #close="{ onClick }">
      <Button @click="onClick">Abort</Button>
    </template>
  </CustomConfirmDialog>
  <HeaderLinkButton v-if="!props.sessionActive" :href="getLoginUrl()">
    <span class="px-2">Login</span>
  </HeaderLinkButton>
  <HeaderLinkButton
    v-else
    outlined
    @click="dialog?.showConfirmDialog"
    :severity="isDirty ? ButtonSeverity.secondary : null"
  >
    Logout {{ props.userName }}
  </HeaderLinkButton>
</template>

<script setup lang="ts">
import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import CustomConfirmDialogHeader from "@/components/dialog/CustomConfirmDialogHeader.vue";
import HeaderLinkButton from "@/components/header/HeaderLinkButton.vue";
import { getLoginUrl } from "@/composables/api/authsrv/getLoginUrl";
import { isDirty } from "@/composables/dirty/isDirty";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { ShortcutScope } from "@/composables/services/keyboardService";
import { ButtonSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import { useId, useTemplateRef } from "vue";

function openLogoutScreen() {
  window.location.href = getConventionSetup().links.idpDashboardLink.toString();
}

interface Props {
  sessionActive: boolean;
  userName: string | null;
}
const props: Props = defineProps<Props>();
const componentId: string = generateId(useId());
const dialog = useTemplateRef<typeof CustomConfirmDialog>(
  `confirmDialog${componentId}`
);
</script>
