<template>
  <div v-if="(autoCompleteDataRef?.length || -1) > 0">
    <AutoComplete
      v-model="modelValueRef"
      @item-select="onItemSelect"
      class="search-column-filter"
      :placeholder="props.placeholder"
      :suggestions="suggestionsRef"
      @complete="doComplete"
    />
  </div>
  <div v-else>
    <InputText
      v-model="modelValueRef"
      class="search-column-filter"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FilterElementProps } from "@/types/internal/component/table";
import AutoComplete from "@/volt/AutoComplete.vue";
import InputText from "@/volt/InputText.vue";
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import { computed, type ComputedRef, type ModelRef, ref, type Ref } from "vue";

const suggestionsRef: Ref<string[]> = ref<string[]>([]);

function onItemSelect(): void {
  matchModeRef.value = "equals";
}

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
