<template>
  <Toast :group="toastGroup" position="bottom-right" />
  <LayoutOnsitePage :title="props.title">
    <template #help>
      Available hotkeys:
      <ul>
        <li>'Escape': Reset reg number input field</li>
        <li>'Enter': Search for reg number</li>
      </ul>
    </template>
    <div class="quickregdeskdesk w-screen p-px">
      <Splitter stateKey="quickregdeskSplitter">
        <SplitterPanel :size="25">
          <PanelSponsordeskSearch @onSearchRegNumber="updateCurrentAttendee" />
          <div class="pt-5">
            <Message :severity="Severity.secondary" closable>
              <div class="grid grid-cols-2 grid-flow-row items-center gap-1">
                <div class="pb-5"><kbd class="kbc-button">Esc</kbd></div>
                <div class="pb-5">Reset Input</div>
                <div><kbd class="kbc-button">Enter</kbd></div>
                <div>Search</div>
              </div>
            </Message>
          </div>
        </SplitterPanel>
        <SplitterPanel :size="75">
          <LayoutGroupPanel icon="pi-user" label="User Details">
            <div class="flex flex-col gap-1">
              <PanelRegdeskUserInfo
                readonly
                v-model="transformedAttendeeInfoAdapter"
              />
              <PanelRegdeskUserDetail
                readonly
                v-model="transformedAttendeeInfoAdapter"
                v-model:searchStatus="searchStatusRef"
                @onCheckin="onCheckin"
                @onUndoCheckin="onUndoCheckin"
                @updateCurrentAttendee="updateCurrentAttendee"
              />
              <LayoutRegNumberSearchStatus v-model:status="searchStatusRef" />
            </div>
          </LayoutGroupPanel>
        </SplitterPanel>
        <LayoutRegNumberSearchStatus :status="searchStatusRef" />
      </Splitter>
    </div>
  </LayoutOnsitePage>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { computeAttendeePlaceholder } from "@/composables/fields/computeAttendeePlaceholder";
import { getIdleNoDataSearchStatus } from "@/composables/search_status/constructors";
import { attendeeService } from "@/composables/services/attendeeService";
import { authService } from "@/composables/services/authService";
import { environmentSettings } from "@/composables/services/environmentService";
import {
  EnvName,
  Severity,
  type SearchStatus,
  type TransformedAttendeeInfo,
} from "@/types/internal";
import type { ToastServiceMethods } from "primevue/toastservice";
import type { WritableComputedRef } from "vue";
import { handleSingleAttendeeSearch } from "@/composables/search_status/handleSingleAttendeeSearch";
import { getOnCheckinFunction } from "@/composables/logic/getOnCheckinFunction";
import { keyboardService, ShortcutScope } from "~/composables/services/keyboardService";

keyboardService.pushScope(ShortcutScope.regdesk);

const toast: ToastServiceMethods = useToast();

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
const toastGroup: string = `quickregdesk${componentId}`;

const onCheckin = getOnCheckinFunction(
  updateCurrentAttendee,
  toast,
  toastGroup
);

async function onUndoCheckin(regNumber: number): Promise<void> {
  if (environmentSettings.envName !== EnvName.dev) {
    return;
  }
  await attendeeService.debugSetStatusToPaid(
    getErrorHandlerFunction(toast, toastGroup),
    regNumber
  );
  await updateCurrentAttendee(regNumber);
}

async function updateCurrentAttendee(
  regNumber: number
): Promise<TransformedAttendeeInfo | null> {
  transformedAttendeeInfoRef.value = null;
  transformedAttendeeInfoRef.value = await handleSingleAttendeeSearch(
    regNumber,
    searchStatusRef,
    toast,
    toastGroup
  );
  return transformedAttendeeInfoRef.value;
}

interface Props {
  title: string;
}
const props: Props = defineProps<Props>();
</script>

<style>
.quickregdeskdesk .p-splitter {
  border: none;
}

.quickregdeskdesk .p-splitter-gutter {
  width: 1rem;
  background: var(--p-form-field-background);
  transition: 0s background-color;
}

.quickregdeskdesk .p-splitter-gutter:hover {
  background: var(--p-form-field-border-color);
  transition-delay: 0.2s;
}
</style>
