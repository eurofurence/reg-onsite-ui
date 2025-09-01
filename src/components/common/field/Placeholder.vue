<template>
  <div class="m-px">
    <Skeleton :width="props.width" height="3rem" :id="props.labelId" />
  </div>
</template>

<script setup lang="ts">
import Skeleton from "@/volt/Skeleton.vue";

interface Props {
  width?: string;
  labelId: string;
}
const props: Props = defineProps<Props>();
</script>
