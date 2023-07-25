import { computed } from "vue";
import { useCSVList } from "@/composables/useCSVList";
import { configDayAttendanceItems } from "@/ef.config";

const dayAttendanceValueList = configDayAttendanceItems.map((item) => item.value);

export function useDayAttendance(dataRef) {
    const packageList = useCSVList(dataRef, "packages");
    return computed({
        get: () => packageList.value.filter((value) => dayAttendanceValueList.includes(value)),
        set: (value) => {
            const otherPackages = packageList.value.filter((value) => !dayAttendanceValueList.includes(value));
            packageList.value = otherPackages.concat(value);
        },
    });
}
