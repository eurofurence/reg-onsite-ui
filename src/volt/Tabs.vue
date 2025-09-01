<template>
  <Tabs
    :value="props.value"
    unstyled
    :pt="theme"
    :ptOptions="{
      mergeProps: ptViewMerge,
    }"
  >
    <slot></slot>
  </Tabs>
</template>

<script setup lang="ts">
import { ptViewMerge } from "@/volt/utils";
import Tabs, {
  type TabsPassThroughOptions,
  type TabsProps,
} from "primevue/tabs";
import { ref } from "vue";

interface Props extends /* @vue-ignore */ TabsProps {}
const props: Props = defineProps<Props>();

const theme = ref<TabsPassThroughOptions>({
  root: `flex flex-col`,
});
</script>
