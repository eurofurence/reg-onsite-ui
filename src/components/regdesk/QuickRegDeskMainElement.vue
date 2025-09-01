<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <RegSearchTemplate
    :shortcutScopes="[ShortcutScope.regdesk]"
    @onSearchRegNumber="updateCurrentAttendee"
  >
    <template #help>
      <div><kbd class="kbc-button">Esc</kbd></div>
      <div>Reset Input</div>
      <div><kbd class="kbc-button">Enter</kbd></div>
      <div>Search</div>
    </template>
    <RegDeskUserInfo
      :class="getInactiveStyle()"
      v-model="transformedAttendeeInfoAdapter"
    />
    <RegDeskUserDetail
      :class="getInactiveStyle()"
      v-model="transformedAttendeeInfoAdapter"
      v-model:searchStatus="searchStatusRef"
      @onCheckin="onCheckin"
      @onUndoCheckin="onUndoCheckin"
      @updateCurrentAttendee="updateCurrentAttendee"
    />
    <RegNumberSearchStatus
      v-model:status="searchStatusRef"
      v-if="searchStatusRef.mode != SearchStatusMode.idle_with_data"
    />
  </RegSearchTemplate>
</template>

<script setup lang="ts">
import RegNumberSearchStatus from "@/components/common/RegNumberSearchStatus.vue";
import RegSearchTemplate from "@/components/common/RegSearchTemplate.vue";
import RegDeskUserDetail from "@/components/regdesk/RegDeskUserDetail.vue";
import RegDeskUserInfo from "@/components/regdesk/RegDeskUserInfo.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getInactiveStyle } from "@/composables/colors/getInactiveStyle";
import { computeAttendeePlaceholder } from "@/composables/fields/computeAttendeePlaceholder";
import { generateId } from "@/composables/generateId";
import { getOnCheckinFunction } from "@/composables/logic/getOnCheckinFunction";
import { getIdleNoDataSearchStatus } from "@/composables/search_status/constructors";
import { handleSingleAttendeeSearch } from "@/composables/search_status/handleSingleAttendeeSearch";
import { attendeeService } from "@/composables/services/attendeeService";
import { authService } from "@/composables/services/authService";
import { environmentSettings } from "@/composables/services/environmentService";
import {
  keyboardService,
  ShortcutScope,
} from "@/composables/services/keyboardService";
import { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  SearchStatusMode,
  type SearchStatus,
} from "@/types/internal/component/regnumsearch";
import { EnvName } from "@/types/internal/env";
import Toast from "@/volt/Toast.vue";
import type { WritableComputedRef } from "vue";
import { ref, useId, type Ref } from "vue";

keyboardService.pushScope(ShortcutScope.regdesk);

const transformedAttendeeInfoRef: Ref<TransformedAttendeeInfo | null> =
  ref<TransformedAttendeeInfo | null>(null);
const searchStatusRef: Ref<SearchStatus> = ref<SearchStatus>(
  getIdleNoDataSearchStatus()
);

const transformedAttendeeInfoAdapter: WritableComputedRef<TransformedAttendeeInfo> =
  computeAttendeePlaceholder(transformedAttendeeInfoRef, true);

function resetState(): void {
  transformedAttendeeInfoRef.value = null;
}

authService.onLogout(resetState);

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const onCheckin = getOnCheckinFunction(
  updateCurrentAttendee,
  transformedAttendeeInfoRef,
  null,
  null,
  toastService
);

async function onUndoCheckin(regNumber: RegNumber): Promise<void> {
  if (environmentSettings.envName !== EnvName.dev) {
    return;
  }
  await attendeeService.debugSetStatusToPaid(
    getErrorHandlerFunction(toastService),
    regNumber
  );
  await updateCurrentAttendee(regNumber);
}

async function updateCurrentAttendee(
  regNumber: RegNumber
): Promise<TransformedAttendeeInfo | null> {
  try {
    transformedAttendeeInfoRef.value = await handleSingleAttendeeSearch(
      regNumber,
      searchStatusRef,
      toastService
    );
  } catch (error) {
    transformedAttendeeInfoRef.value = null;
    throw error;
  }
  return transformedAttendeeInfoRef.value;
}
</script>
