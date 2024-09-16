<template>
  <ConfirmDialog :group="dialogGroup" :breakpoints="getDialogBreakPoints()" />
  <div
    class="route-target"
    :id="getRegNumberFromRoute()?.toString() || componentId"
  ></div>
  <LayoutGroupPanel icon="pi-search" label="User Selection">
    <InputFieldWithKeyPad
      v-model="inputRegNumber"
      @numberSubmit="onSearchRegNumber"
      :maxNumber="setupRegNum.maxRegNumber"
      :severityOK="
        inputRegNumber !== null && isDirty ? Severity.secondary : null
      "
    />
  </LayoutGroupPanel>
</template>

<script setup lang="ts">
import { confirmIfDirty } from "@/composables/dirty/confirmIfDirty";
import { isDirty } from "@/composables/dirty/isDirty";
import { getRegNumberFromRoute } from "@/composables/route/getRegNumberFromRoute";
import { authService } from "@/composables/services/authService";
import { setupRegNum } from "@/config/setupReg";
import { getDialogBreakPoints } from "@/config/theme";
import type { ConfirmServiceMethods } from "@/types/external";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { Severity } from "@/types/internal";

const confirm: ConfirmServiceMethods = useConfirm();
const route: RouteLocationNormalizedLoaded = useRoute();

const inputRegNumber: Ref<number | null> = ref<number | null>(null);

watch(
  () => route.hash,
  async (_new_value, _old_value) => {
    const regNumber: number | null = getRegNumberFromRoute();
    emit("onSearchRegNumber", regNumber);
  }
);

async function setRegNumberRoute(regNumber: number | null): Promise<void> {
  if (regNumber === null) {
    await navigateTo(route.path);
  } else {
    await navigateTo({ path: route.path, hash: `#${regNumber}` });
  }
}

async function ensureValidRoute(): Promise<void> {
  const regNumber: number | null = getRegNumberFromRoute();
  await setRegNumberRoute(regNumber);
  emit("onSearchRegNumber", regNumber);
}

onMounted(ensureValidRoute);
authService.onLogin(ensureValidRoute);

async function onSearchRegNumber(): Promise<void> {
  const regNumberFromRoute: number | null = getRegNumberFromRoute();
  if (regNumberFromRoute !== inputRegNumber.value) {
    const regNumber: number | null = inputRegNumber.value;
    confirmIfDirty(confirm, dialogGroup, async () => {
      await setRegNumberRoute(regNumber);
    });
  }
}

const emit: CallableFunction = defineEmits(["onSearchRegNumber"]);
const componentId: string = generateId(useId());
const dialogGroup: string = `checkSearchDialog${componentId}`;
</script>
