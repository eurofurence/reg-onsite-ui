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
      <div><kbd class="kbc-button">C</kbd></div>
      <div>Checkin</div>
    </template>
    <template #leftPanel>
      <QuickDeskSettingsPanel
        v-model:settings="settingsRef"
        v-model:dataOptions="dataOptionsRef"
        :filteredCount="filteredListRef.length"
        @doLoad="doDataPreload"
      />
      <RegNumSearchPanel
        ref="regNumSearchPanel"
        v-if="settingsRef.searchMode === QuickDeskSearchMode.regId"
        :shortcutScopes="[ShortcutScope.regdesk]"
        @onSearchRegNumber="updateCurrentAttendee"
      />
      <div class="flex flex-col gap-3 p-2">
        <LabeledToggleSwitch
          label="Show ID for Runnner"
          v-model="settingsRef.displayBigNumber.enabled"
        />
        <LabeledRelativeSlider
          v-if="settingsRef.displayBigNumber.enabled"
          :label="`Font Size: ${settingsRef.displayBigNumber.size}`"
          :withParens="true"
          v-model="settingsRef.displayBigNumber.size"
          :baseValue="defaultQuickDeskSettings.displayBigNumber.size"
          :step="1"
          :min="2"
          :max="40"
        />
      </div>
    </template>
    <RegDeskUserInfo
      :class="getInactiveStyle()"
      v-model="transformedAttendeeInfoAdapter"
    />
    <RegDeskUserDetail
      :class="getInactiveStyle()"
      v-model="transformedAttendeeInfoAdapter"
      v-model:searchStatus="searchStatusRef"
      :enableCashierMode="props.enableCashierMode"
      @onCheckin="onCheckin"
      @onUndoCheckin="onUndoCheckin"
      @onPayment="onPayment"
      @onApprove="onApprove"
      @onPrint="onPrint"
      @updateCurrentAttendee="updateCurrentAttendee"
    />
    <QuickDeskBigNumber
      v-if="settingsRef.displayBigNumber.enabled"
      :attendee="transformedAttendeeInfoRef"
      :size="settingsRef.displayBigNumber.size"
    />
    <RegNumberSearchStatus
      v-model:status="searchStatusRef"
      v-if="searchStatusRef.mode != SearchStatusMode.idle_with_data"
    />
  </RegSearchTemplate>
  <PrintBadgeDialog
    v-if="printRequestRef"
    :visible="true"
    @update:visible="printRequestRef = null"
    :attendee="printRequestRef.attendee"
    :toastService="toastService"
  />
  <PaymentMethodDialog
    v-if="paymentRequestRef"
    :visible="true"
    @update:visible="paymentRequestRef = null"
    :regNumber="paymentRequestRef"
    :updateAttendee="updateCurrentAttendee"
    :toastService="toastService"
  />
</template>

<script setup lang="ts">
import RegNumSearchPanel from "@/components/common/RegNumSearchPanel.vue";
import RegNumberSearchStatus from "@/components/common/RegNumberSearchStatus.vue";
import RegSearchTemplate from "@/components/common/RegSearchTemplate.vue";
import LabeledRelativeSlider from "@/components/common/LabeledRelativeSlider.vue";
import LabeledToggleSwitch from "@/components/common/LabeledToggleSwitch.vue";
import PaymentMethodDialog from "@/components/regdesk/PaymentMethodDialog.vue";
import PrintBadgeDialog from "@/components/regdesk/PrintBadgeDialog.vue";
import QuickDeskBigNumber from "@/components/regdesk/QuickDeskBigNumber.vue";
import QuickDeskSettingsPanel from "@/components/regdesk/QuickDeskSettingsPanel.vue";
import RegDeskUserDetail from "@/components/regdesk/RegDeskUserDetail.vue";
import RegDeskUserInfo from "@/components/regdesk/RegDeskUserInfo.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getInactiveStyle } from "@/composables/colors/getInactiveStyle";
import { computeAttendeePlaceholder } from "@/composables/fields/computeAttendeePlaceholder";
import { canCheckin } from "@/composables/fields/status/canCheckin";
import { ensureBadgeConfigLoaded } from "@/composables/services/badgeConfigStore";
import { useAttendeeDataOptions } from "@/composables/filter/useAttendeeDataOptions";
import { generateId } from "@/composables/generateId";
import { confirmIfDirty } from "@/composables/dirty/confirmIfDirty";
import { getFunctionForDataPreload } from "@/composables/logic/regdesk/getFunctionForDataPreload";
import { getOnApproveFunction } from "@/composables/logic/getOnApproveFunction";
import { getOnCheckinFunction } from "@/composables/logic/getOnCheckinFunction";
import { getOnPaymentFunction } from "@/composables/logic/getOnPaymentFunction";
import {
  getOnPrintFunction,
  type PrintBadgeRequest,
} from "@/composables/logic/getOnPrintFunction";
import { doResetFilters } from "@/composables/filter/doResetFilters";
import { getUndoCheckinFunction } from "@/composables/logic/getUndoCheckinFunction";
import { setRegNumberRoute } from "@/composables/route/setRegNumberRoute";
import { getIdleNoDataSearchStatus } from "@/composables/search_status/constructors";
import { handleSingleAttendeeSearch } from "@/composables/search_status/handleSingleAttendeeSearch";
import { authService } from "@/composables/services/authService";
import {
  keyboardService,
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  type KeyboardServiceEvent,
} from "@/composables/services/keyboardService";
import { OnsiteToastService } from "@/composables/services/toastService";
import { dirtyState } from "@/composables/state/dirtyState";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";
import { hasMinimalFilter } from "@/composables/sort_and_filter/hasMinimalFilter";
import { useSmartCookie } from "@/composables/useSmartCookie";
import { defaultQuickDeskSettings } from "@/config/system/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  SearchStatusMode,
  type SearchStatus,
} from "@/types/internal/component/regnumsearch";
import {
  QuickDeskSearchMode,
  type AttendeeDataOptions,
  type QuickDeskSettings,
} from "@/types/internal/system/regdesk";
import Toast from "@/volt/Toast.vue";
import type { WritableComputedRef } from "vue";
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useId,
  useTemplateRef,
  watch,
  type ComputedRef,
  type Ref,
} from "vue";

interface Props {
  enableCashierMode?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  enableCashierMode: false,
});

onMounted(() => keyboardService.pushScope(ShortcutScope.regdesk));
onUnmounted(() => keyboardService.popScope(ShortcutScope.regdesk));

const regNumSearchPanel = useTemplateRef<typeof RegNumSearchPanel>(
  "regNumSearchPanel"
);

async function onEscape(event: KeyboardServiceEvent): Promise<boolean> {
  if (event.currentScope !== ShortcutScope.regdesk) {
    return false;
  }
  await confirmIfDirty(() => {
    setRegNumberRoute(null);
    resetState();
    doResetFilters(dataOptionsRef);
  });
  await regNumSearchPanel.value?.focus();
  return false;
}

keyboardService.registerShortcuts(
  ShortcutScope.regdesk,
  ShortcutEvent.keydown,
  ShortcutKey.escape,
  onEscape
);

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

onMounted(() => ensureBadgeConfigLoaded(getErrorHandlerFunction(toastService)));

const onCheckin = getOnCheckinFunction(
  updateCurrentAttendee,
  transformedAttendeeInfoRef,
  null,
  null,
  toastService
);

const onUndoCheckin = getUndoCheckinFunction(
  updateCurrentAttendee,
  toastService
);

const paymentRequestRef: Ref<RegNumber | null> = ref(null);

const onPayment = getOnPaymentFunction(paymentRequestRef, toastService);

const onApprove = getOnApproveFunction(updateCurrentAttendee, toastService);

const printRequestRef: Ref<PrintBadgeRequest | null> = ref(null);

const onPrint = getOnPrintFunction(
  transformedAttendeeInfoRef,
  printRequestRef,
  toastService
);

if (props.enableCashierMode) {
  dirtyState.quickCashierdeskDirty = computed<boolean>(
    () =>
      transformedAttendeeInfoRef.value !== null &&
      transformedAttendeeInfoRef.value?.id !== null &&
      canCheckin(transformedAttendeeInfoRef.value)
  );
} else {
  dirtyState.quickRegdeskDirty = computed<boolean>(
    () =>
      transformedAttendeeInfoRef.value !== null &&
      transformedAttendeeInfoRef.value?.id !== null &&
      canCheckin(transformedAttendeeInfoRef.value)
  );
}

const settingsRef: Ref<QuickDeskSettings> = useSmartCookie(
  props.enableCashierMode ? "quickCashierdeskSettings" : "quickRegdeskSettings",
  defaultQuickDeskSettings
);

const dataOptionsRef: Ref<AttendeeDataOptions> = useAttendeeDataOptions(
  props.enableCashierMode
);

const rawListRef: Ref<TransformedAttendeeInfo[]> = ref([]);

const doDataPreload: () => Promise<void> = getFunctionForDataPreload(
  rawListRef,
  toastService
);

const filteredListRef: ComputedRef<TransformedAttendeeInfo[]> = computed(
  () => {
    if (!hasMinimalFilter(dataOptionsRef.value.filterConfig.filterValues)) {
      return [];
    }
    return getFilteredAttendees(
      rawListRef.value,
      dataOptionsRef.value.filterConfig.filterValues,
      dataOptionsRef.value.filterConfig.globalFilterFields
    );
  }
);

watch(filteredListRef, (list: TransformedAttendeeInfo[]) => {
  const [onlyMatch] = list;
  if (list.length === 1 && onlyMatch !== undefined && onlyMatch.id !== null) {
    const regNumber = onlyMatch.id;
    confirmIfDirty(() => updateCurrentAttendee(regNumber));
  }
});

let latestUpdateRequestSequence = 0;
const latestRequestSequenceByRegNumber = new Map<RegNumber, number>();

async function updateCurrentAttendee(
  regNumber: RegNumber
): Promise<TransformedAttendeeInfo | null> {
  const requestSequence = ++latestUpdateRequestSequence;
  latestRequestSequenceByRegNumber.set(regNumber, requestSequence);
  let result: TransformedAttendeeInfo | null;
  try {
    result = await handleSingleAttendeeSearch(
      regNumber,
      searchStatusRef,
      toastService
    );
  } catch (error) {
    if (latestRequestSequenceByRegNumber.get(regNumber) === requestSequence) {
      transformedAttendeeInfoRef.value = null;
    }
    throw error;
  }
  if (latestRequestSequenceByRegNumber.get(regNumber) !== requestSequence) {
    // A newer search for this same regNumber was started after this one;
    // discard this stale result so it doesn't clobber fresher state.
    return result;
  }
  transformedAttendeeInfoRef.value = result;
  return transformedAttendeeInfoRef.value;
}
</script>
