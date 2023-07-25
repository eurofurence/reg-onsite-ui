import { useCSVList } from "@/composables/useCSVList";
import { computed } from "vue";
import { configRoleItems } from "@/ef.config";
import { convertListToMap } from "@/composables/convertListToMap";

const rolesMap = convertListToMap(configRoleItems);

export function getRoleItem(value) {
    return rolesMap[value];
}

export function getRoles(data) {
    const flagsValueList = data.flags.split(",");
    return getRolesInternal(data.id, flagsValueList);
}

function getRolesInternal(id, flagValueList) {
    if (flagValueList === null) {
        return null;
    }
    var roleFlagValues = [];
    configRoleItems.forEach((role) => {
        if (role.value === "") {
            return;
        }
        var hasRole = false;
        if (flagValueList.includes(role.value)) {
            hasRole = true;
        } else if (role.idList.includes(id)) {
            hasRole = true;
        }
        if (hasRole) {
            roleFlagValues.push(role.value);
        }
    });
    return roleFlagValues;
}

export function useRoles(dataRef) {
    return computed({
        get: () => {
            const flagList = useCSVList(dataRef, "flags");
            return getRolesInternal(dataRef.value.id, flagList.value);
        },
    });
}
