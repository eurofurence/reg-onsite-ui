<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <Toolbar class="auth-toolbar">
    <template #start>
      <HeaderLogo :title="props.title" />
    </template>
    <template #end v-if="!isLoading">
      <div class="flex" style="font-size: 1px">
        <!-- style is required to override default size -->
        <div v-if="$slots.help" style="padding-right: 5px">
          <HeaderHelpButton>
            <slot name="help"></slot>
          </HeaderHelpButton>
        </div>
        <div style="padding-right: 5px">
          <HeaderLinkButton
            :href="conventionSetup.privacyLink"
            outlined
            class="contact-button"
            icon="pi pi-eye-slash"
            v-tooltip.bottom="'Privacy information'"
          />
        </div>
        <div style="padding-right: 5px">
          <HeaderLinkButton
            :href="conventionSetup.imprintLink"
            outlined
            class="contact-button"
            icon="pi pi-info-circle"
            v-tooltip.bottom="'Legal information'"
          />
        </div>
        <div v-if="props.theming" style="padding-right: 5px">
          <HeaderThemeSelection />
        </div>
        <HeaderLoginButton
          v-model:sessionActive="authState.sessionActive"
          v-model:userName="authState.userName"
        />
      </div>
    </template>
  </Toolbar>
  <div class="pt-1" v-if="isLoading">
    <ProgressBar mode="indeterminate"></ProgressBar>
  </div>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { scheduleRegularTask } from "@/composables/events/scheduleRegularTask";
import { authService } from "@/composables/services/authService";
import { authState } from "@/composables/state/authState";
import type { ApiFrontendUserInfo } from "@/types/external/authsrv/frontenduserinfo";
import { ToastSeverity } from "@/types/internal/primevue";
import { OnsiteToastService } from "@/composables/services/toastService";
import { conventionSetup } from "@/config/convention";

const isLoading: Ref<boolean> = ref(true);

async function checkUserAccess(): Promise<void> {
  isLoading.value = true;
  const data: ApiFrontendUserInfo | undefined =
    await authService.getFrontendUserInfo(
      getErrorHandlerFunction(toastService)
    );
  if (data !== undefined) {
    authState.value.userName = data.name;
    authState.value.userGroups = data.groups;
    authState.value.sessionActive = true;
    toastService.add({
      severity: ToastSeverity.success,
      summary: "Logged in as: " + data.name,
      life: 2000,
    });
  }
  isLoading.value = false;
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
scheduleRegularTask(checkUserAccessSilent, 1000 * 120, 1000 * 10);
</script>

<style>
.auth-toolbar {
  padding: 5px;
}
</style>
