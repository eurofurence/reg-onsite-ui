<template>
  <Toast :group="toastGroup" position="bottom-right" />
  <LayoutOnsitePage :title="props.title">
    <template #help>
      Available hotkeys:
      <ul>
        <li>'Escape': Reset reg number input field</li>
        <li>'Enter': Search for reg number</li>
        <li>'A': Select all</li>
        <li>'S': Save</li>
      </ul>
    </template>
    <div class="sponsordesk w-screen p-px">
      <Splitter stateKey="sponsorSplitter">
        <SplitterPanel :size="25">
          <PanelSponsordeskSearch @onSearchRegNumber="onSearchRegNumber" />
          <div class="pt-5">
            <Message :severity="Severity.secondary" closable>
              <div class="grid grid-cols-2 grid-flow-row items-center gap-1">
                <div><kbd class="kbc-button">Esc</kbd></div>
                <div>Reset Input</div>
                <div><kbd class="kbc-button">Enter</kbd></div>
                <div>Search</div>
                <div><kbd class="kbc-button">A</kbd></div>
                <div>Select all</div>
                <div><kbd class="kbc-button">S</kbd></div>
                <div>Save</div>
              </div>
            </Message>
          </div>
        </SplitterPanel>
        <SplitterPanel :size="75">
          <LayoutGroupPanel icon="pi-user" label="User Details">
            <div class="flex flex-col gap-6">
              <PanelSponsordeskUserInfo
                readonly
                v-model="transformedAttendeeInfoAdapter"
                v-model:searchStatus="searchStatusRef"
              />
              <PanelSponsordeskItems
                v-model="transformedAttendeeInfoAdapter"
                v-model:apiSDAddInfo="apiSDAddInfoRef"
                v-model:apiSDAddInfoComparison="apiSDAddInfoComparisonRef"
                v-bind:deskItemSubset="props.deskItemSubset"
                v-bind:deskName="props.deskName"
              />
            </div>
          </LayoutGroupPanel>
        </SplitterPanel>
      </Splitter>
    </div>
  </LayoutOnsitePage>
</template>

<script setup lang="ts">
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { computeAttendeePlaceholder } from "@/composables/fields/computeAttendeePlaceholder";
import { getEmptySponsorDeskAddInfo } from "@/composables/items/getEmptySponsorDeskAddInfo";
import { getIdleNoDataSearchStatus } from "@/composables/search_status/constructors";
import { doTrackedSearch } from "@/composables/search_status/doTrackedSearch";
import { attendeeService } from "@/composables/services/attendeeService";
import { authService } from "@/composables/services/authService";
import { deepCopy } from "@/composables/state/deepCopy";
import { dirtyState } from "@/composables/state/dirtyState";
import type { ApiSponsorDeskAddInfo } from "@/types/external";
import {
  Severity,
  type RestErrorInfo,
  type SearchStatus,
  type TransformedAttendeeInfo,
} from "@/types/internal";
import type { ToastServiceMethods } from "primevue/toastservice";
import type { AbstractTrinketValue } from "@/setupEFIteration";
import { keyboardService, ShortcutScope } from "@/composables/services/keyboardService";

keyboardService.pushScope(ShortcutScope.regdesk);

const toast: ToastServiceMethods = useToast();

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
  const curValue: string = JSON.stringify(apiSDAddInfoRef.value);
  const refValue: string = JSON.stringify(apiSDAddInfoComparisonRef.value);
  return curValue != refValue;
});

function resetState(): void {
  transformedAttendeeInfoRef.value = null;
  apiSDAddInfoRef.value = getEmptySponsorDeskAddInfo();
  apiSDAddInfoComparisonRef.value = getEmptySponsorDeskAddInfo();
}

authService.onLogout(resetState);

async function handleSearch(
  regNumber: number,
  errorHandler: RestErrorHandler
): Promise<string[]> {
  var errorList: string[] = [];
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
    attendeeService.getSponsorDeskAddInfo(collectErrors, regNumber);
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

async function onSearchRegNumber(regNumber: number): Promise<void> {
  resetState();
  await doTrackedSearch(
    regNumber,
    searchStatusRef,
    toast,
    toastGroup,
    handleSearch
  );
}

interface Props {
  title: string;
  deskName: string;
  deskItemSubset: AbstractTrinketValue[];
}
const props: Props = defineProps<Props>();
const componentId: string = generateId(useId());
const toastGroup: string = `sponsordesk${componentId}`;
</script>

<style>
.sponsordesk .p-splitter {
  border: none;
}

.sponsordesk .p-splitter-gutter {
  width: 1rem;
  background: var(--p-form-field-background);
  transition: 0s background-color;
}

.sponsordesk .p-splitter-gutter:hover {
  background: var(--p-form-field-border-color);
  transition-delay: 0.2s;
}
</style>
