<template>
  <Toast :group="componentId" position="bottom-right" />
  <div v-if="debugModeRef">
    {{ displayOptionsRef }}<br /><br />
    {{ dataOptionsRef }}<br /><br />
    <div class="flex gap-1">
      <div class="flex gap-1">
        <Button label="Debug:DisplayAllColumns" @click="displayAllColumns" />
        <Button label="Debug:LoadAll" @click="debugLoadAll" />
        <Button label="Debug:LoadDummy" @click="debugLoadDummy" />
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex gap-1">
          <Checkbox v-model="sandboxModeRef" :binary="true" />
          Sandbox Mode
        </div>
      </div>
    </div>
    <div>
      <Textarea :model-value="getDebugOutput()" class="h-12rem w-full" />
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
import { attendeeService } from "@/composables/services/attendeeService";
import type { ModelRef } from "vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
} from "@/types/internal/system/regdesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { EnvName } from "@/types/internal/env";
import { OnsiteToastService } from "@/composables/services/toastService";

async function debugLoadAll(): Promise<void> {
  transformedAttendeeListRef.value =
    (await attendeeService.getAllAttendees(
      getErrorHandlerFunction(toastService)
    )) || [];
}

async function debugLoadDummy(): Promise<void> {
  transformedAttendeeListRef.value = [];
}

function getDebugOutput(): string {
  const filteredListStr = JSON.stringify(transformedAttendeeListRef.value);
  const filtersStr = JSON.stringify(
    dataOptionsRef.value.filterConfig.filterValues
  );
  const globalSearchStr = JSON.stringify(
    dataOptionsRef.value.filterConfig.globalFilterFields
  );
  return `testFilter(
        ${filteredListStr}
        ${filtersStr}
        ${globalSearchStr}
        );`;
}

function displayAllColumns() {}

const sandboxModeRef: Ref<boolean> = ref<boolean>(false);

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>("dataOptions", { required: true });
const selectedRef: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>("selected", { required: true });
const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });
const transformedAttendeeListRef: ModelRef<TransformedAttendeeInfo[]> =
  defineModel<TransformedAttendeeInfo[]>("transformedAttendeeList", {
    required: true,
  });
const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const debugModeRef: Ref<boolean> = ref<boolean>(false);
async function toggleDebug(): Promise<void> {
  debugModeRef.value = !debugModeRef.value;
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
