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
  generic="LabelType extends LabeledValue<ValueType>, ValueType extends PackageApiValue | ''"
>
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common/common";
import { computePackageChoice } from "@/composables/fields/packages/computePackageChoice";
import type { ModelRef, WritableComputedRef } from "vue";
import type { LabeledValue } from "@/types/internal/infos";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { PackageValue } from "@/types/internal/fields";

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
const metadataList: LabeledValue<ValueType>[] = getMetadataList<LabelType>(
  props.metadataRecord
);

defineOptions({
  inheritAttrs: false,
});

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });

const packageChoice: WritableComputedRef<PackageValue | null> =
  computePackageChoice(modelValue, metadataList);

const componentId: string = generateId(useId());
</script>
