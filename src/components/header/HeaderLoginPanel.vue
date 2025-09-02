<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <Toolbar class="p-[2px]">
    <template #start>
      <HeaderLogo :title="props.title" />
    </template>
    <template #center v-if="isConnecting">
      <div class="flex flex-col flex-grow items-center">
        <div>
          <ProgressBar class="w-50" mode="indeterminate" />
        </div>
        <div>Connecting...</div>
      </div>
    </template>
    <template #end v-if="!isConnecting">
      <div class="flex header-text">
        <!-- style is required to override default size -->
        <div v-if="$slots.help" class="flex pr-[2px]">
          <HeaderHelpButton>
            <slot name="help"></slot>
          </HeaderHelpButton>
        </div>
        <div class="flex pr-[2px]">
          <HeaderLinkButton
            :href="getConventionSetup().links.privacyLink"
            outlined
            class="aspect-square"
            v-tooltip.bottom="'Privacy information'"
          >
            <i class="pi pi-eye-slash" />
          </HeaderLinkButton>
        </div>
        <div class="flex pr-[2px]">
          <HeaderLinkButton
            :href="getConventionSetup().links.imprintLink"
            outlined
            class="aspect-square"
            v-tooltip.bottom="'Legal information'"
          >
            <i class="pi pi-info-circle" />
          </HeaderLinkButton>
        </div>
        <div v-if="props.theming" class="flex pr-[2px]">
          <HeaderThemeSelection />
        </div>
        <HeaderLoginButton
          v-model:sessionActive="authState.sessionActive"
          v-model:userName="authState.userName"
        />
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import HeaderHelpButton from "@/components/header/HeaderHelpButton.vue";
import HeaderLinkButton from "@/components/header/HeaderLinkButton.vue";
import HeaderLoginButton from "@/components/header/HeaderLoginButton.vue";
import HeaderLogo from "@/components/header/HeaderLogo.vue";
import HeaderThemeSelection from "@/components/header/HeaderThemeSelection.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { scheduleRegularTask } from "@/composables/events/scheduleRegularTask";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { attendeeService } from "@/composables/services/attendeeService";
import { authService } from "@/composables/services/authService";
import { OnsiteToastService } from "@/composables/services/toastService";
import { authState } from "@/composables/state/authState";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiFrontendUserInfo } from "@/types/external/authsrv/frontenduserinfo";
import type { DurationInMS } from "@/types/internal/common";
import { ToastSeverity } from "@/types/internal/primevue";
import ProgressBar from "@/volt/ProgressBar.vue";
import Toast from "@/volt/Toast.vue";
import Toolbar from "@/volt/Toolbar.vue";
import { onMounted, ref, type Ref, useId } from "vue";

const isConnecting: Ref<boolean> = ref(true);

async function checkUserAccess(): Promise<void> {
  isConnecting.value = true;
  const data: ApiFrontendUserInfo | undefined =
    await authService.getFrontendUserInfo(
      getErrorHandlerFunction(toastService)
    );

  const userRegNumList: RegNumber[] =
    (await attendeeService.getOwnRegs(getErrorHandlerFunction(toastService))) ||
    [];
  let userRegNumStr: string = userRegNumList.map((n) => `#${n}`).join(", ");
  if (userRegNumStr.length > 0) {
    userRegNumStr = `(${userRegNumStr})`;
  }
  if (data !== undefined) {
    authState.value.userName = data.name;
    authState.value.userGroups = data.groups;
    authState.value.userRegNumList = userRegNumList;
    authState.value.sessionActive = true;
    toastService.add({
      severity: ToastSeverity.success,
      summary: `Logged in as: ${data.name} ${userRegNumStr}`,
      life: 2000,
    });
  }
  isConnecting.value = false;
}

async function checkUserAccessSilent(): Promise<void> {
  if (authState.value.sessionActive) {
    await authService.getFrontendUserInfo(
      getErrorHandlerFunction(toastService)
    );
  }
}

interface Props {
  theming: boolean;
  title: string;
}
const props: Props = defineProps<Props>();
const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

onMounted(async () => {
  await checkUserAccess();
});
scheduleRegularTask(
  checkUserAccessSilent,
  (1000 * 600) as DurationInMS,
  (1000 * 10) as DurationInMS
);
</script>

<style lang="css">
.header-text {
  font-size: calc(var(--header-size) * 16px);
}
</style>
