<template>
  <Fieldset legend="Assignment" class="p-2">
    <div class="flex flex-col gap-3">
      <div class="flex gap-2 items-center">
        <span class="text-xs text-surface-500 mr-1">Mode:</span>
        <SelectButton
          v-model="inputMode"
          :options="inputModeOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <template v-if="inputMode === 'standard'">
        <div class="flex gap-4">
          <ItemSourcePanel v-model="activeItems" />
          <ItemTargetPanel
            v-model:targetType="targetType"
            v-model:regNumbersInput="regNumbersInput"
            v-model:selectedGoodieLevels="selectedGoodieLevels"
            v-model:selectedRoles="selectedRoles"
            v-model:goodieLevelFilter="goodieLevelFilter"
            v-model:goodieLevelFilterDate="goodieLevelFilterDate"
            v-model:goodieLevelFilterN="goodieLevelFilterN"
            v-model:idpGroupsInput="idpGroupsInput"
            v-model:idpToken="idpToken"
            :goodieLevels="goodieLevels"
            :conRoles="conRoles"
          />
        </div>
      </template>

      <template v-else>
        <ItemRawInputTable v-model="rawRows" />
      </template>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import ItemRawInputTable, { type RawRow } from "@/components/items/ItemRawInputTable.vue";
import ItemSourcePanel from "@/components/items/ItemSourcePanel.vue";
import ItemTargetPanel from "@/components/items/ItemTargetPanel.vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { ConcreteGoodieValue } from "@/config/convention";
import Fieldset from "@/volt/Fieldset.vue";
import SelectButton from "@/volt/SelectButton.vue";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";

export type InputMode = "standard" | "raw";
export type GoodieLevelFilter = "all" | "upToPaymentDate" | "firstNByReg" | "firstNByPaymentDate";

export interface InputConfig {
  inputMode: InputMode;
  activeItems: ConcreteGoodieValue[];
  rawRows: RawRow[];
  targetType: "regNumbers" | "goodieLevel" | "role" | "idpGroup";
  regNumbersInput: string;
  selectedGoodieLevels: string[];
  selectedRoles: string[];
  goodieLevelFilter: GoodieLevelFilter;
  goodieLevelFilterDate: Date | null;
  goodieLevelFilterN: number;
  idpGroupsInput: string;
  idpToken: string;
}

const inputModeOptions = [
  { label: "Standard", value: "standard" },
  { label: "Raw Input", value: "raw" },
];

const goodieLevels = getConventionSetup().metadata.forGoodiesLevels.list;
const conRoles = getConventionSetup().metadata.forConRole.list.filter((r) => r.value !== "<no_flag>");

const inputMode = useLocalStorage<InputMode>("item-assign-input-mode", "standard");
const activeItems = ref<ConcreteGoodieValue[]>([]);
const rawRows = ref<RawRow[]>([]);

const targetType = useLocalStorage<"regNumbers" | "goodieLevel" | "role" | "idpGroup">("item-assign-target-type", "regNumbers");
const regNumbersInput = useLocalStorage<string>("item-assign-reg-numbers", "");
const selectedGoodieLevels = useLocalStorage<string[]>("item-assign-goodie-levels", []);
const selectedRoles = useLocalStorage<string[]>("item-assign-roles", []);
const idpGroupsInput = useLocalStorage<string>("item-assign-idp-groups", "", {
  serializer: { read: (v: string) => (v.startsWith("[") ? "" : v), write: (v: string) => v },
});
const idpToken = ref<string>("");

const goodieLevelFilter = useLocalStorage<GoodieLevelFilter>("item-assign-goodie-filter", "all");
const goodieLevelFilterDate = useLocalStorage<Date | null>("item-assign-goodie-filter-date", null, {
  serializer: { read: (v: string) => (v ? new Date(v) : null), write: (v: Date | null) => (v ? v.toISOString() : "") },
});
const goodieLevelFilterN = useLocalStorage<number>("item-assign-goodie-filter-n", 10);

const config = computed<InputConfig>(() => ({
  inputMode: inputMode.value,
  activeItems: activeItems.value,
  rawRows: rawRows.value,
  targetType: targetType.value,
  regNumbersInput: regNumbersInput.value,
  selectedGoodieLevels: selectedGoodieLevels.value,
  selectedRoles: selectedRoles.value,
  goodieLevelFilter: goodieLevelFilter.value,
  goodieLevelFilterDate: goodieLevelFilterDate.value,
  goodieLevelFilterN: goodieLevelFilterN.value,
  idpGroupsInput: idpGroupsInput.value,
  idpToken: idpToken.value,
}));

defineExpose({ config });
</script>
