<script setup lang="ts">
import AutoComplete from '@/volt/AutoComplete.vue'
import Button from '@/volt/Button.vue'
import Select from '@/volt/Select.vue'
import { computed, ref, watch } from 'vue'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import { badgeMappingRef, badgeTypesRef, saveBadgeConfig } from '@/composables/services/badgeConfigStore'
import { getValidBadgeMappingFlags, getValidBadgeMappingPackages } from '@/composables/badge/getValidBadgeMappingValues'
import { NO_FLAG, mappingKey } from '@/types/badgeMapping'
import type { AutoCompleteCompleteEvent } from 'primevue/autocomplete'

const props = defineProps<{ errorHandler: RestErrorHandler }>()

const mapping = badgeMappingRef
const newPackageValue = ref('')
const newFlagValue = ref('')
const packageSuggestions = ref<string[]>([])
const flagSuggestions = ref<string[]>([])

watch(mapping, () => {
  saveBadgeConfig(props.errorHandler)
}, { deep: true })

const validPackages = getValidBadgeMappingPackages()
const validFlags = getValidBadgeMappingFlags()

function addPackage() {
  const parts = newPackageValue.value.split(',').map(v => v.trim()).filter(Boolean)
  if (!parts.length) return
  const combined = parts.sort((a, b) => a.localeCompare(b)).join(',')
  if (mapping.value.packages.includes(combined)) return
  if (!validPackages.includes(combined)) return
  mapping.value.packages.push(combined)
  newPackageValue.value = ''
}

function addFlag() {
  const parts = newFlagValue.value.split(',').map(v => v.trim()).filter(Boolean)
  if (!parts.length) return
  const combined = parts.sort((a, b) => a.localeCompare(b)).join(',')
  if (mapping.value.flags.includes(combined)) return
  if (!parts.every(p => validFlags.includes(p))) return
  mapping.value.flags.push(combined)
  newFlagValue.value = ''
}

function onPackageComplete(event: AutoCompleteCompleteEvent) {
  const q = event.query.toLowerCase()
  const all = validPackages.filter(c => !mapping.value.packages.includes(c))
  packageSuggestions.value = q ? all.filter(c => c.toLowerCase().includes(q)) : all
}

function onFlagComplete(event: AutoCompleteCompleteEvent) {
  const q = event.query.toLowerCase()
  const all = validFlags.filter(c => !mapping.value.flags.includes(c))
  flagSuggestions.value = q ? all.filter(c => c.toLowerCase().includes(q)) : all
}

function removePackage(packageValue: string) {
  mapping.value.packages = mapping.value.packages.filter((value) => value !== packageValue)
  for (const flagValue of mapping.value.flags) {
    delete mapping.value.rules[mappingKey(packageValue, flagValue)]
  }
}

function removeFlag(flagValue: string) {
  if (flagValue === NO_FLAG) {
    return
  }
  mapping.value.flags = mapping.value.flags.filter((value) => value !== flagValue)
  for (const packageValue of mapping.value.packages) {
    delete mapping.value.rules[mappingKey(packageValue, flagValue)]
  }
}

const sortedPackages = computed(() => [...mapping.value.packages].sort((a, b) => a.localeCompare(b)))

function ruleFor(packageValue: string, flagValue: string) {
  return mapping.value.rules[mappingKey(packageValue, flagValue)] ?? ''
}

function setRule(packageValue: string, flagValue: string, badgeTypeId: string) {
  mapping.value.rules[mappingKey(packageValue, flagValue)] = badgeTypeId
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8">
    <div class="flex gap-6">
      <div class="flex items-center gap-2">
        <AutoComplete
          v-model="newPackageValue"
          :suggestions="packageSuggestions"
          placeholder="Package or pkg1,pkg2,..."
          @complete="onPackageComplete"
          @item-select="addPackage"
          @keyup.enter="addPackage"
        />
        <Button label="Add Package" size="small" @click="addPackage" />
      </div>
      <div class="flex items-center gap-2">
        <AutoComplete
          v-model="newFlagValue"
          :suggestions="flagSuggestions"
          placeholder="Flag or flag1,flag2,..."
          @complete="onFlagComplete"
          @item-select="addFlag"
          @keyup.enter="addFlag"
        />
        <Button label="Add Flag" size="small" @click="addFlag" />
      </div>
    </div>

    <p v-if="mapping.packages.length === 0" class="text-sm text-slate-500">
      Add at least one package to configure the mapping grid.
    </p>

    <table v-else class="text-sm text-slate-700">
      <thead>
        <tr class="text-left text-slate-500">
          <th class="pr-4 font-normal"></th>
          <th v-for="flagValue in mapping.flags" :key="flagValue" class="pr-4 pb-2 font-normal">
            <div class="flex items-center gap-1">
              {{ flagValue }}
              <Button
                v-if="flagValue !== NO_FLAG"
                text
                size="small"
                severity="danger"
                aria-label="Remove flag"
                icon="pi pi-trash"
                @click="removeFlag(flagValue)"
              />
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="packageValue in sortedPackages" :key="packageValue">
          <td class="pr-4 py-1">
            <div class="flex items-center gap-1">
              {{ packageValue }}
              <Button text size="small" severity="danger" aria-label="Remove package" icon="pi pi-trash" @click="removePackage(packageValue)" />
            </div>
          </td>
          <td v-for="flagValue in mapping.flags" :key="flagValue" class="pr-4">
            <Select
              :model-value="ruleFor(packageValue, flagValue)"
              :options="badgeTypesRef"
              option-label="name"
              option-value="id"
              show-clear
              placeholder="None"
              class="w-48"
              @update:model-value="(value: string | null) => setRule(packageValue, flagValue, value ?? '')"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
