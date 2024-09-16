<template>
  <div class="flex flex-rows">
    <img
      class="header-logo"
      src="/logo.png"
      @click="onLogoClick"
      v-tooltip="{
        value: versionInfo,
        showDelay: 2000,
        hideDelay: 300,
      }"
    />
    <span class="header-title">{{ props.title }}</span>
  </div>
</template>

<script setup lang="ts">
import { version } from "@/config/buildInfo";
const versionInfo: string = `Version: ${version}`;

function onLogoClick(): void {
  emit("on-logo-click");
}

interface Props {
  title: string;
}

const props: Props = defineProps<Props>();
const emit: CallableFunction = defineEmits(["on-logo-click"]);
</script>

<style>
.header-logo {
  padding-right: calc(var(--header-size) * 10px);
  height: calc(var(--header-size) * 50px);
}

.header-title {
  font-size: calc(var(--header-size) * 30px);
  font-weight: bold;
}
</style>
