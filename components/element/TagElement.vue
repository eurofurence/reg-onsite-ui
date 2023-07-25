<template>
    <div id="tag">
        <Tag
            :value="property?.label"
            :icon="property?.icon"
            class="border-solid"
            :style="{
                border: '1px var(--text-color)',
                background: `var(--${property?.color})`,
                color: 'white',
            }"
        />
    </div>
</template>

<script setup>
import { computed, unref } from "vue";
import Tag from "primevue/tag";
import { convertListToMap } from "@/composables/convertListToMap";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
const props = defineProps(["configItems"]);
const propertyMap = convertListToMap(props.configItems);
const property = computed({
    get: () => {
        return propertyMap[unref(modelValue.value)];
    },
});
</script>
