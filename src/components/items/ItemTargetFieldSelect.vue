<template>
  <div class="inline-flex select-none rounded-md">
    <button
      v-for="(opt, i) in options"
      :key="opt.value"
      type="button"
      @click="model = opt.value"
      class="inline-flex items-center justify-center overflow-hidden relative cursor-pointer
             border border-surface-100 dark:border-surface-950
             bg-surface-100 dark:bg-surface-950
             text-sm font-medium p-1
             focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:relative focus-visible:z-10
             transition-colors duration-200"
      :class="[
        i === 0 ? 'rounded-s-md' : i === options.length - 1 ? 'rounded-e-md' : 'rounded-none',
        model === opt.value ? opt.activeText : 'text-surface-500 dark:text-surface-400',
      ]"
    >
      <span
        class="inline-flex items-center justify-center px-3 py-1 rounded-md transition-colors duration-200"
        :class="model === opt.value
          ? [opt.activeBg, 'shadow-[0px_1px_2px_0px_rgba(0,0,0,0.02),0px_1px_2px_0px_rgba(0,0,0,0.04)]']
          : ''"
      >
        {{ opt.label }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
type AddInfoField = "reservedItems" | "pastItems" | "issuedItems";

const model = defineModel<AddInfoField>({ required: true });

const options: { value: AddInfoField; label: string; activeBg: string; activeText: string }[] = [
  {
    value: "reservedItems",
    label: "Reserved",
    activeBg: "bg-green-100 dark:bg-green-900",
    activeText: "text-green-700 dark:text-green-300",
  },
  {
    value: "pastItems",
    label: "Past",
    activeBg: "bg-yellow-100 dark:bg-yellow-900",
    activeText: "text-yellow-700 dark:text-yellow-300",
  },
  {
    value: "issuedItems",
    label: "Issued",
    activeBg: "bg-red-100 dark:bg-red-900",
    activeText: "text-red-700 dark:text-red-300",
  },
];
</script>
