<template>
  <div class="flex gap-2 items-end flex-wrap">
    <div class="flex flex-col gap-1">
      <label class="text-xs text-surface-500">Iteration</label>
      <Select
        v-model="selectedIterationLabel"
        :options="iterations"
        optionLabel="label"
        optionValue="label"
        placeholder="Select iteration"
        class="w-32"
        @change="onIterationChange"
      />
    </div>
    <div v-if="currentGoodies" class="flex flex-col gap-1">
      <label class="text-xs text-surface-500">Item</label>
      <Select
        v-model="abstractItem"
        :options="currentGoodies"
        :optionLabel="abstractItemLabel"
        placeholder="Select item"
        class="w-72"
        filter
        @change="variant = null"
      />
    </div>
    <div v-if="abstractItem?.variants" class="flex flex-col gap-1">
      <label class="text-xs text-surface-500">Variant</label>
      <Select
        v-model="variant"
        :options="variantOptions"
        :optionLabel="variantLabel"
        placeholder="Select variant"
        class="w-64"
      />
    </div>
    <Button
      @click="emitAdd"
      :disabled="!canAdd"
      icon="pi pi-plus"
      label="Add"
    />
  </div>
</template>

<script setup lang="ts">
import { getMetadataEntryListFromRecord } from "@/composables/collection_tools/metadata/getMetadataEntryListFromRecord";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { FROM_SIZE_VARIANT_VALUE } from "@/composables/items/fromSizeUtils";
import { conventionIterations, type ConcreteGoodieValue, type GoodieConfig } from "@/config/convention";
import type { LabeledValue } from "@/types/internal/infos";
import Button from "@/volt/Button.vue";
import Select from "@/volt/Select.vue";
import { computed, ref, type Ref } from "vue";

interface IterationInfo {
  label: string;
  goodies: GoodieConfig[];
}

const iterations: IterationInfo[] = conventionIterations.map((iteration) => ({
  label: iteration.label,
  goodies: getMetadataEntryListFromRecord(iteration.record) as GoodieConfig[],
}));

const selectedIterationLabel: Ref<string | null> = ref(null);
const currentGoodies = computed<GoodieConfig[] | null>(() =>
  iterations.find((i) => i.label === selectedIterationLabel.value)?.goodies ?? null
);
const abstractItem: Ref<GoodieConfig | null> = ref(null);
const variant: Ref<LabeledValue<string> | null> = ref(null);

function onIterationChange(): void {
  abstractItem.value = null;
  variant.value = null;
}

const FROM_SIZE_OPTION: LabeledValue<string> = {
  value: FROM_SIZE_VARIANT_VALUE,
  label: "From T-Shirt Size",
};

const abstractItemLabel = (g: GoodieConfig): string => `${g.label} (${g.value})`;

const variantOptions = computed<LabeledValue<string>[]>(() => {
  const variants = abstractItem.value?.variants ?? [];
  if (String(abstractItem.value?.value ?? "").startsWith("tshirt")) {
    return [FROM_SIZE_OPTION, ...variants];
  }
  return variants;
});

const variantLabel = (v: LabeledValue<string>): string => {
  if (v.value === FROM_SIZE_VARIANT_VALUE) return "From T-Shirt Size";
  return `${v.label} (${abstractItem.value?.value}_${v.value})`;
};

const canAdd = computed(() => {
  if (!abstractItem.value) return false;
  if (abstractItem.value.variants && !variant.value) return false;
  return true;
});

const emit = defineEmits<{ add: [item: ConcreteGoodieValue] }>();

function emitAdd(): void {
  if (!canAdd.value || !abstractItem.value) return;
  emit("add", getConcreteItemValue(abstractItem.value, variant.value));
  abstractItem.value = null;
  variant.value = null;
}
</script>
