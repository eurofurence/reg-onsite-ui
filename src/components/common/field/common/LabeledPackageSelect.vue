<template>
  <div :class="getDivClass()">
    <label :for="componentId" :class="fieldLabelCSS">{{ props.label }}</label>
    <Select
      :id="componentId"
      :class="fieldTextCSS"
      v-model="packageChoice"
      :options="metadataList"
      optionValue="value"
      optionLabel="label"
      :placeholder="props.metadataRecord[props.placeholderKey].label"
      v-bind="$attrs"
    />
  </div>
</template>

<script
  setup
  lang="ts"
  generic="LabelType extends LabeledValue<ValueType>, ValueType extends PackageValue"
>
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/common/field/common/common";
import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { getMetadataEntryListFromRecord } from "@/composables/collection_tools/metadata/getMetadataEntryListFromRecord";
import { computeExclusivePackagePresence } from "@/composables/fields/packages/computeExclusivePackagePresence";
import { generateId } from "@/composables/generateId";
import type {
  PackageCountType
} from "@/types/external/attsrv/attendees/attendee";
import type { PackageValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import Select from "@/volt/Select.vue";
import type { ModelRef, WritableComputedRef } from "vue";
import { useId } from "vue";

function getDivClass() {
  const width: number = props.widthInRem * 4;
  return `${fieldCSS} w-${width}`;
}

interface Props {
  label: string;
  widthInRem: number;
  metadataRecord: MetadataRecord<LabelType>;
  placeholderKey: ValueType;
}
const props: Props = defineProps<Props>();
const metadataList: LabeledValue<ValueType>[] = getMetadataEntryListFromRecord<LabelType>(
  props.metadataRecord
);

defineOptions({
  inheritAttrs: false,
});

const modelValue: ModelRef<PackageCountType[] | null> =
  defineModel<PackageCountType[] | null>({ required: true });

const packageChoice: WritableComputedRef<PackageValue | null> =
  computeExclusivePackagePresence(modelValue, metadataList);

const componentId: string = generateId(useId());
</script>
