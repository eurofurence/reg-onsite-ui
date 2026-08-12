<template>
  <Fieldset legend="Assign To" class="p-2 flex-1 min-w-0">
    <div class="flex flex-col gap-3">
      <div class="flex gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <RadioButton v-model="targetType" value="regNumbers" inputId="target-reg" />
          <label for="target-reg" class="cursor-pointer">Specific Reg Numbers</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton v-model="targetType" value="goodieLevel" inputId="target-level" />
          <label for="target-level" class="cursor-pointer">Goodie Level</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton v-model="targetType" value="role" inputId="target-role" />
          <label for="target-role" class="cursor-pointer">Role</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton v-model="targetType" value="idpGroup" inputId="target-idp" />
          <label for="target-idp" class="cursor-pointer">IDP Group</label>
        </div>
      </div>

      <div v-if="targetType === 'regNumbers'">
        <label class="text-xs text-surface-500 block mb-1">Reg numbers (comma or newline separated)</label>
        <Textarea v-model="regNumbersInput" placeholder="e.g. 123, 456, 789" rows="3" class="w-full max-w-sm" />
      </div>

      <div v-else-if="targetType === 'goodieLevel'" class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <label class="text-xs text-surface-500">Select goodie levels</label>
          <div class="flex flex-wrap gap-3">
            <div v-for="level in goodieLevels" :key="level.value" class="flex items-center gap-2">
              <Checkbox v-model="selectedGoodieLevels" :value="level.value" :inputId="`level-${level.value}`" />
              <label :for="`level-${level.value}`" class="cursor-pointer">{{ level.label }}</label>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-xs text-surface-500">Filter</label>
          <div class="flex flex-wrap gap-4 items-center">
            <div class="flex items-center gap-2">
              <RadioButton v-model="goodieLevelFilter" value="all" inputId="gf-all" />
              <label for="gf-all" class="cursor-pointer text-sm">All</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton v-model="goodieLevelFilter" value="upToPaymentDate" inputId="gf-date" />
              <label for="gf-date" class="cursor-pointer text-sm">Up to (end of day, Hamburg)</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton v-model="goodieLevelFilter" value="firstNByReg" inputId="gf-reg" />
              <label for="gf-reg" class="cursor-pointer text-sm">First N by reg #</label>
            </div>
            <div class="flex items-center gap-2">
              <RadioButton v-model="goodieLevelFilter" value="firstNByPaymentDate" inputId="gf-pay" />
              <label for="gf-pay" class="cursor-pointer text-sm">First N by payment date</label>
            </div>
          </div>
          <div v-if="goodieLevelFilter === 'upToPaymentDate'" class="flex items-center gap-2 mt-1">
            <label class="text-xs text-surface-500">Up to:</label>
            <DatePicker v-model="goodieLevelFilterDate" dateFormat="yy-mm-dd" showButtonBar class="w-48" />
          </div>
          <div v-if="goodieLevelFilter === 'firstNByReg' || goodieLevelFilter === 'firstNByPaymentDate'" class="flex items-center gap-2 mt-1">
            <label class="text-xs text-surface-500">N:</label>
            <InputNumber v-model="goodieLevelFilterN" :min="1" showButtons buttonLayout="horizontal" inputClass="w-16 text-center" />
          </div>
        </div>
      </div>

      <div v-else-if="targetType === 'role'" class="flex flex-col gap-2">
        <label class="text-xs text-surface-500">Select roles</label>
        <div class="flex flex-wrap gap-3">
          <div v-for="role in conRoles" :key="role.value" class="flex items-center gap-2">
            <Checkbox v-model="selectedRoles" :value="role.value" :inputId="`role-${role.value}`" />
            <label :for="`role-${role.value}`" class="cursor-pointer">{{ role.label }}</label>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-500">IDP group IDs (one per line)</label>
          <Textarea v-model="idpGroupsInput" placeholder="e.g. OE7QZN2RQX9KWML4" rows="3" class="w-full max-w-sm font-mono text-xs" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-surface-500">IDP token</label>
          <InputText v-model="idpToken" type="password" placeholder="Paste IDP access token" class="w-full max-w-sm font-mono text-xs" />
        </div>
      </div>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import Checkbox from "@/volt/Checkbox.vue";
import DatePicker from "@/volt/DatePicker.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputNumber from "@/volt/InputNumber.vue";
import InputText from "@/volt/InputText.vue";
import RadioButton from "@/volt/RadioButton.vue";
import Textarea from "@/volt/Textarea.vue";

type GoodieLevelFilter = "all" | "upToPaymentDate" | "firstNByReg" | "firstNByPaymentDate";

interface Props {
  goodieLevels: { value: string; label: string }[];
  conRoles: { value: string; label: string }[];
}
defineProps<Props>();

const targetType = defineModel<"regNumbers" | "goodieLevel" | "role" | "idpGroup">("targetType", { required: true });
const regNumbersInput = defineModel<string>("regNumbersInput", { required: true });
const selectedGoodieLevels = defineModel<string[]>("selectedGoodieLevels", { required: true });
const selectedRoles = defineModel<string[]>("selectedRoles", { required: true });
const goodieLevelFilter = defineModel<GoodieLevelFilter>("goodieLevelFilter", { required: true });
const goodieLevelFilterDate = defineModel<Date | null>("goodieLevelFilterDate", { required: true });
const goodieLevelFilterN = defineModel<number>("goodieLevelFilterN", { required: true });
const idpGroupsInput = defineModel<string>("idpGroupsInput", { required: true });
const idpToken = defineModel<string>("idpToken", { required: true });
</script>
