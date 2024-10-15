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
  <span class="pl-2" :class="modelValue?.cssClass">{{
    modelValue?.label
  }}</span>
</template>

<script setup lang="ts">
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import type { ModelRef } from "vue";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import type {
  AbstractGoodieWithVariantsValue,
  ConcreteGoodieValue,
  GoodieConfig,
} from "@/config/convention";

function checkConcreteItem(referenceList: ConcreteGoodieValue[]): boolean {
  return referenceList.includes(
    getConcreteItemValue(props.goodieConfig, modelValue.value)
  );
}

function isReserved(): boolean {
  return checkConcreteItem(props.reservedConcreteGoodies);
}

function isAvailableItem(): boolean {
  return checkConcreteItem(props.availableConcreteGoodies);
}

function isDefault(): boolean {
  const defaultValue: string | null | undefined = props.defaultValue.get(
    props.goodieConfig.value as AbstractGoodieWithVariantsValue
  );
  if (defaultValue === undefined) {
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
  defaultValue: DefaultVariantValues;
  issuedConcreteGoodies: ConcreteGoodieValue[];
  reservedConcreteGoodies: ConcreteGoodieValue[];
  availableConcreteGoodies: ConcreteGoodieValue[];
}
const props: Props = defineProps<Props>();

const modelValue: ModelRef<LabeledValue<string> | null> =
  defineModel<LabeledValue<string> | null>({ required: true });
</script>
