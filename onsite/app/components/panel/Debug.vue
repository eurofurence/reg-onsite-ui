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

const debugFlag = ref(false);
const debugApiAttendeeInfo = ref(getApiAttendeeInfo()[0]);

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
