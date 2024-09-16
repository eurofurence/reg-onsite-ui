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
import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";
import type { DefaultVariantValues, LabeledValue } from "@/types/internal";
import type { ModelRef } from "vue";

function checkConcreteItem(referenceList: ConcreteTrinketValue[]): boolean {
  return referenceList.includes(
    getConcreteItemValue(props.trinketConfig, modelValue.value)
  );
}

function isReserved(): boolean {
  return checkConcreteItem(props.reservedConcreteTrinkets);
}

function isAvailableItem(): boolean {
  return checkConcreteItem(props.availableConcreteTrinkets);
}

function isDefault(): boolean {
  const defaultValue: string | null | undefined = (<Map<string, string>>(
    props.defaultValue
  )).get(props.trinketConfig.value);
  if (defaultValue === undefined) {
    return false;
  }
  return (
    getConcreteItemValue(props.trinketConfig, modelValue.value) ==
    getConcreteItemValue(props.trinketConfig, {
      value: defaultValue,
      label: "",
    })
  );
}

interface Props {
  trinketConfig: TrinketConfig;
  defaultValue: DefaultVariantValues;
  issuedConcreteTrinkets: ConcreteTrinketValue[];
  reservedConcreteTrinkets: ConcreteTrinketValue[];
  availableConcreteTrinkets: ConcreteTrinketValue[];
}
const props: Props = defineProps<Props>();

const modelValue: ModelRef<LabeledValue<string> | null> =
  defineModel<LabeledValue<string> | null>({ required: true });
</script>
