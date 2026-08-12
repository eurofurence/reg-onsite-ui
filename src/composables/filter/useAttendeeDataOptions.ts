import { deepCopy } from "@/composables/deepCopy";
import { useSmartCookie } from "@/composables/useSmartCookie";
import {
  defaultAttendeeDataOptions,
  getDefaultPresetFilterValues,
} from "@/config/system/regdesk";
import type { RawAttendeeFilter } from "@/types/internal/filter";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import { ref, watch, type Ref } from "vue";

export function useAttendeeDataOptions(): Ref<AttendeeDataOptions> {
  const presetFilterRef: Ref<RawAttendeeFilter> = useSmartCookie(
    "regdeskPresetFilters",
    getDefaultPresetFilterValues()
  );

  const dataOptionsRef: Ref<AttendeeDataOptions> = ref({
    ...deepCopy(defaultAttendeeDataOptions),
    filterConfig: {
      ...deepCopy(defaultAttendeeDataOptions.filterConfig),
      presetFilterValues: deepCopy(presetFilterRef.value),
    },
  });

  watch(
    () => dataOptionsRef.value.filterConfig.presetFilterValues,
    (newPreset) => {
      presetFilterRef.value = newPreset;
    },
    { deep: true }
  );

  return dataOptionsRef;
}
