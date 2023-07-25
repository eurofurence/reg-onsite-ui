import { computed } from "vue";

export function getSelectedValue(sourceValueList, referenceItemList) {
    var notFoundKey = null;
    for (const referenceItem of referenceItemList) {
        if (referenceItem.value == "") {
            notFoundKey = "";
        }
        if (sourceValueList?.includes(referenceItem.value)) {
            return referenceItem.value;
        }
    }
    return notFoundKey;
}

export function computeSelectedValue(sourceValueListRef, referenceItemList) {
    return computed({
        get: () => getSelectedValue(sourceValueListRef.value, referenceItemList),
        set: (value) => {
            if (value == null) {
                return;
            }
            const referenceValueList = referenceItemList.map((item) => item.value);
            var listWithoutReferenceValues = sourceValueListRef.value.filter((listValue) => !referenceValueList.includes(listValue));
            if (value != "") {
                listWithoutReferenceValues.push(value);
            }
            sourceValueListRef.value = listWithoutReferenceValues;
        },
    });
}
