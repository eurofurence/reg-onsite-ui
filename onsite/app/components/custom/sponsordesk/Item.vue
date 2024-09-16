<template>
  <div class="flex flex-grow gap-2 items-center justify-between">
    <div class="flex flex-grow items-center">
      <div class="items-checkbox">
        <Checkbox
          v-model="selectedConcreteTrinketValueListRef"
          :name="props.itemGroupId"
          :value="getLocalConcreteTrinketValue(selectedVariantRef)"
          :inputId="labelId"
          :disabled="isCheckboxDisabled()"
        />
      </div>
      <div class="items-label">
        <label :class="fieldTextCSS" class="ml-2 checkbox-label" :for="labelId">
          <span class="text-nowrap" v-if="props.trinketConfig?.variants">
            <i class="invisible pi pi-circle" />
            {{ props.trinketConfig.label }}
          </span>
          <span v-else>
            <CustomSponsordeskItemOption
              v-model="props.trinketConfig"
              :trinketConfig="props.trinketConfig"
              :defaultValue="defaultVariantValuesRef"
              :issuedConcreteTrinkets="selectedConcreteTrinketValueListRef"
              :reservedConcreteTrinkets="reservedConcreteTrinketValueListRef"
              :availableConcreteTrinkets="sponsorDeskSettingsRef.available"
            />
          </span>
        </label>
      </div>
    </div>
    <div>
      <Select
        class="w-64"
        v-if="props.trinketConfig?.variants"
        v-model="selectedVariantRef"
        :options="props.trinketConfig.variants"
        :scrollHeight="getSelectHeight()"
        placeholder="Nothing selected"
        @change="onVariantChange"
        :invalid="selectedVariantRef === null"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value">
            <CustomSponsordeskItemOption
              v-model="slotProps.value"
              :trinketConfig="props.trinketConfig"
              :defaultValue="defaultVariantValuesRef"
              :issuedConcreteTrinkets="selectedConcreteTrinketValueListRef"
              :reservedConcreteTrinkets="reservedConcreteTrinketValueListRef"
              :availableConcreteTrinkets="sponsorDeskSettingsRef.available"
            />
          </div>
          <div v-else>
            {{ slotProps.placeholder }}
          </div>
        </template>
        <template #option="slotProps">
          <CustomSponsordeskItemOption
            v-model="slotProps.option"
            :trinketConfig="props.trinketConfig"
            :defaultValue="defaultVariantValuesRef"
            :issuedConcreteTrinkets="selectedConcreteTrinketValueListRef"
            :reservedConcreteTrinkets="reservedConcreteTrinketValueListRef"
            :availableConcreteTrinkets="sponsorDeskSettingsRef.available"
          />
        </template>
      </Select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fieldTextCSS } from "@/components/field/common";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getDefaultVariantValuesValue } from "@/composables/items/getDefaultVariantValuesValue";
import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";
import type {
  DefaultVariantValues,
  LabeledValue,
  SponsorDeskSettings,
} from "@/types/internal";
import type { SelectChangeEvent } from "primevue/select";
import type { ModelRef } from "vue";

function getSelectHeight(): string {
  if (!props.trinketConfig?.variants) {
    return "1rem";
  }
  const showItems: number = Math.min(props.trinketConfig.variants.length, 10);
  const selectHeight: number = showItems * 2.5;
  return `${selectHeight}rem`;
}

function isCheckboxDisabled(): boolean {
  return (
    props.trinketConfig?.variants !== undefined &&
    selectedVariantRef.value === null
  );
}

function onVariantChange(_event: SelectChangeEvent): void {
  const concreteValue: ConcreteTrinketValue = getLocalConcreteTrinketValue(
    selectedVariantRef.value
  );
  // Remove any existing concrete values belonging to this abstract item
  const concreteValueList = selectedConcreteTrinketValueListRef.value.filter(
    (value: ConcreteTrinketValue) =>
      !value.startsWith(`${props.trinketConfig.value}_`)
  );
  // If the list is shorter after the removal - add the new concrete value back
  const hasSelectedVariant =
    selectedConcreteTrinketValueListRef.value.length !=
    concreteValueList.length;
  if (hasSelectedVariant) {
    concreteValueList.push(concreteValue);
  }
  selectedConcreteTrinketValueListRef.value = concreteValueList;
}

function getLocalConcreteTrinketValue<VariantType>(
  selectedVariant: LabeledValue<VariantType> | null
): ConcreteTrinketValue {
  return getConcreteItemValue(props.trinketConfig, selectedVariant);
}

const selectedConcreteTrinketValueListRef: ModelRef<ConcreteTrinketValue[]> =
  defineModel<ConcreteTrinketValue[]>({
    required: true,
  });

const reservedConcreteTrinketValueListRef: ModelRef<ConcreteTrinketValue[]> =
  defineModel<ConcreteTrinketValue[]>("reservedItems", {
    required: true,
  });

const defaultVariantValuesRef: ModelRef<DefaultVariantValues> =
  defineModel<DefaultVariantValues>("defaultVariantValues", {
    required: true,
  });

const sponsorDeskSettingsRef: ModelRef<SponsorDeskSettings> =
  defineModel<SponsorDeskSettings>("sponsorDeskSettings", {
    required: true,
  });

interface Props {
  itemGroupId: string;
  trinketConfig: TrinketConfig;
}
const props: Props = defineProps<Props>();

function lookupVariant<VariantValueType extends string>(
  selectedValueList: ConcreteTrinketValue[]
): LabeledValue<VariantValueType> | null {
  // No variant - quick abort
  if (props.trinketConfig?.variants === undefined) {
    return null;
  }
  if (props.trinketConfig?.variants === null) {
    return null;
  }
  // Variant
  const completeVariantList: LabeledValue<VariantValueType>[] = props
    .trinketConfig?.variants as LabeledValue<VariantValueType>[];
  // Variant is encoded in issued item list
  const variantEntry: LabeledValue<VariantValueType> | undefined =
    completeVariantList?.find((variant: LabeledValue<VariantValueType>) =>
      selectedValueList.includes(getLocalConcreteTrinketValue(variant))
    );
  if (variantEntry !== undefined) {
    return variantEntry;
  }
  // Variant is given in defaultVariantValue (and not yet issued)
  const defaultVariantValuesValue: string | null | undefined =
    getDefaultVariantValuesValue(
      defaultVariantValuesRef.value,
      props.trinketConfig.value
    );
  if (defaultVariantValuesValue !== undefined) {
    const variantConfig: LabeledValue<VariantValueType> | undefined =
      completeVariantList.find(
        (variantValue: LabeledValue<VariantValueType>) =>
          variantValue.value === defaultVariantValuesValue
      );
    if (variantConfig !== undefined) {
      return variantConfig;
    }
  }
  return null;
}

const selectedVariantRef: Ref<LabeledValue<string> | null> =
  ref<LabeledValue<string> | null>(
    lookupVariant(selectedConcreteTrinketValueListRef.value)
  );

watch(selectedConcreteTrinketValueListRef, (new_value, _old_value) => {
  lookupVariant(new_value);
});

const componentId: string = generateId(useId());
const labelId: string = `itemLabelId${componentId}`;
</script>

<style>
.items-checkbox .p-checkbox {
  width: calc(var(--p-select-dropdown-width) + 1px);
  height: calc(var(--p-select-dropdown-width) + 1px);
}

.items-checkbox .p-checkbox-box {
  width: calc(var(--p-select-dropdown-width) + 1px);
  height: calc(var(--p-select-dropdown-width) + 1px);
}

.items-checkbox .p-checkbox-icon {
  width: calc(var(--p-select-dropdown-width) * 0.75);
  height: calc(var(--p-select-dropdown-width) * 0.75);
}

.items-label {
  font-size: calc(var(--p-select-dropdown-width) * 0.75);
}
</style>
