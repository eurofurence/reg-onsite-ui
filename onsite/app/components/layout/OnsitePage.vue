<template>
  <div class="flex flex-col h-screen">
    <div class="p-px">
      <HeaderLoginPanel :title="props.title" :theming="props.theming">
        <template #help v-if="$slots.help">
          <slot name="help"></slot>
        </template>
      </HeaderLoginPanel>
    </div>
    <div class="pt-1 flex flex-grow" v-if="authState.sessionActive">
      <slot></slot>
    </div>
    <div class="p-px">
      <PanelDebug />
    </div>
  </div>
</template>

<script setup lang="ts">
import { authState } from "@/composables/state/authState";

interface Props {
  title: string;
  theming?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  theming: true,
});
</script>
