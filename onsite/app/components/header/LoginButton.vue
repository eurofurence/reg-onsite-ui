<template>
  <ConfirmDialog
    :group="confirmService.confirmGroup"
    :breakpoints="getDialogBreakPoints()"
  />
  <HeaderLinkButton v-if="!props.sessionActive" :href="getLoginUrl()">
    Login
  </HeaderLinkButton>
  <HeaderLinkButton
    v-else
    outlined
    @click="doLogout"
    :severity="isDirty ? ButtonSeverity.secondary : null"
  >
    Logout {{ props.userName }}
  </HeaderLinkButton>
</template>

<script setup lang="ts">
import { getLoginUrl } from "@/composables/api/authsrv/getLoginUrl";
import { isDirty } from "@/composables/dirty/isDirty";
import { getDialogBreakPoints } from "@/config/theme/common";
import { ButtonSeverity } from "@/types/internal/primevue";
import { ShortcutScope } from "@/composables/services/keyboardService";
import { OnsiteConfirmService } from "@/composables/services/confirmService";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

function doLogout() {
  // the /logout endpoint should not be used - instead people should get directed at the IDP dashboard for logout
  confirmService.require(ShortcutScope.confirm_logout, {
    message:
      "To fully logout from the application, " +
      "you need to enter the Identity Provider Dashboard that will open upon confirmation, " +
      "click on your profile picture in the top right corner, " +
      'and select "Logout" there!',
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      window.location.href =
        getConventionSetup().links.idpDashboardLink.toString();
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
const confirmService: OnsiteConfirmService = new OnsiteConfirmService(
  componentId
);
</script>
