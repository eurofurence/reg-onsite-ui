<template>
  <InputMask
    v-model="modelValue"
    @update:modelValue="props.filterCallback()"
    class="p-column-filter"
    placeholder="yyyy-mm-dd"
    mask="9999-99-99"
    slotChar="yyyy-mm-dd"
    :autoClear="false"
  />
</template>

<script setup lang="ts">
import InputMask from "primevue/inputmask";
import type { ModelRef } from "vue";
import type { FilterElementProps } from "@/types/internal/component/table";

const props: FilterElementProps = defineProps<FilterElementProps>();
const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
</script>
