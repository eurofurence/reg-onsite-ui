<template>
  <div class="m-px">
    <Skeleton :width="props.width" height="2.5rem" :id="props.labelId" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  width?: string;
  labelId: string;
}
const props: Props = defineProps<Props>();
</script>
