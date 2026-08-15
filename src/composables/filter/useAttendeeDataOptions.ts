import { deepCopy } from "@/composables/deepCopy";
import { doResetFilters } from "@/composables/filter/doResetFilters";
import { useSmartCookie } from "@/composables/useSmartCookie";
import {
  defaultAttendeeDataOptions,
  getDefaultCashierPresetFilterValues,
  getDefaultPresetFilterValues,
} from "@/config/system/regdesk";
import type { RawAttendeeFilter } from "@/types/internal/filter";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import { ref, watch, type Ref } from "vue";

export function useAttendeeDataOptions(
  enableCashierMode: boolean = false
): Ref<AttendeeDataOptions> {
  const cookieName: string = enableCashierMode
    ? "cashierdeskPresetFilters"
    : "regdeskPresetFilters";
  const defaultPresetFilterValues: RawAttendeeFilter = enableCashierMode
    ? getDefaultCashierPresetFilterValues()
    : getDefaultPresetFilterValues();
  const presetFilterRef: Ref<RawAttendeeFilter> = useSmartCookie(
    cookieName,
    defaultPresetFilterValues
  );

  const dataOptionsRef: Ref<AttendeeDataOptions> = ref({
    ...deepCopy(defaultAttendeeDataOptions),
    filterConfig: {
      ...deepCopy(defaultAttendeeDataOptions.filterConfig),
      presetFilterValues: deepCopy(presetFilterRef.value),
    },
  });

  doResetFilters(dataOptionsRef);

  watch(
    () => dataOptionsRef.value.filterConfig.presetFilterValues,
    (newPreset) => {
      presetFilterRef.value = newPreset;
    },
    { deep: true }
  );

  return dataOptionsRef;
}
