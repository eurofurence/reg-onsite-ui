<template>
    <div id="customFieldSet">
        <Fieldset>
            <template #legend>
                <div class="flex align-items-center text-primary">
                    <span class="pi mr-2" :class="icon"> </span>
                    <span class="font-bold text-lg">{{ label }}</span>
                </div>
            </template>
            <slot />
        </Fieldset>
    </div>
</template>

<script setup>
import Fieldset from "primevue/fieldset";

const props = defineProps(["label", "icon"]);

import { debugState } from "@/components/debug";
debugState[`CustomFieldsetElement-${Math.random()}`] = props;
</script>

<style>
#customFieldSet > .p-fieldset .p-fieldset-legend {
    padding: 0.5em;
}

#customFieldSet > .p-fieldset .p-fieldset-content {
    padding: 0.25em;
}
</style>
