<template>
  <span
    class="route-target"
    :id="getRegNumberFromRoute()?.toString() || componentId"
  ></span>
  <GroupPanel icon="pi-search" label="User Selection">
    <InputFieldWithKeyPad
      v-model="inputRegNumber"
      @numberSubmit="onSearchRegNumber"
      :shortcutScopes="props.shortcutScopes"
      :maxNumber="getConventionSetup().maxRegNumber"
      :severitySubmitButton="
        inputRegNumber !== null && isDirty ? ButtonSeverity.secondary : null
      "
    />
  </GroupPanel>
</template>

<script setup lang="ts">
import GroupPanel from "@/components/common/GroupPanel.vue";
import InputFieldWithKeyPad from "@/components/common/input/InputFieldWithKeyPad.vue";
import { confirmIfDirty } from "@/composables/dirty/confirmIfDirty";
import { isDirty } from "@/composables/dirty/isDirty";
import { setupEventListener } from "@/composables/events/setupEventListener";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getRegNumberFromRoute } from "@/composables/route/getRegNumberFromRoute";
import { setRegNumberRoute } from "@/composables/route/setRegNumberRoute";
import { authService } from "@/composables/services/authService";
import type { ShortcutScope } from "@/composables/services/keyboardService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { ButtonSeverity } from "@/types/internal/primevue";
import { onMounted, ref, useId, type Ref } from "vue";

const inputRegNumber: Ref<RegNumber | null> = ref<RegNumber | null>(null);

setupEventListener(window, "hashchange", ensureValidRoute);

async function ensureValidRoute(): Promise<void> {
  const regNumber: RegNumber | null = getRegNumberFromRoute();
  setRegNumberRoute(regNumber);
  emit("onSearchRegNumber", regNumber);
}

onMounted(ensureValidRoute);
authService.onLogin(ensureValidRoute);

async function onSearchRegNumber(): Promise<void> {
  const regNumberFromRoute: RegNumber | null = getRegNumberFromRoute();
  if (regNumberFromRoute !== inputRegNumber.value) {
    const regNumber: RegNumber | null = inputRegNumber.value;
    await confirmIfDirty(() => {
      setRegNumberRoute(regNumber);
      emit("onSearchRegNumber", regNumber);
    });
  }
}

interface Props {
  shortcutScopes: ShortcutScope[];
}
const props: Props = defineProps<Props>();
const emit: CallableFunction = defineEmits(["onSearchRegNumber"]);
const componentId: string = generateId(useId());

</script>
