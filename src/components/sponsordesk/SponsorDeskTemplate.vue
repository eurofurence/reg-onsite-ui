<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <RegSearchTemplate
    :shortcutScopes="[ShortcutScope.regdesk]"
    @onSearchRegNumber="onSearchRegNumber"
  >
    <template #help>
      <div><kbd class="kbc-button">Esc</kbd></div>
      <div>Reset Input</div>
      <div><kbd class="kbc-button">Enter</kbd></div>
      <div>Search</div>
      <div><kbd class="kbc-button">A</kbd></div>
      <div>Select items</div>
      <div><kbd class="kbc-button">S</kbd></div>
      <div>Save</div>
    </template>
    <SponsorDeskUserInfo
      :class="getInactiveStyle()"
      v-model="transformedAttendeeInfoAdapter"
    />
    <SponsorDeskItemsList
      v-model="transformedAttendeeInfoAdapter"
      v-model:apiSDAddInfo="apiSDAddInfoRef"
      v-model:apiSDAddInfoComparison="apiSDAddInfoComparisonRef"
      v-bind:deskItemSubset="deskItemSubset"
      v-bind:deskName="props.deskName"
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
import SponsorDeskItemsList from "@/components/sponsordesk/SponsorDeskItemsList.vue";
import SponsorDeskUserInfo from "@/components/sponsordesk/SponsorDeskUserInfo.vue";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getInactiveStyle } from "@/composables/colors/getInactiveStyle";
import { deepCopy } from "@/composables/deepCopy";
import { computeAttendeePlaceholder } from "@/composables/fields/computeAttendeePlaceholder";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getIdleNoDataSearchStatus } from "@/composables/search_status/constructors";
import { doTrackedSearch } from "@/composables/search_status/doTrackedSearch";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import { attendeeService } from "@/composables/services/attendeeService";
import { authService } from "@/composables/services/authService";
import {
  keyboardService,
  ShortcutScope,
} from "@/composables/services/keyboardService";
import { OnsiteToastService } from "@/composables/services/toastService";
import { dirtyState } from "@/composables/state/dirtyState";
import type { AbstractGoodieValue } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  SearchStatusMode,
  type SearchStatus,
} from "@/types/internal/component/regnumsearch";
import type { ConventionInventorySettings } from "@/types/internal/convention";
import type { RestErrorInfo } from "@/types/internal/rest";
import Toast from "@/volt/Toast.vue";
import { computed, ref, useId, type Ref } from "vue";

keyboardService.pushScope(ShortcutScope.regdesk);

const transformedAttendeeInfoRef: Ref<TransformedAttendeeInfo | null> =
  ref<TransformedAttendeeInfo | null>(null);
const apiSDAddInfoRef: Ref<ApiSponsorDeskAddInfo> = ref<ApiSponsorDeskAddInfo>(
  getEmptySponsorDeskAddInfo()
);
const apiSDAddInfoComparisonRef: Ref<ApiSponsorDeskAddInfo> =
  ref<ApiSponsorDeskAddInfo>(getEmptySponsorDeskAddInfo());
const searchStatusRef: Ref<SearchStatus> = ref<SearchStatus>(
  getIdleNoDataSearchStatus()
);

const transformedAttendeeInfoAdapter = computeAttendeePlaceholder(
  transformedAttendeeInfoRef,
  true
);

function sortSponsorInfo(apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo) {
  apiSponsorDeskAddInfo.issuedItems.sort();
  apiSponsorDeskAddInfo.pastItems.sort();
  apiSponsorDeskAddInfo.reservedItems.sort();
}

dirtyState.apiSDAddInfoChanged = computed<boolean>(() => {
  sortSponsorInfo(apiSDAddInfoRef.value);
  sortSponsorInfo(apiSDAddInfoComparisonRef.value);
  const removeHistory = (key: string, value: any) => {
    return key === "history" ? [] : value;
  };
  const curValue: string = JSON.stringify(apiSDAddInfoRef.value, removeHistory);
  const refValue: string = JSON.stringify(
    apiSDAddInfoComparisonRef.value,
    removeHistory
  );
  return curValue != refValue;
});

function resetState(): void {
  transformedAttendeeInfoRef.value = null;
  apiSDAddInfoRef.value = getEmptySponsorDeskAddInfo();
  apiSDAddInfoComparisonRef.value = getEmptySponsorDeskAddInfo();
}

authService.onLogout(resetState);

async function handleSearch(
  regNumber: RegNumber,
  errorHandler: RestErrorHandler
): Promise<string[]> {
  let errorList: string[] = [];
  function collectErrors(error: RestErrorInfo) {
    errorHandler(error);
    errorList.push(
      `${error.serviceName}: ${error.errorCategory} (${error.errorDetail})`
    );
  }
  const transformedAttendeeInfoPromise: Promise<
    TransformedAttendeeInfo | null | undefined
  > = attendeeService.getAttendeeByRegNumber(collectErrors, regNumber);
  const apiSDAddInfoPromise: Promise<ApiSponsorDeskAddInfo | null | undefined> =
    attendeeService.addInfos.getSponsorDeskAddInfo(collectErrors, regNumber);
  Promise.allSettled([transformedAttendeeInfoPromise, apiSDAddInfoPromise]);
  const transformedAttendeeInfo: TransformedAttendeeInfo | null | undefined =
    await transformedAttendeeInfoPromise;
  const apiSDAddInfo: ApiSponsorDeskAddInfo | null | undefined =
    await apiSDAddInfoPromise;
  if (
    errorList.length > 0 ||
    transformedAttendeeInfo === undefined ||
    apiSDAddInfo === undefined
  ) {
    return errorList;
  } else {
    const sanitizedApiSDAddInfo: ApiSponsorDeskAddInfo =
      apiSDAddInfo || getEmptySponsorDeskAddInfo();
    transformedAttendeeInfoRef.value = transformedAttendeeInfo;
    apiSDAddInfoRef.value = sanitizedApiSDAddInfo;
    apiSDAddInfoComparisonRef.value = deepCopy<ApiSponsorDeskAddInfo>(
      sanitizedApiSDAddInfo
    );
    if (transformedAttendeeInfo === null) {
      return [`Attendee data doesn't exist or isn't in a valid state!`];
    }
  }
  return [];
}

async function onSearchRegNumber(regNumber: RegNumber): Promise<void> {
  resetState();
  await doTrackedSearch(regNumber, searchStatusRef, toastService, handleSearch);
}

interface Props {
  deskName: keyof ConventionInventorySettings;
}
const props: Props = defineProps<Props>();

const deskItemSubset: AbstractGoodieValue[] =
  getConventionSetup().inventory[props.deskName];

const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);
</script>
