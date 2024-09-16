<template>
  <ConfirmDialog
    :group="dialogGroupNotice"
    :breakpoints="getDialogBreakPoints()"
  />
  <HeaderLinkButton v-if="!props.sessionActive" :href="getLoginUrl()">
    Login
  </HeaderLinkButton>
  <HeaderLinkButton
    v-else
    outlined
    @click="doLogout"
    :severity="isDirty ? Severity.secondary : null"
  >
    Logout {{ props.userName }}
  </HeaderLinkButton>
</template>

<script setup lang="ts">
import { getLoginUrl } from "@/composables/api/getLoginUrl";
import { isDirty } from "@/composables/dirty/isDirty";
import { getDialogBreakPoints } from "@/config/theme";
import type { ConfirmServiceMethods } from "@/types/external";
import { useConfirm } from "primevue/useconfirm";
import { Severity } from "@/types/internal";

const confirm: ConfirmServiceMethods = useConfirm();

function doLogout() {
  // the /logout endpoint should not be used - instead people should get directed at the IDP dashboard for logout
  confirm.require({
    group: dialogGroupNotice,
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
}

interface Props {
  sessionActive: boolean;
  userName: string | null;
}
const props: Props = defineProps<Props>();
const componentId: string = generateId(useId());
const dialogGroupNotice: string = `logoutNoticeDialog${componentId}`;
</script>
