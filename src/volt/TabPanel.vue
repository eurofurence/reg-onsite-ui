<template>
  <TabPanel
    :value="props.value"
    unstyled
    :pt="theme"
    :ptOptions="{
      mergeProps: ptViewMerge,
    }"
  >
    <slot></slot>
  </TabPanel>
</template>

<script setup lang="ts">
import { ptViewMerge } from "@/volt/utils";
import TabPanel, {
  type TabPanelPassThroughOptions,
  type TabPanelProps,
} from "primevue/tabpanel";
import { ref } from "vue";

interface Props extends /* @vue-ignore */ TabPanelProps {}
const props: Props = defineProps<Props>();

const theme = ref<TabPanelPassThroughOptions>({
  root: ``,
});
</script>
