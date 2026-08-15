<template>
  <Fieldset legend="Items to Assign" class="p-2 flex-1 min-w-0">
    <div class="flex flex-col gap-3">
      <div class="flex gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <RadioButton v-model="itemsMode" value="manual" inputId="items-manual" />
          <label for="items-manual" class="cursor-pointer">Manual</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton v-model="itemsMode" value="package" inputId="items-package" />
          <label for="items-package" class="cursor-pointer">For Package</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton v-model="itemsMode" value="flag" inputId="items-flag" />
          <label for="items-flag" class="cursor-pointer">For Flag</label>
        </div>
      </div>

      <template v-if="itemsMode === 'manual'">
        <ItemConcreteGoodiePicker @add="addItemToList" />
        <div v-if="assignItems.length === 0" class="text-surface-400 text-sm">No items selected yet.</div>
        <div v-else class="flex flex-wrap gap-2">
          <div
            v-for="item in assignItems"
            :key="item"
            class="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded px-2 py-1 text-sm"
          >
            <span>{{ getItemDisplayLabel(item) }} <span class="text-surface-400 text-xs">({{ getItemDisplayInternal(item) }})</span></span>
            <button @click="removeItem(item)" class="ml-1 text-surface-400 hover:text-red-500">
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex gap-2 flex-wrap items-end">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-surface-500">Iteration</label>
            <Select v-model="currentIterLabel" :options="iterationsWithGoodies" optionLabel="label" optionValue="label" class="w-32" @change="onIterationChange" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-surface-500">{{ itemsMode === 'package' ? 'Package' : 'Flag' }}</label>
            <Select v-model="currentKey" :options="currentKeyOptions" optionLabel="label" optionValue="value" placeholder="Select..." class="w-48" :disabled="currentKeyOptions.length === 0" />
          </div>
        </div>
        <div v-if="currentAbstractItems.length > 0" class="flex flex-col gap-1.5">
          <div v-for="abstractValue in currentAbstractItems" :key="abstractValue" class="flex items-center gap-2 text-sm">
            <span class="font-medium">{{ getItemLabel(abstractValue) }}</span>
            <span class="text-muted-color text-xs">({{ abstractValue }})</span>
            <template v-if="getItemConfig(abstractValue)?.variants">
              <Select
                :modelValue="getVariantModelValue(abstractValue)"
                @update:modelValue="(v: string | null) => setVariant(abstractValue, v)"
                :options="getVariantOptions(abstractValue)"
                optionLabel="label"
                optionValue="value"
                class="w-48 ml-auto"
              />
            </template>
            <span v-else class="pi pi-check text-green-500 text-xs ml-auto" />
          </div>
        </div>
        <div v-else class="text-surface-400 text-sm">
          {{ currentKey ? 'No items for this selection.' : `Select an iteration and ${itemsMode === 'package' ? 'package level' : 'flag'}.` }}
        </div>
      </template>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import ItemConcreteGoodiePicker from "@/components/items/ItemConcreteGoodiePicker.vue";
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import { getGoodieLabel } from "@/composables/items/getGoodieLabel";
import { FROM_SIZE_SUFFIX, FROM_SIZE_VARIANT_VALUE, isFromSizeItem } from "@/composables/items/fromSizeUtils";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { conventionIterations, currentIterationLabel, type ConcreteGoodieValue } from "@/config/convention";
import Fieldset from "@/volt/Fieldset.vue";
import RadioButton from "@/volt/RadioButton.vue";
import Select from "@/volt/Select.vue";
import { useLocalStorage } from "@vueuse/core";
import { computed, watch } from "vue";

const goodieLevels = getConventionSetup().metadata.forGoodiesLevels.list;
const conRoles = getConventionSetup().metadata.forConRole.list.filter((r) => r.value !== "<no_flag>");
const goodiesRecord = getConventionSetup().metadata.forAbstractGoodies.record;

const iterationsWithGoodies = conventionIterations;

type ItemsMode = "manual" | "package" | "flag";
const itemsMode = useLocalStorage<ItemsMode>("item-assign-items-mode", "manual");
const pkgIter = useLocalStorage<string | null>("item-assign-pkg-iter", currentIterationLabel);
const pkgKey = useLocalStorage<string | null>("item-assign-pkg-key", null);
const flagIter = useLocalStorage<string | null>("item-assign-flag-iter", currentIterationLabel);
const flagKey = useLocalStorage<string | null>("item-assign-flag-key", null);
const pkgVariants = useLocalStorage<Record<string, string | null>>("item-assign-pkg-variants", {});
const flagVariants = useLocalStorage<Record<string, string | null>>("item-assign-flag-variants", {});

const currentIterLabel = computed<string | null>({
  get: () => itemsMode.value === "package" ? pkgIter.value : flagIter.value,
  set: (v) => { if (itemsMode.value === "package") pkgIter.value = v; else flagIter.value = v; },
});
const currentKey = computed<string | null>({
  get: () => itemsMode.value === "package" ? pkgKey.value : flagKey.value,
  set: (v) => { if (itemsMode.value === "package") pkgKey.value = v; else flagKey.value = v; },
});
const currentKeyOptions = computed(() => {
  const iter = iterationsWithGoodies.find((i) => i.label === currentIterLabel.value);
  if (!iter) return [];
  const source = itemsMode.value === "package" ? iter.settings.goodies.forPackage : iter.settings.goodies.forFlag;
  return Object.keys(source).map((key) => ({
    value: key,
    label: itemsMode.value === "package"
      ? (goodieLevels.find((l) => l.value === key)?.label ?? key)
      : (conRoles.find((r) => r.value === key)?.label ?? key),
  }));
});
const currentAbstractItems = computed<string[]>(() => {
  const iter = iterationsWithGoodies.find((i) => i.label === currentIterLabel.value);
  if (!iter || !currentKey.value) return [];
  const source = itemsMode.value === "package" ? iter.settings.goodies.forPackage : iter.settings.goodies.forFlag;
  return (source[currentKey.value as keyof typeof source] ?? []) as string[];
});

function getItemConfig(abstractValue: string) {
  return (goodiesRecord as Record<string, { label: string; variants?: { value: string; label: string }[] | null }>)[abstractValue] ?? null;
}
function getItemLabel(abstractValue: string): string {
  return getItemConfig(abstractValue)?.label ?? getGoodieLabel(abstractValue as ConcreteGoodieValue);
}
function getItemDisplayInternal(item: ConcreteGoodieValue): string {
  if (isFromSizeItem(item)) return item.slice(0, -FROM_SIZE_SUFFIX.length) + ".*";
  return item;
}
function setVariant(abstractValue: string, variantValue: string | null): void {
  if (itemsMode.value === "package") pkgVariants.value = { ...pkgVariants.value, [abstractValue]: variantValue };
  else flagVariants.value = { ...flagVariants.value, [abstractValue]: variantValue };
}
function isTshirtAbstract(abstractValue: string): boolean { return String(abstractValue).startsWith("tshirt"); }
function getVariantOptions(abstractValue: string): { value: string; label: string }[] {
  const config = getItemConfig(abstractValue);
  if (!config?.variants) return [];
  const base = config.variants as { value: string; label: string }[];
  return isTshirtAbstract(abstractValue) ? [{ value: FROM_SIZE_VARIANT_VALUE, label: "From T-Shirt Size" }, ...base] : base;
}
function getVariantModelValue(abstractValue: string): string | null {
  const variants = itemsMode.value === "package" ? pkgVariants.value : flagVariants.value;
  const stored = variants[abstractValue];
  if (stored !== undefined && stored !== null) return stored;
  return isTshirtAbstract(abstractValue) ? FROM_SIZE_VARIANT_VALUE : null;
}
function onIterationChange(): void { currentKey.value = null; }

const assignItems = useLocalStorage<ConcreteGoodieValue[]>("item-assign-items", []);

const activeItems = computed<ConcreteGoodieValue[]>(() => {
  if (itemsMode.value === "manual") return assignItems.value;
  const variants = itemsMode.value === "package" ? pkgVariants.value : flagVariants.value;
  return currentAbstractItems.value.reduce<ConcreteGoodieValue[]>((acc, abstractValue) => {
    const config = getItemConfig(abstractValue);
    if (!config?.variants) {
      acc.push(abstractValue as ConcreteGoodieValue);
    } else {
      const variantVal = variants[abstractValue] ?? (isTshirtAbstract(abstractValue) ? FROM_SIZE_VARIANT_VALUE : null);
      if (variantVal) acc.push(`${abstractValue}_${variantVal}` as ConcreteGoodieValue);
    }
    return acc;
  }, []);
});

// Publish activeItems to parent via v-model
const activeItemsModel = defineModel<ConcreteGoodieValue[]>({ required: true });
watch(activeItems, (v) => { activeItemsModel.value = v; }, { immediate: true });

function addItemToList(item: ConcreteGoodieValue): void {
  if (!assignItems.value.includes(item)) assignItems.value.push(item);
}
function removeItem(item: ConcreteGoodieValue): void {
  assignItems.value = assignItems.value.filter((i) => i !== item);
}
</script>
