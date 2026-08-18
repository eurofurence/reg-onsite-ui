<template>
  <div class="relative">
    <i
      v-tooltip.bottom="isExact ? 'Exact match (↵ to switch)' : 'Contains (↵ for exact match)'"
      :class="['pi absolute top-1/2 -mt-2 leading-none start-2 z-1 cursor-pointer', isExact ? 'pi-equals text-primary' : 'pi-search text-surface-400']"
      @click="onEnter"
    />
    <AutoComplete
      v-if="(autoCompleteDataRef?.length || -1) > 0"
      v-model="modelValueRef"
      @item-select="onItemSelect"
      @keydown.enter.prevent.stop="onEnter"
      class="search-column-filter"
      :placeholder="props.placeholder"
      :suggestions="suggestionsRef"
      @complete="doComplete"
      pt:pcInputText:root="ps-7"
    />
    <InputText
      v-else
      v-model="modelValueRef"
      @keydown.enter.prevent.stop="onEnter"
      class="search-column-filter"
      :placeholder="placeholder"
      pt:root="ps-7"
    />
  </div>
</template>

<script setup lang="ts">
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FilterElementProps } from "@/types/internal/component/table";
import { debounceLeading } from "@/composables/debounce";
import AutoComplete from "@/volt/AutoComplete.vue";
import InputText from "@/volt/InputText.vue";
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import { computed, type ComputedRef, type ModelRef, ref, type Ref } from "vue";

const suggestionsRef: Ref<string[]> = ref<string[]>([]);

function onItemSelect(): void {
  matchModeRef.value = "equals";
}

const isExact = computed(() => matchModeRef.value === "equals");

const onEnter = debounceLeading((): void => {
  matchModeRef.value = matchModeRef.value === "equals" ? "contains" : "equals";
});

const computedAutoCompleteDataRef: ComputedRef<[string, string][]> = computed<
  [string, string][]
>(() => {
  const autoCompleteField: keyof TransformedAttendeeInfo | null =
    props.autoCompleteField;
  if (autoCompleteField === null || !autoCompleteDataRef.value) {
    return [];
  }
  const autoCompleteData: string[] = <string[]>(
    autoCompleteDataRef.value
      .map((item: TransformedAttendeeInfo) => item[autoCompleteField])
      .filter((value: any) => value != null)
  );
  let uniqueAutoCompleteData: Map<string, string> = new Map<string, string>();
  autoCompleteData.forEach((entry: string) => {
    uniqueAutoCompleteData.set(entry, entry?.toLowerCase() || entry);
  });
  return Array.from(uniqueAutoCompleteData.entries());
});

async function doComplete(event: AutoCompleteCompleteEvent): Promise<void> {
  const query: string = event.query.toLowerCase();
  suggestionsRef.value = computedAutoCompleteDataRef.value
    .filter(([_showEntry, searchEntry]: [string, string]) =>
      searchEntry.startsWith(query)
    )
    .map(([showEntry, _searchEntry]: [string, string]) => showEntry);
}

interface Props extends FilterElementProps {
  placeholder: string;
  autoCompleteField: keyof TransformedAttendeeInfo | null;
}
const props: Props = defineProps<Props>();
const modelValueRef: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
const matchModeRef: ModelRef<string | null> = defineModel<string | null>(
  "matchMode",
  {
    required: true,
  }
);
const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[] | undefined> =
  defineModel<TransformedAttendeeInfo[]>("autoCompleteData", {
    required: true,
  });
</script>
