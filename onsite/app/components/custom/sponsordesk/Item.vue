<template>
  <div class="flex flex-grow gap-2 items-center justify-between">
    <div class="flex flex-grow items-center">
      <div class="items-checkbox">
        <Checkbox
          v-model="selectedConcreteGoodieValueListRef"
          :name="props.itemGroupId"
          :value="getLocalConcreteGoodieValue(selectedVariantRef)"
          :inputId="labelId"
          :disabled="isCheckboxDisabled()"
        />
      </div>
      <div class="items-label">
        <label :class="fieldTextCSS" class="ml-2 checkbox-label" :for="labelId">
          <span class="text-nowrap" v-if="props.goodieConfig?.variants">
            <i class="invisible pi pi-circle" />
            {{ props.goodieConfig.label }}
          </span>
          <span v-else>
            <CustomSponsordeskItemOption
              v-model="props.goodieConfig"
              :goodieConfig="props.goodieConfig"
              :defaultValue="defaultVariantValuesRef"
              :issuedConcreteGoodies="selectedConcreteGoodieValueListRef"
              :reservedConcreteGoodies="reservedConcreteGoodieValueListRef"
              :availableConcreteGoodies="sponsorDeskSettingsRef.available"
            />
          </span>
        </label>
      </div>
    </div>
    <div>
      <Select
        class="w-64"
        v-if="props.goodieConfig?.variants"
        v-model="selectedVariantRef"
        :options="props.goodieConfig.variants"
        :scrollHeight="getSelectHeight()"
        placeholder="Nothing selected"
        @change="onVariantChange"
        :invalid="selectedVariantRef === null"
      >
        <template #value="slotProps">
          <div v-if="slotProps.value">
            <CustomSponsordeskItemOption
              v-model="slotProps.value"
              :goodieConfig="props.goodieConfig"
              :defaultValue="defaultVariantValuesRef"
              :issuedConcreteGoodies="selectedConcreteGoodieValueListRef"
              :reservedConcreteGoodies="reservedConcreteGoodieValueListRef"
              :availableConcreteGoodies="sponsorDeskSettingsRef.available"
            />
          </div>
          <div v-else>
            {{ slotProps.placeholder }}
          </div>
        </template>
        <template #option="slotProps">
          <CustomSponsordeskItemOption
            v-model="slotProps.option"
            :goodieConfig="props.goodieConfig"
            :defaultValue="defaultVariantValuesRef"
            :issuedConcreteGoodies="selectedConcreteGoodieValueListRef"
            :reservedConcreteGoodies="reservedConcreteGoodieValueListRef"
            :availableConcreteGoodies="sponsorDeskSettingsRef.available"
          />
        </template>
      </Select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fieldTextCSS } from "@/components/field/common/common";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getDefaultVariantValuesValue } from "@/composables/items/getDefaultVariantValuesValue";
import type { SelectChangeEvent } from "primevue/select";
import type { ModelRef } from "vue";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { FontSize } from "@/types/internal/system/theme";

function getSelectHeight(): string {
  if (!props.goodieConfig?.variants) {
    return "1rem";
  }
  const showItems: number = Math.min(props.goodieConfig.variants.length, 10);
  const selectHeight: FontSize = (showItems * 2.5) as FontSize;
  return `${selectHeight}rem`;
}

function isCheckboxDisabled(): boolean {
  return (
    props.goodieConfig?.variants !== undefined &&
    selectedVariantRef.value === null
  );
}

function onVariantChange(_event: SelectChangeEvent): void {
  const concreteValue: ConcreteGoodieValue = getLocalConcreteGoodieValue(
    selectedVariantRef.value
  );
  // Remove any existing concrete values belonging to this abstract item
  const concreteValueList = selectedConcreteGoodieValueListRef.value.filter(
    (value: ConcreteGoodieValue) =>
      !value.startsWith(`${props.goodieConfig.value}_`)
  );
  // If the list is shorter after the removal - add the new concrete value back
  const hasSelectedVariant =
    selectedConcreteGoodieValueListRef.value.length != concreteValueList.length;
  if (hasSelectedVariant) {
    concreteValueList.push(concreteValue);
  }
  selectedConcreteGoodieValueListRef.value = concreteValueList;
}

function getLocalConcreteGoodieValue<VariantType>(
  selectedVariant: LabeledValue<VariantType> | null
): ConcreteGoodieValue {
  return getConcreteItemValue(props.goodieConfig, selectedVariant);
}

const selectedConcreteGoodieValueListRef: ModelRef<ConcreteGoodieValue[]> =
  defineModel<ConcreteGoodieValue[]>({
    required: true,
  });

const reservedConcreteGoodieValueListRef: ModelRef<ConcreteGoodieValue[]> =
  defineModel<ConcreteGoodieValue[]>("reservedItems", {
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
  goodieConfig: GoodieConfig;
}
const props: Props = defineProps<Props>();

function lookupVariant<VariantValueType extends string>(
  selectedValueList: ConcreteGoodieValue[]
): LabeledValue<VariantValueType> | null {
  // No variant - quick abort
  if (props.goodieConfig?.variants === undefined) {
    return null;
  }
  if (props.goodieConfig?.variants === null) {
    return null;
  }
  // Variant
  const completeVariantList: LabeledValue<VariantValueType>[] = props
    .goodieConfig?.variants as LabeledValue<VariantValueType>[];
  // Variant is encoded in issued item list
  const variantEntry: LabeledValue<VariantValueType> | undefined =
    completeVariantList?.find((variant: LabeledValue<VariantValueType>) =>
      selectedValueList.includes(getLocalConcreteGoodieValue(variant))
    );
  if (variantEntry !== undefined) {
    return variantEntry;
  }
  // Variant is given in defaultVariantValue (and not yet issued)
  const defaultVariantValuesValue: string | null | undefined =
    getDefaultVariantValuesValue(
      defaultVariantValuesRef.value,
      props.goodieConfig.value
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
    lookupVariant(selectedConcreteGoodieValueListRef.value)
  );

watch(selectedConcreteGoodieValueListRef, (new_value, _old_value) => {
  lookupVariant(new_value);
});

const componentId: string = generateId(useId());
const labelId: string = `itemLabelId${componentId}`;
</script>

<style lang="css">
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
