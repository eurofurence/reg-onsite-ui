<template>
  <div class="flex flex-grow gap-2 items-center justify-between">
    <div class="flex flex-grow items-center h-12">
      <div class="items-checkbox">
        <Checkbox
          :modelValue="isCheckedRef"
          @update:modelValue="toggleChecked"
          binary
          class="w-10 h-10"
          pt:root:class="w-10 h-10"
          pt:box:class="w-10 h-10 transform scale-110"
          :name="props.itemGroupId"
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
            <ItemOption
              v-model="props.goodieConfig"
              :goodieConfig="props.goodieConfig"
              :unitIndex="props.unitIndex"
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
        class="w-80"
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
            <ItemOption
              v-model="slotProps.value"
              :goodieConfig="props.goodieConfig"
              :unitIndex="props.unitIndex"
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
          <ItemOption
            v-model="slotProps.option"
            :goodieConfig="props.goodieConfig"
            :unitIndex="props.unitIndex"
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
import { fieldTextCSS } from "@/components/common/field/common/common";
import ItemOption from "@/components/sponsordesk/ItemOption.vue";
import { generateId } from "@/composables/generateId";
import { findNthOccurrenceIndex } from "@/composables/items/findNthOccurrenceIndex";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getDefaultVariantValuesValue } from "@/composables/items/getDefaultVariantValuesValue";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import type { SponsorDeskSettings } from "@/types/internal/system/sponsordesk";
import type { FontSize } from "@/types/internal/system/theme";
import Checkbox from "@/volt/Checkbox.vue";
import Select from "@/volt/Select.vue";
import type { SelectChangeEvent } from "primevue/select";
import { computed, type ComputedRef, type ModelRef, ref, type Ref, useId, watch } from "vue";

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
  const list = selectedConcreteGoodieValueListRef.value;
  const idx = findNthOccurrenceIndex(list, props.goodieConfig, props.unitIndex);
  if (idx === -1) {
    // Row isn't checked yet - the new variant takes effect once it is.
    return;
  }
  const newConcreteValue: ConcreteGoodieValue = getLocalConcreteGoodieValue(
    selectedVariantRef.value
  );
  const newList = [...list];
  newList[idx] = newConcreteValue;
  selectedConcreteGoodieValueListRef.value = newList;
}

const isCheckedRef: ComputedRef<boolean> = computed<boolean>(
  () =>
    findNthOccurrenceIndex(
      selectedConcreteGoodieValueListRef.value,
      props.goodieConfig,
      props.unitIndex
    ) !== -1
);

function toggleChecked(checked: boolean): void {
  const list = selectedConcreteGoodieValueListRef.value;
  const idx = findNthOccurrenceIndex(list, props.goodieConfig, props.unitIndex);
  if (checked) {
    if (idx !== -1) {
      return;
    }
    selectedConcreteGoodieValueListRef.value = [
      ...list,
      getLocalConcreteGoodieValue(selectedVariantRef.value),
    ];
  } else {
    if (idx === -1) {
      return;
    }
    selectedConcreteGoodieValueListRef.value = [
      ...list.slice(0, idx),
      ...list.slice(idx + 1),
    ];
  }
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
  unitIndex: number;
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
  // Variant is encoded in this row's occurrence of the issued item list
  const idx = findNthOccurrenceIndex(
    selectedValueList,
    props.goodieConfig,
    props.unitIndex
  );
  if (idx !== -1) {
    const concreteValue = selectedValueList[idx];
    const variantEntry: LabeledValue<VariantValueType> | undefined =
      completeVariantList?.find(
        (variant: LabeledValue<VariantValueType>) =>
          getLocalConcreteGoodieValue(variant) === concreteValue
      );
    if (variantEntry !== undefined) {
      return variantEntry;
    }
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

watch(
  selectedConcreteGoodieValueListRef,
  (new_value: ConcreteGoodieValue[], _old_value: ConcreteGoodieValue[]) => {
    selectedVariantRef.value = lookupVariant(new_value);
  }
);

const componentId: string = generateId(useId());
const labelId: string = `itemLabelId${componentId}`;
</script>
