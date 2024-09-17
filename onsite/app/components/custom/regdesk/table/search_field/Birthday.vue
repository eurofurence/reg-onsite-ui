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
import type { SearchElementProps } from "@/types/internal";
import { filterComponentRegistry } from "@/composables/state/filterComponentRegistry";

const props: SearchElementProps = defineProps<SearchElementProps>();
const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});

const componentId: string | undefined = useId();
onMounted(
  filterComponentRegistry.onMounted(componentId, props.columnDefinition, () => {
    modelValue.value = "";
  })
);
onBeforeUnmount(
  filterComponentRegistry.onBeforeUnmount(componentId, props.columnDefinition)
);
</script>
