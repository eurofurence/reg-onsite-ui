<template>
  <div class="flex flex-grow w-full">
    <Splitter
      stateKey="sponsorSplitter"
      class="border-transparent flex-grow"
      pt:gutter:class="w-1 [background:var(--p-form-field-background)] transition-colors duration-0 hover:[background:var(--p-primary-hover-color)] hover:delay-200"
      v-if="!isNarrow"
    >
      <SplitterPanel :size="25">
        <div class="flex flex-col w-full">
          <RegNumSearchPanel
            :shortcutScopes="props.shortcutScopes"
            @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
          />
          <KeyboardShortcutsMessage>
            <template v-if="$slots.help">
              <slot name="help" />
            </template>
          </KeyboardShortcutsMessage>
        </div>
      </SplitterPanel>
      <SplitterPanel :size="75">
        <div class="flex flex-col w-full">
          <GroupPanel icon="pi-user" label="User Details">
            <div class="flex flex-col gap-1 w-full">
              <slot />
            </div>
          </GroupPanel>
        </div>
      </SplitterPanel>
    </Splitter>
    <div v-else>
      <div class="flex flex-col w-full">
        <RegNumSearchPanel
          :shortcutScopes="props.shortcutScopes"
          @onSearchRegNumber="$emit('onSearchRegNumber', $event)"
        />
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GroupPanel from "@/components/common/GroupPanel.vue";
import KeyboardShortcutsMessage from "@/components/common/KeyboardShortcutsMessage.vue";
import RegNumSearchPanel from "@/components/common/RegNumSearchPanel.vue";
import { setupEventListener } from "@/composables/events/setupEventListener";
import type { ShortcutScope } from "@/composables/services/keyboardService";
import Splitter from "@/volt/Splitter.vue";
import { SplitterPanel } from "primevue";
import { onMounted, ref, type Ref } from "vue";

const isNarrow: Ref<boolean> = ref<boolean>(false);

function updateWidth(): void {
  const threshold: number = 640;
  isNarrow.value = window.innerWidth < threshold;
}

interface Props {
  shortcutScopes: ShortcutScope[];
}
const props: Props = defineProps<Props>();

setupEventListener(window, "resize", updateWidth);
onMounted(updateWidth);

defineEmits(["onSearchRegNumber"]);
</script>
