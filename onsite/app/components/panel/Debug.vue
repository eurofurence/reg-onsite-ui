<template>
  <div class="pt-1" :class="debugFlag ? 'block' : 'hidden'">
    <div class="flex">
      <div class="p-1">
        Debug Attendee:
        <Select
          v-model="debugApiAttendeeInfo"
          :options="getApiAttendeeInfo()"
          optionLabel="badge_id"
        />
      </div>
      <CustomLabeledToggleSwitch label="Local Mode" v-model="localMode" />
    </div>
    <div class="p-1">
      <Fieldset legend="Debug" :toggleable="true">
        <Textarea
          class="pt-2 w-full h-48"
          :class="{ 'font-family': 'monospace' }"
          :value="JSON.stringify(debugState, null, 2)"
        />
      </Fieldset>
    </div>
  </div>
</template>

<script setup lang="ts">
import { environmentSettings } from "@/composables/services/environmentService";
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
} from "@/composables/services/keyboardService";
import { debugState } from "@/composables/state/debugState";
import { getApiAttendeeInfo } from "@/tests/getApiAttendeeInfo";
import { EnvName } from "@/types/internal/env";
import { ref } from "vue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

const debugFlag: Ref<boolean> = ref(false);
const localMode: Ref<boolean> = ref(false);
const debugApiAttendeeInfo: Ref<TransformedAttendeeInfo> = ref(
  getApiAttendeeInfo()[0] as TransformedAttendeeInfo
);

debugState.debugFlag = debugFlag;
debugState.debugAttendee = debugApiAttendeeInfo;

async function toggleDebug(_event: KeyboardEvent) {
  debugFlag.value = !debugFlag.value;
}

if (environmentSettings.envName === EnvName.dev) {
  keyboardService.registerShortcuts(
    ShortcutScope.debug,
    ShortcutEvent.keyup,
    ShortcutKey.key_q,
    toggleDebug,
    true
  );
}
</script>
