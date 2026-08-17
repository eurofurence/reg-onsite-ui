<template>
  <i v-if="isDefault()" class="pi pi-shopping-cart" v-tooltip="'Selected'" />
  <i v-if="isReserved()" class="pi pi-bookmark-fill" v-tooltip="'Reserved'" />
  <i
    v-if="!isAvailableItem()"
    class="pi pi-exclamation-circle"
    v-tooltip="'Out of stock'"
  />
  <i
    v-if="!isDefault() && !isReserved() && isAvailableItem()"
    class="invisible pi pi-circle"
  />
  <span
    class="pl-2"
    :class="modelValue?.cssClass"
    v-tooltip="getConcreteItemValue(props.goodieConfig, modelValue)"
    >{{ modelValue?.label }}</span
  >
</template>

<script setup lang="ts">
import { findNthOccurrenceIndex } from "@/composables/items/findNthOccurrenceIndex";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import type {
  AbstractGoodieWithVariantsValue,
  ConcreteGoodieValue,
  GoodieConfig,
} from "@/config/convention";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import type { ModelRef } from "vue";

function isReserved(): boolean {
  const idx = findNthOccurrenceIndex(
    props.reservedConcreteGoodies,
    props.goodieConfig,
    props.unitIndex
  );
  if (idx === -1) {
    return false;
  }
  return (
    props.reservedConcreteGoodies[idx] ===
    getConcreteItemValue(props.goodieConfig, modelValue.value)
  );
}

function isAvailableItem(): boolean {
  return props.availableConcreteGoodies.includes(
    getConcreteItemValue(props.goodieConfig, modelValue.value)
  );
}

function isDefault(): boolean {
  const defaultValue: string | null | undefined = props.defaultValue.get(
    props.goodieConfig.value as AbstractGoodieWithVariantsValue
  );
  if (defaultValue === undefined || defaultValue === null) {
    return false;
  }
  return (
    getConcreteItemValue(props.goodieConfig, modelValue.value) ==
    getConcreteItemValue(props.goodieConfig, {
      value: defaultValue,
      label: "",
    })
  );
}

interface Props {
  goodieConfig: GoodieConfig;
  unitIndex: number;
  defaultValue: DefaultVariantValues;
  issuedConcreteGoodies: ConcreteGoodieValue[];
  reservedConcreteGoodies: ConcreteGoodieValue[];
  availableConcreteGoodies: ConcreteGoodieValue[];
}
const props: Props = defineProps<Props>();

const modelValue: ModelRef<LabeledValue<string> | null> =
  defineModel<LabeledValue<string> | null>({ required: true });
</script>
